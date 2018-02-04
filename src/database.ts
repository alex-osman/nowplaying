import { User } from './user';
import { Post } from './post';

export interface Database {
    setup: () => Promise<void>
    getUsers: () => Promise<User[]>
    getPosts: () => Promise<Post[]>
    writePosts: (posts: Post[]) => Promise<{ created: number, updated: number, total: number }>
}