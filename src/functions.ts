import { Post } from './classes/post';
import { User } from './classes/user';
import { Settings } from './settings'

export const cleanScrape = (posts: Post[], users: User[]): Post[] => posts
    .filter(post => !Settings.blacklist.includes(post.author))
    .map(post => {
        if (users.map(u => u.username).includes(post.author)) {
            post.is_approved = true
        }
        return post
    })