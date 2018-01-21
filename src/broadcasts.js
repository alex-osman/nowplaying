import steem from "steem";
import { getUsers } from './database'

steem.api.setOptions({ url: 'wss://steemd-int.steemit.com' });
const username = process.env.STEEM_USERNAME
const wif = steem.auth.toWif(
    username,
    process.env.STEEM_PASSWORD,
    'posting'
)

export const vote = (post) => new Promise((resolve, reject) => {
    steem.broadcast.vote(wif, username, post.author, post.permlink, 50 * 100, (err, tx) => {
        if (err) {
            console.log('oh no, voting error')
        } else {
            console.log('successfully voted for ', post.author)
            comment(post)
            .then(tx2 => resolve([tx, tx2]))
        }
    })
})

export const comment = async (post) => {
    const users = await getUsers()
    return new Promise((resolve, reject) => {
        const user = users.find(x => x.username === post.author)
        console.log(user)
        const rank = users.sort((a, b) => b.posts - a.posts).indexOf(user)
        const commentBody = `Thanks for entering this week's #nowplaying!<br><hr>
User | Rank | Posts | Votes
-|-|-|-
${user.username} | ${rank} | ${user.posts} | ${user.votes}`
    console.log(commentBody)
    // steem.broadcast.comment(wif, post.author, post.permlink, username, `nowplaying-${new Date().getTime()}`, '', `${commentBody}`, { tags: ['nowplaying', 'music'], app: 'nowplaying/week3' }, (err, result) => {
    //     // console.log(err, result)
    //     if (err) {
    //         console.log(err)
    //     } else {
    //         console.log('Commented on ', post.author)
    //     }
    //     resolve(result)
    // })
})
}
// comment({
//     author: 'spiritualmax',
//     permlink: 'screw-malicious-flagging-1-flag-vs-130-votes'
// }).then(x => console.log('~~~got', x))