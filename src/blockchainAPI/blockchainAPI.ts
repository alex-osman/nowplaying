import { Post } from '../classes/post';

export interface BlockchainAPI {
    getPosts: (tag: string) => Promise<Post[]>
}