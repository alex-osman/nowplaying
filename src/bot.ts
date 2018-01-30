import {
  getDBPosts,
  writeComment,
  writeVote,
} from './data';
import { Post } from './post';
import { vote, comment } from './broadcasts';


export const commentAndVote = async (con) => {
    console.log('searching...')

    const posts = await getDBPosts(con) as Post[]
    console.log(`${posts.length} posts total`)
    const toComment = posts.filter(p => !p.did_comment)
    console.log(`${toComment.length} toComment`)
    // console.log(toComment)
    toComment.forEach((post, index) => setTimeout(async () => {
        // console.log('comment', post)
        const commentResponse = await comment(post)
        const wroteComment = await writeComment(con, post)
    }, index * 25000))

    const toVote = posts.filter(p => !p.did_vote)
    console.log(`${toVote.length} toVote`)
    toVote.forEach((post, index) => setTimeout(async () => {
        // console.log('vote', post)
        const voteResponse = await vote(post)
        const wroteVote = await writeVote(con, post)
    }, index * 5000))
}