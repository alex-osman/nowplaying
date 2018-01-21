import { getPosts } from './api'
import { weekFilter } from './filters'

export const getContestants = (data) => getPosts()
  .then(posts => posts.filter(p => !['nowplaying-music'].includes(p.author)))
  .then(posts => posts.filter(weekFilter(data.weekNumber)))
  .then(posts => posts.filter((p, i) => posts.indexOf(p) === i))
  .then(posts => posts.sort((a, b) => new Date(a.created) - new Date(b.created)))

export const report = (data) => getPosts()
  .then(posts => posts.filter(p => !['walnut1', 'nowplaying-music'].includes(p.author)))
  .then(posts => posts.filter(weekFilter(data.weekNumber)))
  .then(posts => posts.sort((a, b) => new Date(a.created) - new Date(b.created)))
  .then(posts => posts.map((post, index) => `${index}) [${post.author}](steemit.com/nowplaying/@${post.author}/${post.permlink})`))
  // .then(posts => posts.forEach(post => console.log(post)))

export const payments = (data) => getPosts()
  .then(posts => posts.filter(p => !['walnut1', 'nowplaying-music'].includes(p.author)))
  .then(posts => posts.filter(weekFilter(data.weekNumber)))
  .then(posts => posts.filter((p, i) => posts.indexOf(p) === i))
  .then(posts => posts.sort((a, b) => new Date(a.created) - new Date(b.created)))
  //.then(posts => posts.forEach(post => console.log(post)))

export const newWeek = async (data) => {
  const { week, payout } = data
  console.log(week, payout, data)
  const start = new Date(2017, 0, week * 7)
  const end = new Date(2017, 0, (week+1) * 7 - 1)

  const posts = await getContestants({ week: week })
  let contestants = posts.map(post => post.author)
  
  console.log(contestants)
  
  let body = `# Steemit Now Playing: Week ${week} (${start} - ${end})
    \`Now Playing\` is a way to share what you are listening to this week with others. 
    
    ![](https://steemitimages.com/DQmeUqpd5RJbEUEkdTHqYBZYmcA137fUq4FX5nTN6yBuscW/image.png)
    
    ## Week ${week-1} Contestants
    ${contestants.reduce((str, contestant, index) => `${str}${index === contestants.length-1 ? '!' : ', '}`, '')}
    We had a total payout of ${payout} STEEM, which has been powered up to all contestants.
    That's about ${parseInt(payout / contestants.length * 100) / 100} SP per person!
    
    Below are the rules for your \`Week ${week} Now Playing\` entry.
    
    ## Steemit Now Playing Rules
    - Week ${week} spans from Sun. ${start} to Sat. ${end}
    - #nowplaying must be the first tag
    - \`Now Playing Week ${week}\` must be in the title of your post
    - Add a link to your post in the comments of this post
    - Upvote this post and at least one other #nowplaying entry
    
    ## Rewards
    - Rewards from this post will be split among all contestants
    - Contestants are anyone who follows all of the above rules
    
    Check out @jrovner's post for a template [here](https://steemit.com/nowplaying/@jrovner/now-playing-week-2)
    
    # Get your entries in by Sun. ${end}!`
  console.log(body)
  return body
}

newWeek({ week: 3, payout: 4 })