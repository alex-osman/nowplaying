import { weekFilter } from './filters';
import { reportOptions } from './classes/reportOptions';

const dateformat = require('dateformat')
import { Report } from './classes/report'
import { settings } from './settings';

const getRankings = (report: Report) => report.users
    .map(user => Object.assign({}, user, { totalVotes: user.posts.map(post => post.votes).reduce((totalVotes, votes) => totalVotes + votes, 0) }))
    .sort((a, b) => b.posts.length - a.posts.length || b.totalVotes - a.totalVotes)
    .reduce((str, user, index) => `${str}${index + 1} | @${user.username} | ${user.posts.length > report.reportOptions.week ? report.reportOptions.week : user.posts.length} | ${user.posts.reduce((prev, cur) => prev + cur.votes, 0)}\n`, '')

const center = (str: string) => `<center>${str}</center>`

const startTitle = (report: Report): Report => {
    report.post.body = `${report.post.body}# ${center(`Now Playing: Week ${report.reportOptions.week} (${dateformat(report.reportOptions.startWeek, 'mmm d')} - ${dateformat(report.reportOptions.endWeek, 'mmm d')})`)}`
    return report
}
const endTitle = (report: Report): Report => {
    report.post.body = `${report.post.body}# ${center(`Now Playing Recap: Week ${report.reportOptions.week} (${dateformat(report.reportOptions.startWeek, 'mmm d')} - ${dateformat(report.reportOptions.endWeek, 'mmm d')})`)}`
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

const spotify = (report: Report): Report => {
    report.post.body = `${report.post.body}\n## ${center(`[Spotify Playlist](${report.reportOptions.spotifyLink})`)}\n${center(`[![](${report.reportOptions.spotifyImg})](${report.reportOptions.spotifyLink})`)}`
    return report
}

const payout = (report: Report): Report => {
    report.post.body = `${report.post.body}\n ${center(`Week ${report.reportOptions.week} Contestants`)}\n${center(`We had a total payout of about ${report.reportOptions.payout} STEEM, which will be powered up to all ${report.users.length} contestants.  That's about ${parseInt(String(report.reportOptions.payout / report.users.length * 100)) / 100} SP per person!`)}`
    return report
}

const contestants = (report: Report): Report => {
    report.post.body = `${report.post.body}\n${center(`${report.users.reduce((str, user, index) => `${str}[${user.username}](steemit.com/nowplaying/@${user.username}/${user.posts[0].permlink})${index === report.users.length-1 ? '!' : ', '}`, '')}`)}`
    return report
}

const leaderboard = (report: Report): Report => {
    report.post.body = `${report.post.body}\n## ${center(`Leaderboards`)}\nRank | User | Weeks | Votes\n-|-|-|-\n${getRankings(report)}`
    return report
}


export const reportRecap = (_users) => {
    const report = new Report()
    report.reportOptions.week = settings.week
    report.reportOptions.startWeek = new Date(2018, 0, (report.reportOptions.week - 1) * 7)
    report.reportOptions.endWeek = new Date(2018, 0, (report.reportOptions.week) * 7 - 1)
    report.reportOptions.payout = settings.payout
    report.reportOptions.spotifyLink = 'https://open.spotify.com/user/1240132288/playlist/2bMoA2zdj1Ij7B0NNPyG0c'
    report.reportOptions.spotifyImg = 'https://steemitimages.com/DQmYFnWjYgyagcjKY37S6dVSSkeutHmUVNvgFWRnDBrpdb1/image.png'

    report.users = _users.filter(user => user.username != 'nowplaying-music')//.filter(weekFilter(report.reportOptions.week))
    report.post.author = settings.username
    report.post.body = ''
    report.post.permlink = `nowplaying-recap-week-${report.reportOptions.week}`
    report.post.jsonMetadata.app = settings.communityName
    report.post.jsonMetadata.tags = settings.tags
    report.post.title = `Spotify Playlist: Week ${report.reportOptions.week} (${dateformat(report.reportOptions.startWeek, 'mmm d')} - ${dateformat(report.reportOptions.endWeek, 'mmm d')})`
    return leaderboard(contestants(payout(spotify(subtitle(endTitle(report))))))
}

export const reportStartWeek = (_users) => {
    const report = new Report()
    report.reportOptions.week = settings.week
    report.reportOptions.startWeek = new Date(2018, 0, (report.reportOptions.week - 1) * 7)
    report.reportOptions.endWeek = new Date(2018, 0, (report.reportOptions.week) * 7 - 1)
    report.users = _users.filter(user => user.username != 'nowplaying-music')
    report.post.author = settings.username
    report.post.body = ''
    report.post.permlink = `nowplaying-week-${report.reportOptions.week}`
    report.post.jsonMetadata.app = settings.communityName
    report.post.jsonMetadata.tags = settings.tags
    report.post.title = `Now Playing: Week ${report.reportOptions.week} (${dateformat(report.reportOptions.startWeek, 'mmm d')} - ${dateformat(report.reportOptions.endWeek, 'mmm d')})`

    return leaderboard(rules(logo(subtitle(startTitle(report)))))
}
