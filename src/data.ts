import { Post } from './post';

const steem = require('steem')
steem.api.setOptions({
  url: 'wss://steemd-int.steemit.com'
});

export const getUsers = async (con) => {
  const users = await con.query('SELECT * FROM posts');
  return users.map(d => ({
    username: d.author,
    votes: d.votes,
    created: d.created,
    permlink: d.permlink
  })).reduce((users, post) => {
    const user = users.find(user => user.username === post.username)
    if (user) {
      user.posts.push(post)
    } else {
      users.push({
        username: post.username,
        posts: [post]
      })
    }
    return users
  }, [])
}

export const getPosts = () => new Promise((resolve, reject) => {
  steem.api.getDiscussionsByCreated({
    "tag": "nowplaying",
    "limit": 100
  }, (err, result) => {
    if (err) reject(err)
    else {
      resolve(
        result.map(post => ({
          author: post.author,
          permlink: post.permlink,
          created: post.created,
          votes: post.active_votes.length
        }))
      )
    }
  })
})

export const writePosts = async (con, posts: Post[]) => {
  const insertResponses: { post: Post, result: any }[] = await Promise.all(posts.map(async post => ({ post, result: await con.query('INSERT INTO posts SET ?', [post])})))
  console.log(insertResponses)
  const toUpdate = insertResponses.filter(res => !res.result.changedRows)
  console.log(toUpdate)
  const updateResponses = await Promise.all(toUpdate.map(async postObj => ({ post: postObj.post, result: await con.query('UPDATE posts SET votes=? WHERE author=? AND permlink=?', [postObj.post.votes, postObj.post.author, postObj.post.permlink])})))
  return {
    created: insertResponses.length - toUpdate.length,
    updated: toUpdate.length
  }
}

export const getPost = (data) => new Promise((resolve, reject) => {
  steem.api.getContent(data.author, data.permlink, (err, result) => {
    resolve(result)
  });
})