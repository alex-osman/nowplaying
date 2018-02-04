import { Post } from '../classes/post';
const steem = require('steem')

export class SteemAPI {
    getPosts(tag): Promise<Post[]> {
        steem.api.setOptions({
            url: 'wss://steemd-int.steemit.com'
        });
        return new Promise((resolve, reject) => {
            steem.api.getDiscussionsByCreated({
                "tag": tag,
                "limit": 100
            }, (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(
                        result.map(post => ({
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
}