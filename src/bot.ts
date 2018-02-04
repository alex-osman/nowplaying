import { Broadcaster } from './broadcaster/broadcaster';
import { Database } from './database/database'
import { BlockchainAPI } from './blockchainAPI/blockchainAPI'

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
            const posts = await this._blockchainAPI.getPosts(this.communityName)
            const write = await this._database.writePosts(posts)
            console.log(write)
        } catch(e) {
            console.log(e)
            console.log('got err')
        }
    }

    async curate() {
        this._broadcaster.curate()
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