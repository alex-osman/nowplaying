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
