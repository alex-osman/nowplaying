import { User } from './classes/user';

const dateformat = require('dateformat')
import { Report } from './classes/report'

const getRankings = (report: Report): string[] => report.users
    .map(user => Object.assign({}, user, { totalVotes: user.posts.map(post => post.votes).reduce((totalVotes, votes) => totalVotes + votes, 0) }))
    .sort((a, b) => b.posts.length - a.posts.length || b.totalVotes - a.totalVotes)
    .reduce((str, user, index) => str.concat({ text: `${index + 1} | ${user.posts.length > report.reportOptions.week ? report.reportOptions.week : user.posts.length} | ${user.posts.reduce((prev, cur) => prev + cur.votes, 0)}\n`, author: user.username }), [])
    // .reduce((str, user, index) => str.concat(`${index + 1} | @${user.username} | ${user.posts.length > report.reportOptions.week ? report.reportOptions.week : user.posts.length} | ${user.posts.reduce((prev, cur) => prev + cur.votes, 0)}\n`), [])

export const playerStats = (users: User[], username: string) => getRankings({ users, reportOptions: { week: 5}} as Report).find(x => x.author === username).text
    // getRankings({users, reportOptions: {week: 5}} as Report).find(str => str.includes(`@${username}`))

const center = (str: string) => `<center>${str}</center>`

const startTitle = (report: Report): Report => {
    report.post.body = `${report.post.body}# ${center(`Now Playing: Week ${report.reportOptions.week} (${dateformat(report.reportOptions.startWeek, 'mmm d')} - ${dateformat(report.reportOptions.endWeek, 'mmm d')})`)}`
    return report
}
// const endTitle = (report: Report): Report => {
//     report.post.body = `${report.post.body}# ${center(`Now Playing Recap: Week ${week} (${dateformat(startWeek, 'mmm d')} - ${dateformat(endWeek, 'mmm d')})`)}`
//     return report
// }

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

| Week ${report.reportOptions.week} spans from Sun. ${dateformat(report.reportOptions.startWeek, 'mmm d')} to Sat. ${dateformat(report.reportOptions.endWeek, 'mmm d')}
| -
| #nowplaying must be the first tag
| __Now Playing Week ${report.reportOptions.week}__ must be in the title of your post
| Add a link to your post in the comments of this post
| Upvote this post and at least one other #nowplaying entry

## <center>Rewards</center>
| Rewards from this post will be split among all contributors equally
| -
| A contributor is anyone who follows all of the above rules
`
    return report
}

// const spotify = (report: Report): Report => {
//     report.post.body = `${report.post.body}\n## ${center(`[Spotify Playlist](${spotifyLink})`)}\n${center(`[![](${spotifyImg})](${spotifyLink})`)}`
//     return report
// }

// const payout = (report: Report): Report => {
//     report.post.body = `${report.post.body}\n ${center(`Week ${week} Contestants`)}\n${center(`We had a total payout of about ${steem} STEEM, which will be powered up to all ${report.users.length} contestants.  That's about ${parseInt(String(steem / report.users.length * 100)) / 100} SP per person!`)}`
//     return report
// }

// const contestants = (report: Report): Report => {
//     report.post.body = `${report.post.body}\n${center(`${report.users.reduce((str, user, index) => `${str}[${user.username}](steemit.com/nowplaying/@${user.username}/${user.posts[0].permlink})${index === report.users.length-1 ? '!' : ', '}`, '')}`)}`
//     return report
// }

const leaderboard = (report: Report): Report => {
    report.post.body = `${report.post.body}\n## ${center(`Leaderboards`)}\nRank | User | Weeks | Votes\n-|-|-|-\n${getRankings(report)}`
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
    report.reportOptions.week = 6
    report.reportOptions.startWeek = new Date(2018, 0, (report.reportOptions.week - 1) * 7)
    report.reportOptions.endWeek = new Date(2018, 0, (report.reportOptions.week) * 7 - 1)
    report.users = _users.filter(user => user.username != 'nowplaying-music')
    report.post.author = 'nowplaying-music'
    report.post.body = ''
    report.post.permlink = `nowplaying-week-${report.reportOptions.week}`
    report.post.jsonMetadata.app = 'nowplaying'
    report.post.jsonMetadata.tags = ['nowplaying', 'music', 'contest', 'share', 'spotify']
    report.post.title = `Now Playing: Week ${report.reportOptions.week} (${dateformat(report.reportOptions.startWeek, 'mmm d')} - ${dateformat(report.reportOptions.endWeek, 'mmm d')})`

    return leaderboard(rules(logo(subtitle(startTitle(report)))))
}

