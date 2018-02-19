import { reportStartWeek, playerStats } from './reporter';
import { Broadcaster } from './broadcaster/broadcaster';
import { Database } from './database/database'
import { BlockchainAPI } from './blockchainAPI/blockchainAPI'
import { User } from './classes/user';
import { weekFilter } from './filters';
import { Statistics } from './statistics';
import { Post } from './classes/post';
import { cleanScrape } from './functions';
=
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
        try {
            const x = await this._blockchainAPI.getPosts(this.communityName)
            const posts = await cleanScrape(x, this.users)
            console.log(await this._database.writePosts(posts))
        } catch(e) {
            console.log(e)
            console.log('got err')
        }
    }

    async comment(): Promise<any> {
        try {
            const allPosts = await this._database.getPosts()
            const toCommentPosts = allPosts.filter(post => !post.did_comment)

            // Comment on each one with 20 second breaks
            toCommentPosts.forEach((post, index) => {
                setTimeout(() => {
                    this._broadcaster.makeComment(post)
                    this._database.writeComment(post)
                }, index * 22 * 1000)
            })
        } catch(e) {
            console.log('something went wrong', e)
        }
    }

    async vote(): Promise<any> {
        try {
            const allPosts = await this._database.getPosts()
            const toVotePosts = allPosts.filter(post => !post.did_vote)

            // Comment on each one with 20 second breaks
            toVotePosts.forEach((post, index) => {
                setTimeout(() => {
                    this._broadcaster.makeVote(post)
                    this._database.writeVote(post)
                }, index * 22 * 1000)
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

    async postWeek(): Promise<any> {
        try {
            const users = await this._database.getUsers()
            // console.log(users)
            const report = await reportStartWeek(users)
            console.log(report.post.body)
            // const post = await this._broadcaster.makePost(report.post)

            // console.log(post)
        } catch(e) {
            console.log(e)
            console.log('got err')
        }
    }

    async stats() {
        const statistics = Statistics.Instance()
        statistics.posts = await this._database.getPosts()
        statistics.users = await this._database.getUsers()

        statistics.general()
    }
}
