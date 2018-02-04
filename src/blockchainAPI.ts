import { Post } from './post';

export interface BlockchainAPI {
    getPosts: (tag: string) => Promise<Post[]>
}