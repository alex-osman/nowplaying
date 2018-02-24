import { User } from '../classes/user';
import { Post } from '../classes/post';

export interface Database {
    setup: () => Promise<void>
    getUsers: () => Promise<User[]>
    getPosts: () => Promise<Post[]>
    
    approve: (post: Post[]) => Promise<any>
    writePosts: (posts: Post[]) => Promise<{ created: number, updated: number, total: number }>
    writeComment: (post: Post) => Promise<any>
    writeVote: (post: Post) => Promise<any>
}