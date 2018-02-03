
const dateformat = require('dateformat')
// import { getUsers } from "./database";
import { User } from './user'

const steem = 4.124
const spotifyLink = 'https://open.spotify.com/user/1240132288/playlist/4tPNWYmR9liqIS1YgMVClv?si=9KJO_Ap2Th-P4Bivv-37cg'
const spotifyImg = 'https://steemitimages.com/DQmVQbXpqHthPR7n2gfcvM4yaUKoez1HRojDNnDA9YqWTpR/image.png'
const week = 6
const startWeek = new Date(2018, 0, (week - 1) * 7)
const endWeek = new Date(2018, 0, (week) * 7 - 1)
let users: User[] = []

const getRankings = () => users
    .sort((a, b) => b.posts - a.posts || b.votes - a.votes || a.username > b.username)
    .reduce((str, user, index) => `${str}${index + 1} | @${user.username} | ${user.posts.length > week ? week : user.posts.length} | ${user.posts.reduce((prev, cur) => prev + cur.votes, 0)}\n`, '')

const center = (str: string) => `<center>${str}</center>`

const startTitle = () => `# ${center(`Now Playing: Week ${week} (${dateformat(startWeek, 'mmm d')} - ${dateformat(endWeek, 'mmm d')})`)}`
const endTitle = () => `# ${center(`Now Playing Recap: Week ${week} (${dateformat(startWeek, 'mmm d')} - ${dateformat(endWeek, 'mmm d')})`)}`

const subtitle = (str: string) => `${str}\n${center(`\`Now Playing\` is a way to share what you're listening to this week with others.`)}`
const logo = (str: string) => `${str}\n![](https://steemitimages.com/DQmeUqpd5RJbEUEkdTHqYBZYmcA137fUq4FX5nTN6yBuscW/image.png)`

const rules = (str: string) => `${str}\n## <center>Steemit Now Playing Rules</center>

| Week ${week} spans from Sun. ${dateformat(startWeek, 'mmm d')} to Sat. ${dateformat(endWeek, 'mmm d')}
| -
| #nowplaying must be the first tag
| __Now Playing Week 5__ must be in the title of your post
| Add a link to your post in the comments of this post
| Upvote this post and at least one other #nowplaying entry

## <center>Rewards</center>
| Rewards from this post will be split among all contestants
| -
| Contestants are anyone who follows all of the above rules
`

const spotify = (str: string) => `${str}\n## ${center(`[Spotify Playlist](${spotifyLink})`)}\n${center(`[![](${spotifyImg})](${spotifyLink})`)}`

const payout = (str: string) => `${str}\n ${center(`Week ${week} Contestants`)}\n${center(`We had a total payout of about ${steem} STEEM, which will be powered up to all ${users.length} contestants.  That's about ${parseInt(steem / users.length * 100) / 100} SP per person!`)}`

const contestants = (str: string) => `${str}\n${center(`${users.reduce((str, user, index) => `${str}[${user.username}](steemit.com/nowplaying/@${user.username}/${user.posts[0].permlink})${index === users.length-1 ? '!' : ', '}`, '')}`)}`

const leaderboard = (str: string) => `${str}\n## ${center(`Leaderboards`)}\nRank | User | Weeks | Votes\n-|-|-|-\n${getRankings()}`


export const reportRecap = (_users) => {
    users = _users.filter(user =>
        user.posts.find(post => new Date(post.created).getTime() > startWeek.getTime())
        && user.posts.find(post => new Date(post.created).getTime() < endWeek.getTime())
    ).filter(user => user.username != 'nowplaying-music')
    return leaderboard(contestants(payout(spotify(subtitle(startTitle())))))
}

export const reportStartWeek = (_users) => {
    users = _users.filter(user =>
        user.posts.find(post => new Date(post.created).getTime() > startWeek.getTime())
        && user.posts.find(post => new Date(post.created).getTime() < endWeek.getTime())
    ).filter(user => user.username != 'nowplaying-music')
    return leaderboard(rules(logo(subtitle(startTitle()))))
}