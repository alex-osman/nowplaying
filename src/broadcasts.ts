import { Post } from './post'
const steem = require('steem')
export class SteemBroadcaster {
    private _voteErrs: Array<string> = ['placeholder', 'Vote too small', 'already voted', 'wait 3 sec', 'max vote changes']
    private _username: string;
    private _postingWif: string;
    private _activeWif: string;
    private _debug: boolean;

    setCredentials(username: string, postingWif: string, activeWif: string): void {
        this._username = username;
        this._postingWif = postingWif;
        this._activeWif = activeWif;
    }

    makeVote(post: Post, votingPower: number = 100): Promise<any> {
        return new Promise((resolve, reject) => {
            steem.broadcast.vote(this._postingWif, this._username, post.author, post.permlink, votingPower * 100, (error, result) => {
                if (error) {
                    let err = error
                    if (error.payload.error.data.code) {
                        err = error.payload.error
                    }
                    if (err.data.code === 10) {
                        if (this._debug) {
                            console.log(0);
                        }
                        if (err.data.stack[0].format.includes('STEEMIT_VOTE_DUST_THRESHOLD')) {
                            // Vote too small
                            console.log(this._voteErrs[1])
                            reject(1)
                        } else if (err.data.stack[0].format.includes('You have already voted in a similar way')) {
                            // Already voted with this voting power
                            if (this._debug) {
                                console.log(this._voteErrs[2]);
                            }
                            reject(2)
                        } else if (err.data.stack[0].format.includes('STEEMIT_MIN_VOTE_INTERVAL_SEC')) {
                            // Only vote every 3 seconds
                            if (this._debug) {
                                console.log(this._voteErrs[3]);
                            }
                            console.log('trying again in 3 seconds')
                            setTimeout(() => this.makeVote(post, votingPower), 3000)
                        } else if (err.data.stack[0].format.includes('STEEMIT_MAX_VOTE_CHANGES')) {
                            if (this._debug) {
                                console.log(this._voteErrs[4]);
                            }
                            reject(4)
                        } else {
                            if (this._debug) {
                                console.log(err.data.stack[0].format);
                            }
                            reject(err)
                        }
                        if (this._debug) {
                            console.log(-1);
                        }
                    } else {
                        if (this._debug) {
                            console.log(-2);
                        }
                    }
                } else {
                    console.log('successfully voted for ', post.author)
                    resolve(result)
                }
            })
        })
    }

    makeComment(post: Post): Promise<any> {
        return new Promise((resolve, reject) => {
            steem.broadcast.comment(this._postingWif, post.author, post.permlink, this._username, `nowplaying-${new Date().getTime()}`, '', `Thanks for entering this week's #nowplaying!`, { tags: ['nowplaying', 'music'], app: 'nowplaying/week5'}, (err, result) => {
                if (err) {
                    if (err.data.code == 10) {
                        // Only comment every 20 seconds
                        reject(1)
                    } else {
                        console.log('commenting error')
                        reject(err)
                    }
                } else {
                    console.log('successfully commented on ', post.author)
                    resolve(result)
                }
            })
        })
    }
    makePost(post: Post): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log(post)
            steem.broadcast.comment(this._postingWif, '', post.jsonMetadata.tags[0], this._username, post.permlink, post.title, post.body, post.jsonMetadata, (err, result) => {
                console.log('posted', err)
                console.log('result', result)
                if (err) {
                    reject(err)
                }
                resolve(result)
            })
        })
    }
}

