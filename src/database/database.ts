import { User } from '../classes/user';
import { Post } from '../classes/post';
import { Track } from '../classes/track';

export interface Database {
    setup: () => Promise<void>
    close: () => Promise<void>
    getUsers: () => Promise<User[]>
    getPosts: () => Promise<Post[]>
    
    approve: (post: Post[]) => Promise<any>
    writePosts: (posts: Post[]) => Promise<{ created: number, updated: number, total: number }>
    writeComment: (post: Post) => Promise<any>
    writeVote: (post: Post) => Promise<any>
    writeTrack: (track: Track) => Promise<any>
}