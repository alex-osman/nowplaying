import { Post } from './classes/post';
import { User } from './classes/user';
import { settings } from './settings'

export const cleanScrape = (posts: Post[], users: User[]): Post[] => posts
    .filter(post => !settings.blacklist.includes(post.author))
    .map(post => {
        if (users.map(u => u.username).includes(post.author)) {
            post.is_approved = true
        }
        return post
    })
