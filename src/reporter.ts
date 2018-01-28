
const dateformat = require('dateformat')
// import { getUsers } from "./database";
import { User } from './user'

const steem = 8
const spotifyLink = 'https://google.com'
const spotifyImg = 'https://images.com'
const week = 4
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

const spotify = (str: string) => `${str}\n## ${center(`[Spotify Playlist](${spotifyLink})`)}\n[![](${spotifyImg})](${spotifyLink})`

const payout = (str: string) => `${str}\n ${center(`Week ${week} Contestants`)}\nWe had a total payout of about ${steem} STEEM, which will be powered up to all ${users.length} contestants.  That's about ${parseInt(steem / users.length * 100) / 100} SP per person!`

const contestants = (str: string) => `${str}\n${users.reduce((str, user, index) => `${str}${user.username}${index === users.length-1 ? '!' : ', '}`, '')}`

const leaderboard = (str: string) => `${str}\n## ${center(`Leaderboards`)}\nRank | User | Weeks | Votes\n-|-|-|-\n${getRankings()}`


export const reportStartWeek = (_users) => {
    users = _users.filter(user => 
        user.posts.find(post => new Date(post.created).getTime() > startWeek.getTime())
        && user.posts.find(post => new Date(post.created).getTime() < endWeek.getTime())
    )
    return leaderboard(contestants(payout(spotify(subtitle(startTitle())))))
}
