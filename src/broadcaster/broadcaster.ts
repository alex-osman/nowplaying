import { Post } from '../classes/post';

export interface Broadcaster {
    setCredentials: (username: string, postingWif?: string) => void

    makeVote: (post: Post, votingPower?: number) => Promise<any>
    makeComment: (post: Post) => Promise<any>
    makeReply: (post: Post, body: string) => Promise<any>
    makePost: (post: Post) => Promise<any>

}
