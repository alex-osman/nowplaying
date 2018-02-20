import { Post } from './classes/post';
import { User } from './classes/user';
import { settings } from './settings'

export const cleanScrape = (allPosts: Post[], weekPost: Post): Post[] => allPosts
    .filter(post => !settings.blacklist.includes(post.author))
    .map(post => {
        if (weekPost.active_votes.find(vote => vote.voter === post.author)) {
            post.is_approved = true
        }
        return post
    })
