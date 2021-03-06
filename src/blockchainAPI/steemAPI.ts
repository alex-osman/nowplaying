import { Post } from '../classes/post';
import { Wallet } from '../classes/wallet';
import { User } from '../classes/user';

const steem = require('steem')

export class SteemAPI {
    getPosts(tag): Promise<Post[]> {
        steem.api.setOptions({ url: 'https://api.steemit.com'});
        return new Promise((resolve, reject) => {
            steem.api.getDiscussionsByCreated({
                "tag": tag,
                "limit": 30
            }, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result
                        .map(post => ({
                            author: post.author,
                            permlink: post.permlink,
                            tag: post.category.replace(/\W/g, ''),
                            created: post.created,
                            votes: post.active_votes.length,
                            did_comment: false,
                            did_vote: false,
                            is_approved: false,
                            children: post.children,
                            read_replies: true,
                        }) as Post)
                    )
                }
            })
        })
    }


    getPost(post: Post): Promise<Post> {
	steem.api.setOptions({ url: 'https://api.steemit.com'});
        return new Promise((resolve, reject) => {
            steem.api.getContent(post.author, post.permlink, (err, result) => {
                if (err) {
                    reject({ err })
                    // If there is no author it is invalid
                } else if (!result.author) {
                    reject({ err: 'No post found' })
                } else {
                    post.active_votes = result.active_votes
                    post.payout = parseFloat(result.pending_payout_value.split(' ')[0])
                    resolve(post)
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


    getReplies(post: Post): Promise<any> {
        return new Promise((resolve, reject) => {
            steem.api.getContentReplies(post.author, post.permlink, (err, response) => {
                if (err) {
                    reject({ err })
                }
                resolve(response.map(item => ({
                    author: item.author,
                    permlink: item.permlink,
                    body: item.body,
                    children: item.children
                })))
            })
        })
    }
    
    scrapeReplies(post: Post): Promise<any> {
        return new Promise((resolve, reject) => {
            steem.api.getContentReplies(post.author, post.permlink, (err, response) => {
                if (err) {
                    reject({ err })
                }
                resolve(response)
            })
        })
    }
}
