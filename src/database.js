const mysql = require('mysql');
import { getPosts, getPost } from './api'
import { weekFilter } from './filters'
import { vote, comment } from './broadcasts'

// Database setup
const local = {
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'nowplaying'
  };
  
  const connection = mysql.createConnection(local, (err, res) => {
    throw err
  })
  
let USERS = []


export const addPost = post => {
    return new Promise((resolve, reject) => {
        // Insert into database
        connection.query('INSERT INTO posts SET ?', [post], (err, response) => {
            if (err) {
                console.log(post.author, 'post already in db')
                resolve({error: true, post: post})
            } else {
                // Insert author
                connection.query('INSERT INTO users set username=?', [post.author], (err, response) => {
                    if (err) {
                        console.log(post.author, 'author already in db')
                        resolve({error: true, post: post})
                    }
                    // Add experience to author
                    connection.query('UPDATE users SET xp = xp + 5 WHERE username=?', [post.author], (err, response) => {
                        // Yay!
                        if (err) {
                            resolve({error: true, post: post})
                        } else {
                            resolve({error: false, post: post})
                        }
                    })
                })
            }
        })
    })
}

export const scrape = (props) => getPosts()
  .then(posts => posts.filter(p => !['nowplaying-music'].includes(p.author)))
  .then(posts => posts.filter(weekFilter(props.week)))
  .then(posts => Promise.all(posts.map(addPost)))
  .then(allPosts => {
    console.log('total posts', allPosts.length)
    return allPosts.filter(post => !post.error)
  }).then(validPosts => {
    console.log('valid posts', validPosts.length)
    if (props.vote) {
        validPosts.forEach((data, index) => setTimeout(() => vote(data.post), 5000*index))
    }
    return validPosts
  })
  .then(validPosts => {
    if (props.comment) {
        validPosts.forEach((data, index) => setTimeout(() => comment(data.post), 25000*index))
    }
    return validPosts
  })
  .catch(y => console.log('invalid', y))
  
export const getUserPosts = () => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT author, COUNT(permlink) AS num FROM posts GROUP BY author', (err, users) => resolve(users))
    })
}

export const getDBPosts = () => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM posts', (err, users) => {
            return resolve(users)
        })
    })
}

export const getUsers = () => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM users INNER JOIN posts ON posts.author=users.username', (err, users) => {
            resolve(setUsers(users))
        })
    })
}

const setUsers = (data) => data.map(d => ({
    username: d.author,
    votes: d.votes,
    posts: 1
})).reduce((users, post) => {
    const user = users.find(user => user.username === post.username)
    if (user) {
        user.votes += post.votes,
        user.posts++
    } else {
        users.push(post)
    }
    return users
}, USERS)

export const insertVote = (post) => new Promise((resolve, reject) => {
    connection.query('UPDATE posts SET votes=? WHERE author=? AND permlink=?', [post.votes, post.author, post.permlink], (err, result) => {
        if (err)
            throw err
        console.log('Updated vote')
    })
})

export const scrapeVotes = () => getDBPosts()
    .then(posts => posts.map(post => ({
        author: post.author,
        permlink: post.permlink
    })))
    .then(posts => Promise.all(posts.map(post => getPost(post))))
    .then(posts => posts.map(post => ({
        author: post.author,
        permlink: post.permlink,
        votes: post.active_votes.length
    })))
    .then(x => x.map(insertVote))

// scrapeVotes()