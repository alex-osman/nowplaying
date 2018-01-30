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

export const getDBPosts = async (con) => {
  const posts = await con.query('SELECT * FROM posts');
  return posts.map(d => ({
    author: d.author,
    permlink: d.permlink,
    votes: d.votes,
    created: d.created,
    did_comment: d.did_comment,
    did_vote: d.did_vote
  }) as Post)
}

export const getPosts = (): Promise<Post[]> => new Promise((resolve, reject) => {
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
          votes: post.active_votes.length,
          did_comment: false,
          did_vote: false,
        }) as Post)
      )
    }
  })
})

/**
 * Writes given posts to the database
 * @param con connection to the database
 * @param posts array of posts to write to the database
 */
export const writePosts = async (con, posts: Post[]) => {
  try {
    const insertResponses: { post: Post, result: any }[] = await Promise.all(
      posts.map(async post => {
        let result = { err: true }
        try {
          result = await con.query('INSERT INTO posts SET ?', [post])
        } catch(e) {
          // console.log('error inserting prolly cause im there already')
        }
        return {
          post,
          result
        }
      })
    )
    const toUpdate = insertResponses.filter(res => !res.result.changedRows)
    const updateResponses = await Promise.all(toUpdate.map(async postObj => ({ post: postObj.post, result: await con.query('UPDATE posts SET votes=? WHERE author=? AND permlink=?', [postObj.post.votes, postObj.post.author, postObj.post.permlink])})))
    return {
      created: insertResponses.length - toUpdate.length,
      updated: updateResponses.filter(res => res.result.changedRows).length,
      total: insertResponses.length
    }
  } catch(e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return { already: "there" }
    } else {
      throw e
    }
  }
}

export const writeComment = async (con, post: Post) => {
  const res = await con.query('UPDATE posts SET did_comment=1 WHERE author=? AND permlink=?', [post.author, post.permlink])
=}
export const writeVote = async (con, post: Post) => {
  const res = await con.query('UPDATE posts SET did_vote=1 WHERE author=? AND permlink=?', [post.author, post.permlink])
}

export const getPost = (data) => new Promise((resolve, reject) => {
  steem.api.getContent(data.author, data.permlink, (err, result) => {
    resolve(result)
  });
})

export const updateComment = (con, post: Post) => (con.query('UPDATE posts SET did_comment=1') as Promise<{}>)