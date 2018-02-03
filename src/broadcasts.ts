import { Post } from './post'
const steem = require('steem')

const username = process.env.STEEM_USERNAME
const wif = steem.auth.toWif(
    username,
    process.env.STEEM_PASSWORD,
    'posting'
)

export const voteErrs = ['placeholder', 'Vote too small', 'already voted', 'wait 3 sec', 'max vote changes']

export const vote = (post: Post, votingPower: number = 100) => {
    return new Promise((resolve, reject) => {
        steem.broadcast.vote(wif, username, post.author, post.permlink, votingPower * 100, (error, result) => {
            if (error) {
                let err = error
                if (error.payload.error.data.code) {
                    err = error.payload.error
                }
                if (err.data.code === 10) {
                    // console.log(0)
                    if (err.data.stack[0].format.includes('STEEMIT_VOTE_DUST_THRESHOLD')) {
                        // Vote too small
                        console.log(voteErrs[1])
                        reject(1)
                    } else if (err.data.stack[0].format.includes('You have already voted in a similar way')) {
                        // Already voted with this voting power
                        // console.log(voteErrs[2])
                        reject(2)
                    } else if (err.data.stack[0].format.includes('STEEMIT_MIN_VOTE_INTERVAL_SEC')) {
                        // Only vote every 3 seconds
                        // console.log(voteErrs[3])
                        setTimeout(() => vote(post, votingPower), 3000)
                    } else if (err.data.stack[0].format.includes('STEEMIT_MAX_VOTE_CHANGES')) {
                        // console.log(voteErrs[4])
                        reject(4)
                    } else {
                        // console.log(err.data.stack[0].format)
                        reject(err)
                    }
                    // console.log(-1)
                } else {
                    // console.log(-2)
                    // throw err
                }
            } else {
                console.log('successfully voted for ', post.author)
                resolve(result)
            }
        })
    })
}


export const comment = (post: Post) => {
    return new Promise((resolve, reject) => {
        steem.broadcast.comment(wif, post.author, post.permlink, username, `nowplaying-${new Date().getTime()}`, '', `Thanks for entering this week's #nowplaying!`, { tags: ['nowplaying', 'music'], app: 'nowplaying/week5'}, (err, result) => {
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

export const makePost = (post: Post) => {
    return new Promise((resolve, reject) => {
        if (post.author != username) {
            reject({ error: `The post author is not: ${username}` })
        }
        steem.broadcast.comment(wif, '', 'test', post.author, post.permlink, post.title, post.body, post.jsonMetadata, (err, result) => {
            console.log('posted', err)
            console.log('result', result)
            if (err) {
                reject(err)
            }
            resolve(result)
        })
    })
}