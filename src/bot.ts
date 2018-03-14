import { reportStartWeek, reportRecap } from './reporter';
import { Broadcaster } from './broadcaster/broadcaster';
import { Database } from './database/database'
import { BlockchainAPI } from './blockchainAPI/blockchainAPI'
import { User } from './classes/user';
import { weekFilter } from './filters';
import { Statistics } from './statistics';
import { Post } from './classes/post';
import { Report } from './classes/report';
import { Spotify } from './process/spotify';
const dateformat = require('dateformat')

const steem = require('steem')

// this should be a singleton
export class Bot {
    week: number;
    communityName: string; // nowplaying
    username: string;      // nowplaying-music
    password: string;
    users: User[];
    posts: Post[];

    private _broadcaster: Broadcaster;
    private _blockchainAPI: BlockchainAPI;
    private _database: Database;


    getPostingWif(): string {
        return steem.auth.toWif(this.username, this.password, 'posting')
    }

    getActiveWif(): string {
        return steem.auth.toWif(this.username, this.password, 'active')
    }

    setBroadcaster(broadcaster: Broadcaster): void {
        broadcaster.setCredentials(this.username, this.getPostingWif())
        this._broadcaster = broadcaster
    }

    setBlockchainAPI(blockchainAPI: BlockchainAPI) {
        this._blockchainAPI = blockchainAPI
    }

    async setDatabase(database: Database): Promise<void> {
        this._database = database
        await this._database.setup()
        this.users = await this._database.getUsers()
    }

    async scrape(): Promise<any> {
        console.log(`[${dateformat(new Date(), 'mmmm dS, h:MM:ss TT')}]`)
        console.log(`[Start Scraping]`)
        try {
            const allPosts = await this._blockchainAPI.getPosts(this.communityName)
            const results = await this._database.writePosts(allPosts)
            console.log(`- created: ${results.created}\n- updated: ${results.updated}`)
            await this.approve()
            await this.comment()
            await this.vote()
            
        } catch(e) {
            console.log(e)
            console.log('got err')
        }
        console.log('[End Scraping]')
    }

    async approve(): Promise<any> {
        const allPosts = await this._database.getPosts()
        const unapproved = allPosts.filter(post => !post.is_approved)

        const permlink = `${this.communityName}-week-${this.week}`
        const weekPost = await this._blockchainAPI.getPost({ author: this.username, permlink } as Post)
        const voters = weekPost.active_votes.map(vote => vote.voter)
        const toApprove = unapproved.filter(post => voters.includes(post.author))
        console.log('- approving', toApprove)
        this._database.approve(toApprove)


    }

    async comment(): Promise<any> {
        try {
            const allPosts = await this._database.getPosts()
            // Comment regardless of approved
            const toCommentPosts = allPosts.filter(post => !post.did_comment && post.is_approved)
            console.log('- commenting on', toCommentPosts)

            // Comment on each one with 20 second breaks
            toCommentPosts.forEach((post, index) => {
                setTimeout(async () => {
                    try {
                        await this._broadcaster.makeComment(post)
                        await this._database.writeComment(post)
                    } catch(e) {
                        console.log('err commenting')
                    }
                }, index * 22 * 1000)
            })
        } catch(e) {
            console.log('something went wrong', e)
        }
    }

    async vote(): Promise<any> {
        try {
            const allPosts = await this._database.getPosts()
            // Only vote on approved posts
            const toVotePosts = allPosts.filter(post => !post.did_vote && post.is_approved)
            console.log('- voting on', toVotePosts)

            // Vote on each one with 5 second breaks
            toVotePosts.forEach((post, index) => {
                setTimeout(async () => {
                    try {
                        await this._broadcaster.makeVote(post)
                        await this._database.writeVote(post)
                    } catch(e) {
                        console.log('err voting')
                    }
                }, index * 5 * 1000)
            })
        } catch(e) {
            console.log('something went wrong', e)
        }
    }

    async payout(totalPayout: number): Promise<any> {
        const allUsers = await this._database.getUsers()
        const weekUsers = allUsers.filter(weekFilter(this.week))
        const wallet = await this._blockchainAPI.getWallet({ username: this.username } as User)
        wallet.setActive(this.getActiveWif())

        // Payout each user
        const individualPayout = totalPayout / weekUsers.length
        let current = 0;
        weekUsers.forEach((user, index) => {
            setTimeout(async () => {
                try {
                    await wallet.powerUp(user, individualPayout)
                    current += individualPayout
                    console.log(`${current.toFixed(3)}/${totalPayout} STEEM, [${index+1}/${weekUsers.length}] transactions complete...`)
                } catch(e) {
                    console.log('ran into an error')
                    console.log('~~~~~', user, index)
                    console.log(e)
                }
            }, index * 1000)
            // 1 second delay between transaction
        })

    }

    async postWeek(): Promise<Report> {
        try {
            const users = await this._database.getUsers()
            const report = await reportStartWeek(users)
            return report
        } catch(e) {
            console.log(e)
            console.log('got err')
            return null
        }
    }

    async postRecap(): Promise<Report> {
        try {
            const users = await this._database.getUsers()
            const report = await reportRecap(users)
            return report
        } catch(e) {
            console.log(e)
            console.log('got err')
            return null
        }
    }

    async stats() {
        const statistics = Statistics.Instance()
        statistics.posts = await this._database.getPosts()
        statistics.users = await this._database.getUsers()

        statistics.general()
    }

    async spotify() {
        const spotify = Spotify.Instance()
        const playlists = await spotify.getPlaylists()
        playlists.forEach(playlist => {
            playlist.tracks.forEach(async track => {
                try {
                    await this._database.writeTrack(track)
                } catch(e) {
                    console.log(`couldn't write track ${track.name} due to ${e}`)
                    console.warn(e)
                }
            })
        })
    }
}
