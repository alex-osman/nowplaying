import { Broadcaster } from './broadcaster/broadcaster';
import { Database } from './database/database'
import { BlockchainAPI } from './blockchainAPI/blockchainAPI'
import { User } from './classes/user';
import { weekFilter } from './filters';

const steem = require('steem')

export class Bot {
    week: number;          // 5
    communityName: string; // nowplaying
    username: string;      // nowplaying-music
    password: string;

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
    }

    async scrape(): Promise<any> {
        try {
            console.log(this._blockchainAPI)
            const posts = await this._blockchainAPI.getPosts(this.communityName)
            const write = await this._database.writePosts(posts, async post => {
                try {
                    const comment = await this._broadcaster.makeComment(post)
                } catch(e) { }
                try {
                    const vote = await this._broadcaster.makeVote(post)
                } catch(e) { }
                return { }
            })
            console.log(write)
        } catch(e) {
            console.log(e)
            console.log('got err')
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
                    const transaction = await wallet.powerUp(user, individualPayout)
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
            const report = await reportStartWeek(users)
            // const post = await this._broadcaster.makePost(report.post)

            // console.log(post)
        } catch(e) {
            console.log(e)
            console.log('got err')
        }
    }
}