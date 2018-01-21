const express = require('express');
const mysql = require('mysql');

const app = express();

const local = {
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'nowplaying'
};

const connection = mysql.createConnection(local, (err, res) => {
  throw err
})

app.get('/users', (req, res) => {
  connection.query('SELECT * FROM users', (err, data) => {
    res.send(data)
  })
})

app.get('/posts', (req, res) => {
  connection.query('SELECT * FROM posts', (err, data) => {
    res.send(data)
  })
})

app.listen(3000, () => console.log('server running'))

const getOrCreateUser = (username) => {
  return new Promise(resolve => {
    connection.query('SELECT * FROM users WHERE username=?', [username], (err, data) => {
      if (data.length <= 0) {
        // add the user
        connection.query('INSERT INTO users SET username=?', [username], (err, data) => {
          console.log(err, data)
          resolve({
            username,
            xp: 0
          })
        })
      } else {
        // return the user info
        resolve(data[0])
      }
    })
  })
}

const addPost = (post, user) => {
  connection.query('INSERT INTO posts SET ?', [{ url: post.url }], (err, data) => {
    console.log(err, data)
    addXp(user)
  })
}

const addXp = (user) => {
  connection.query('UPDATE users SET ? WHERE username=?', [{ xp: (user.xp + 5)}, user.username])
}

const isVisited = (post) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM posts WHERE url=?', [post.url], (err, data) => {
      resolve(data.length > 0)
    })
  })
}

/**
 * Analyze a post and check if unique
 */
const processPost = async (post) => {
  console.log(post)
  const visited = await isVisited(post)
  if (!visited) {
    const user = await getOrCreateUser(post.username)
    console.log('got user:', user)
    addPost(post, user)
  }
}

// TODO: Fill this in with real steem data
const getNowPlayingPosts = () => {
  return new Promise(resolve => resolve(
    [
      {
        username: 'louie-jr',
        url: '1'
      }, {
        username: 'jrovner',
        url: '2'
      }, {
        username: 'popsoz',
        url: '3',
      }, {
        username: 'kalam',
        url: '4'
      }
    ]
  ))
}

const poll = () => {
  console.log('s')
  getNowPlayingPosts()
  .then(posts => posts.forEach(processPost))
}

const payouts = (sbd) => {
  const WEEK = 1000*60*60*24*7
  const YEAR_2018 = new Date(2018, 0).getTime()
  const currentWeek = 0

  const startTime = new Date(YEAR_2018 + (WEEK * currentWeek))
  const endTime = new Date(startTime + WEEK)

  q = connection.query('SELECT * FROM posts', (err, users) => {
    const payout = sbd / users.length
    console.log('each', payout)
  })
  console.log(q.sql)
}

payouts(1.219737122)
