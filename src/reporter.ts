
const dateformat = require('dateformat')
// import { getUsers } from "./database";
import { User } from './user'
import { Report } from './Report';

const steem = 4.124
const spotifyLink = 'https://open.spotify.com/user/1240132288/playlist/4tPNWYmR9liqIS1YgMVClv?si=9KJO_Ap2Th-P4Bivv-37cg'
const spotifyImg = 'https://steemitimages.com/DQmVQbXpqHthPR7n2gfcvM4yaUKoez1HRojDNnDA9YqWTpR/image.png'
const week = 6
const startWeek = new Date(2018, 0, (week - 1) * 7)
const endWeek = new Date(2018, 0, (week) * 7 - 1)

const getRankings = (users: User[]) => users
    .map(user => Object.assign({}, user, { totalVotes: user.posts.map(post => post.votes).reduce((totalVotes, votes) => totalVotes + votes, 0) }))
    .sort((a, b) => b.posts.length - a.posts.length || b.totalVotes - a.totalVotes)
    .reduce((str, user, index) => `${str}${index + 1} | @${user.username} | ${user.posts.length > week ? week : user.posts.length} | ${user.posts.reduce((prev, cur) => prev + cur.votes, 0)}\n`, '')

const center = (str: string) => `<center>${str}</center>`

const startTitle = (report: Report): Report => {
    report.post.body = `${report.post.body}# ${center(`Now Playing: Week ${week} (${dateformat(startWeek, 'mmm d')} - ${dateformat(endWeek, 'mmm d')})`)}`
    return report
}
const endTitle = (report: Report): Report => {
    report.post.body = `${report.post.body}# ${center(`Now Playing Recap: Week ${week} (${dateformat(startWeek, 'mmm d')} - ${dateformat(endWeek, 'mmm d')})`)}`
    return report
}

const subtitle = (report: Report): Report => {
    report.post.body = `${report.post.body}\n${center(`\`Now Playing\` is a way to share what you're listening to this week with others.`)}`
    return report
}
const logo = (report: Report): Report => {
    report.post.body = `${report.post.body}\n![](https://steemitimages.com/DQmeUqpd5RJbEUEkdTHqYBZYmcA137fUq4FX5nTN6yBuscW/image.png)`
    return report
}

const rules = (report: Report): Report => {
    report.post.body = `${report.post.body}\n## <center>Steemit Now Playing Rules</center>

| Week ${week} spans from Sun. ${dateformat(startWeek, 'mmm d')} to Sat. ${dateformat(endWeek, 'mmm d')}
| -
| #nowplaying must be the first tag
| __Now Playing Week ${week}__ must be in the title of your post
| Add a link to your post in the comments of this post
| Upvote this post and at least one other #nowplaying entry

## <center>Rewards</center>
| Rewards from this post will be split among all contestants
| -
| Contestants are anyone who follows all of the above rules
`
    return report
}

const spotify = (report: Report): Report => {
    report.post.body = `${report.post.body}\n## ${center(`[Spotify Playlist](${spotifyLink})`)}\n${center(`[![](${spotifyImg})](${spotifyLink})`)}`
    return report
}

const payout = (report: Report): Report => {
    report.post.body = `${report.post.body}\n ${center(`Week ${week} Contestants`)}\n${center(`We had a total payout of about ${steem} STEEM, which will be powered up to all ${report.users.length} contestants.  That's about ${parseInt(String(steem / report.users.length * 100)) / 100} SP per person!`)}`
    return report
}

const contestants = (report: Report): Report => {
    report.post.body = `${report.post.body}\n${center(`${report.users.reduce((str, user, index) => `${str}[${user.username}](steemit.com/nowplaying/@${user.username}/${user.posts[0].permlink})${index === report.users.length-1 ? '!' : ', '}`, '')}`)}`
    return report
}

const leaderboard = (report: Report): Report => {
    report.post.body = `${report.post.body}\n## ${center(`Leaderboards`)}\nRank | User | Weeks | Votes\n-|-|-|-\n${getRankings(report.users)}`
    return report
}


// export const reportRecap = (_users) => {
//     users = _users.filter(user =>
//         user.posts.find(post => new Date(post.created).getTime() > startWeek.getTime())
//         && user.posts.find(post => new Date(post.created).getTime() < endWeek.getTime())
//     ).filter(user => user.username != 'nowplaying-music')
//     return leaderboard(contestants(payout(spotify(subtitle(startTitle())))))
// }

export const reportStartWeek = (_users) => {
    const report = new Report()
    report.users = _users.filter(user => user.username != 'nowplaying-music')
    report.post.author = 'nowplaying-music'
    report.post.body = ''
    report.post.jsonMetadata.app = 'nowplaying'
    report.post.jsonMetadata.tags = ['nowplaying', 'music', 'contest', 'share', 'spotify']
    report.post.title = `Now Playing: Week ${week} (${dateformat(startWeek, 'mmm d')} - ${dateformat(endWeek, 'mmm d')})`

    return leaderboard(rules(logo(subtitle(startTitle(report)))))
}