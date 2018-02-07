import { Post } from '../classes/post';

export interface Broadcaster {
    setCredentials: (username: string, postingWif?: string, activeWif?: string) => void

    makeVote: (post: Post, votingPower?: number) => Promise<any>
    makeComment: (post: Post) => Promise<any>
    makePost: (post: Post) => Promise<any>

}