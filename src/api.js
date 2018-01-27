import steem from "steem";
steem.api.setOptions({ url: 'wss://steemd-int.steemit.com' });



export const getPosts = () => new Promise((resolve, reject) => {
    steem.api.setOptions({ url: 'wss://steemd-int.steemit.com' });
    steem.api.getDiscussionsByCreated({
        "tag": "nowplaying",
        "limit": 100
    }, (err, result) => {
        if (err) reject(err)
        else {
            // console.log(result.map(x => x.author))
            console.log(result.length)
            resolve(
                result.map(post => ({
                    author: post.author,
                    permlink: post.permlink,
                    created: post.created,
                    votes: post.active_votes.length
                }))
            )
        }
    })
})

export const getPost = (data) => new Promise((resolve, reject) => {
    steem.api.setOptions({ url: 'wss://steemd-int.steemit.com' });
    steem.api.getContent(data.author, data.permlink, (err, result) => {
        resolve(result)
    });
})