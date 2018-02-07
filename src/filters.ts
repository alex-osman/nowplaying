import { User } from './classes/user';
import { Post } from './classes/post';

export const weekFilter = week => (user: User) => {
    const startWeek = new Date(2018, 0, (week - 1) * 7)
    const endWeek = new Date(2018, 0, (week) * 7 - 1)
    return user.posts.find((post: Post) => {
        const created = new Date(post.created)
        if (created.getTime() > startWeek.getTime() && created.getTime() < endWeek.getTime()) {
            return true
        } else {
            return false
        }
    })
}