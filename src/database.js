const mysql = require('mysql');
import { getPosts } from './api'
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
  .then(posts => posts.filter(p => !['walnut1', 'nowplaying-music'].includes(p.author)))
//   .then(posts => { console.log(posts); return posts })
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
  