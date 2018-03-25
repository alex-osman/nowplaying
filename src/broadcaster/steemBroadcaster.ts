import { Post } from '../classes/post';

const steem = require('steem')
export class SteemBroadcaster {
    private _voteErrs: Array<string> = ['placeholder', 'Vote too small', 'already voted', 'wait 3 sec', 'max vote changes']
    private _username: string;
    private _postingWif: string;
    private _debug: boolean;

    setCredentials(username: string, postingWif: string): void {
        this._username = username;
        this._postingWif = postingWif;
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
        return new Promise(async (resolve, reject) => {
            console.log('commenting on ', post.author, post.permlink)
            const commentBody = `Thanks for entering this week's #nowplaying!`
            steem.broadcast.comment(this._postingWif, post.author, post.permlink, this._username, `nowplaying-${new Date().getTime()}`, '', commentBody, { tags: ['nowplaying', 'music'], app: `nowplaying`}, (err, result) => {
                if (err) {
                    try {
                        if (err.data.code == 10) {
                            // Only comment every 20 seconds
                            console.log('can only comment once every 20 seconds')
                            return reject(err)
                        } else {
                            console.log('commenting error')
                            return reject(err)
                        }
                    } catch(e) {
                        return reject(err)
                    }
                } else {
                    console.log('successfully commented on ', post.author)
                    return resolve(result)
                }
            })
        })
    }

    makeReply(post: Post, body: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            console.log('replying to ', post.author, post.permlink)
            console.log(body)
            steem.broadcast.comment(this._postingWif, post.author, post.permlink, this._username, `re-${post.permlink}`, '', body, { tags: ['nowplaying']}, (err, result) => {
                if (err) {
                    console.log('encountered an error replying')
                } else {
                    console.log('successfully replied')
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

