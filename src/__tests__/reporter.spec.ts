import { initializeReport, leaderboard, contestants, payout, spotify, getNumVotes } from "../reporter";
import { User } from "../classes/user";
import { settings } from "../settings";

const users: User[] = [{
    username: 'user1',
    posts: [{
        id: 3,
        author: 'user1',
        permlink: 'nowplaying-week-10',
        created: new Date(2018, 0, 57).getTime(),
        is_approved: true,
        votes: 15
    }]
}]

describe('Reporter Functions', () => {
    it('getNumVotes', () => {
        const x = getNumVotes(users[0].posts)
        expect(x).toBe(15)

    })
})

describe('Reporter Post Body', () => {
    it('initializes a postweek report', () => {
        const report = initializeReport(users, true)

        expect(report).toBeTruthy()
        expect(settings.week()).toBe(10)
        expect(report.post.title).toBe(`Now Playing: Week 9 (Feb 25 - Mar 3)`)
    })

    it('initializes a recap report', () => {
        const report = initializeReport(users)

        expect(report).toBeTruthy()
        expect(settings.week()).toBe(10)
        expect(report.post.title).toBe(`Spotify Playlist: Week 9 (Feb 25 - Mar 3)`)
    })

    it('runs leaderboard correctly', () => {
        const report = initializeReport(users)
        leaderboard(report)
        expect(report.post.body).toBe(`
## <center>Leaderboards</center>
Rank | User | Weeks | Votes (per post)
-|-|-|-
1 | @user1 | 1 | 15`
        )
    })

    it('runs contestants correctly', () => {
        const report = initializeReport(users)
        contestants(report)
        expect(report.post.body).toBe(`
<center>[user1](steemit.com/nowplaying/@user1/nowplaying-week-10)!</center>`
        )
    })

    it('runs payout correctly', () => {
        const report = initializeReport(users)
        payout(report)
        expect(report.post.body).toBe(`
<center>Week 9 Contestants</center>
<center>We had a total payout of about ${settings.payout} STEEM, which will be powered up to all 1 contestants.  That's about ${settings.payout} SP per person!</center>`)
    })

    it('runs spotify correctly', () => {
        const report = initializeReport(users)
        spotify(report)
        expect(report.post.body).toBe(`
## <center>[Spotify Playlist](${report.reportOptions.spotifyLink})</center>
<center>[![](${report.reportOptions.spotifyImg})](${report.reportOptions.spotifyLink})</center>`
        )
    })
});