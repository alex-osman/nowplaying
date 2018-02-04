import { User } from '../classes/user';
import { Post } from '../classes/post';

export interface Database {
    setup: () => Promise<void>
    getUsers: () => Promise<User[]>
    getPosts: () => Promise<Post[]>
    writePosts: (posts: Post[]) => Promise<{ created: number, updated: number, total: number }>
}