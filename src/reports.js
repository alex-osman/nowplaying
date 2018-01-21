import { getPosts } from './api'
import { weekFilter } from './filters'
import { getUserPosts, getUsers } from './database'
import dateformat from 'dateformat'
import ncp from 'copy-paste'

export const getContestants = (data) => getPosts()
  .then(posts => posts.filter(p => !['nowplaying-music'].includes(p.author)))
  .then(posts => posts.filter(weekFilter(data.week)))
  .then(posts => posts.filter((p, i) => posts.indexOf(p) === i))
  .then(posts => posts.sort((a, b) => new Date(a.created) + new Date(b.created)))

export const report = (data) => getPosts()
  .then(posts => posts.filter(p => !['walnut1', 'nowplaying-music'].includes(p.author)))
  .then(posts => posts.filter(weekFilter(data.week)))
  .then(posts => posts.sort((a, b) => new Date(a.created) - new Date(b.created)))
  .then(posts => posts.map((post, index) => `${index}) [${post.author}](steemit.com/nowplaying/@${post.author}/${post.permlink})`))
  // .then(posts => posts.forEach(post => console.log(post)))

export const payments = (data) => getPosts()
  .then(posts => posts.filter(p => !['walnut1', 'nowplaying-music'].includes(p.author)))
  .then(posts => posts.filter(weekFilter(data.week)))
  .then(posts => posts.filter((p, i) => posts.indexOf(p) === i))
  .then(posts => posts.sort((a, b) => new Date(a.created) - new Date(b.created)))
  //.then(posts => posts.forEach(post => console.log(post)))

export const newWeek = async (data) => {
  const { week, payout } = data
  const start = dateformat(new Date(2017, 0, (week-1) * 7), 'mmm d')
  const end = dateformat(new Date(2017, 0, (week) * 7 - 1), 'mmm d')
  const users = await getUsers()
  const posts = await getContestants({ week: week })
  let contestants = posts.map(post => `[${post.author}](steemit.com/nowplaying/@${post.author}/${post.permlink})`)
    
  let body = `# <center>Steemit Now Playing: Week ${week} (${start} - ${end})</center>
<center>__Now Playing__ is a way to share what you are listening to this week with others</center>

![](https://steemitimages.com/DQmeUqpd5RJbEUEkdTHqYBZYmcA137fUq4FX5nTN6yBuscW/image.png)

## <center>Steemit Now Playing Rules</center>

| Week ${week} spans from Sun. ${start} to Sat. ${end}
| -
| #nowplaying must be the first tag
| __Now Playing Week ${week}__ must be in the title of your post
| Add a link to your post in the comments of this post
| Upvote this post and at least one other #nowplaying entry

## <center>Rewards</center>
| Rewards from this post will be split among all contestants
| -
| Contestants are anyone who follows all of the above rules

## <center>Leaderboards</center>
Rank | User | Weeks | Votes
-|-|-|-
${users.sort((a, b) => b.posts - a.posts || b.votes - a.votes || a.username > b.username).reduce((str, user, index) => `${str}${index + 1} | ${user.username} | ${user.posts > week ? week : user.posts} | ${user.votes}\n`, '')}

# <center>Get your entries in by Sun. ${end}!</center></center>`
  ncp.copy(body, () => console.log('Copied to clipboard'))
  return body
}

export const recap = async (data) => {
  const { week, payout } = data
  const start = dateformat(new Date(2017, 0, (week-1) * 7), 'mmm d')
  const end = dateformat(new Date(2017, 0, (week) * 7 - 1), 'mmm d')
  const users = await getUsers()
  const posts = await getContestants({ week: week })
  let contestants = posts.map(post => `[${post.author}](steemit.com/nowplaying/@${post.author}/${post.permlink})`)

  let body = `# <center>Steemit Now Playing: Week ${week} (${start} - ${end}) Recap</center>
<center>__Now Playing__ is a way to share what you are listening to this week with others</center>

![](https://steemitimages.com/DQmeUqpd5RJbEUEkdTHqYBZYmcA137fUq4FX5nTN6yBuscW/image.png)

## <center>Week ${week} Contestants</center>
We had a total payout of about ${payout} STEEM, which has been powered up to all ${contestants.length} contestants. That's about ${parseInt(payout / contestants.length * 100) / 100} SP per person!
<center>${contestants.reduce((str, contestant, index) => `${str}${contestant}${index === contestants.length-1 ? '!' : ', '}`, '')}

## <center>[Spotify Playlist](https://open.spotify.com/user/1240132288/playlist/6kgL9m3OVcSn2gN4XnwHAk)</center>
<center>Great idea @popsoz!</center>
![](https://steemitimages.com/DQmZFNCeBrjyL4cJanf6XSVg1CWMF9jjMaVaBQANqKhH4WQ/image.png)

## <center>Leaderboards</center>
Rank | User | Weeks | Votes
-|-|-|-
${users.sort((a, b) => b.posts - a.posts || b.votes - a.votes || a.username > b.username).reduce((str, user, index) => `${str}${index + 1} | ${user.username} | ${user.posts > week ? week : user.posts} | ${user.votes}\n`, '')}`
  ncp.copy(body, () => console.log('Copied to clipboard'))
  return body
}