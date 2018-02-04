import { Broadcaster } from './broadcaster';

const steem = require('steem')

export class Bot {
    con: any;              // sql connection
    week: number;          // 5
    communityName: string; // nowplaying
    username: string;      // nowplaying-music
    password: string;

    private _broadcaster: Broadcaster;


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
}