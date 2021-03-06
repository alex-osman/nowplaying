import { Post } from '../classes/post';
import { User } from '../classes/user';
import { Wallet } from '../classes/wallet';

export interface BlockchainAPI {
    getPosts: (tag: string) => Promise<Post[]>
    getPost: (post: Post) => Promise<Post>
    getWallet: (user: User) => Promise<Wallet>
    getReplies: (post: Post) => Promise<any>
}