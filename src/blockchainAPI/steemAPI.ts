import { Post } from '../classes/post';
import { Wallet } from '../classes/wallet';
import { User } from '../classes/user';
const steem = require('steem')

export class SteemAPI {
    getPosts(tag): Promise<Post[]> {
        steem.api.setOptions({
            url: 'wss://steemd-int.steemit.com'
        });
        return new Promise((resolve, reject) => {
            steem.api.getDiscussionsByCreated({
                "tag": tag,
                "limit": 10
            }, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result
                        .filter(x => x.category === tag)
                        .map(post => ({
                            author: post.author,
                            permlink: post.permlink,
                            created: post.created,
                            votes: post.active_votes.length,
                            did_comment: false,
                            did_vote: false,
                        }) as Post)
                    )
                }
            })
        })
    }

    getWallet(user: User): Promise<Wallet> {
        return new Promise((resolve, reject) => {
            steem.api.getAccounts([user.username], (err, response) => {
                if (err || response.length != 1) {
                    reject({ err })
                }
                const wallet = new Wallet(user)
                wallet.parseSBD(response[0].sbd_balance)
                wallet.parseSteem(response[0].balance)

                resolve(wallet)
            })
        })
    }
}