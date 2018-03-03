import { getWeek } from './functions';
import { Post } from './classes/post';
import { weekFilter } from './filters';

const dateformat = require('dateformat')
import { Report } from './classes/report'
import { settings } from './settings';

const getNumWeeks = (posts: Post[]): number => posts
    // Map each post to its week #
    .map(post => getWeek(new Date(post.created)))
    // Remove duplicates
    .filter((num, index, arr) => index === arr.indexOf(num))
    // Return number of weeks
    .length

const getNumVotes = (posts: Post[]): number => posts.map(p => p.is_approved ? p.votes : 0).reduce((prev, curr) => prev + curr, 0)

const getRankings = (report: Report): string => report.users
    .map(user => ({
        username: `@${user.username}`,
        weeks: getNumWeeks(user.posts),
        votes: getNumVotes(user.posts)
    }))
    // Sort by weeks, then votes
    .sort((a, b) => b.weeks - a.weeks || b.votes - a.votes)
    // Reduce into one large string
    .reduce((str, user, index) => `${str}\n${index+1} | ${user.username} | ${user.weeks} | ${user.votes}`, '')

// export const playerStats = (users: User[], username: string) => getRankings({ users, reportOptions: { week: 5}} as Report).find(x => x.author === username).text
    // getRankings({users, reportOptions: {week: 5}} as Report).find(str => str.includes(`@${username}`))

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
    const users = report.users.filter(weekFilter(settings.week))
    report.post.body = `${report.post.body}\n ${center(`Week ${report.reportOptions.week} Contestants`)}\n${center(`We had a total payout of about ${report.reportOptions.payout} STEEM, which will be powered up to all ${users.length} contestants.  That's about ${parseInt(String(report.reportOptions.payout / users.length * 1000)) / 1000} SP per person!`)}`
    return report
}

const contestants = (report: Report): Report => {
    const users = report.users.filter(weekFilter(settings.week))
    report.post.body = `${report.post.body}\n${center(`${users.reduce((str, user, index) => `${str}[${user.username}](steemit.com/nowplaying/@${user.username}/${user.posts[user.posts.length - 1].permlink})${index === users.length-1 ? '!' : ', '}`, '')}`)}`
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
    report.reportOptions.spotifyLink = 'https://open.spotify.com/user/1240132288/playlist/17uu5RLiigAv9sdqowWeSX'
    report.reportOptions.spotifyImg = 'https://steemitimages.com/DQmSjkZSDVmVWMHW9XXEVS5j54fxZ6z8pzh1QrGxvU5qseo/image.png'

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