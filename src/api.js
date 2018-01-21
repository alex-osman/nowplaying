import steem from "steem";
steem.api.setOptions({ url: 'wss://steemd-int.steemit.com' });



export const getPosts = () => new Promise((resolve, reject) => {
    steem.api.getDiscussionsByCreated({
        "tag": "nowplaying",
        "limit": 100
    }, (err, result) => {
        if (err) reject(err)
        else {
            // console.log(result.length)
            // console.log(result.map(x => x.author))
            resolve(
                result.map(post => ({
                    author: post.author,
                    permlink: post.permlink,
                    created: post.created
                }))
            )
        }
    })
})
