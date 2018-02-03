import { User } from './user';
import { Post } from './post';

export class Report {
    users: User[];
    post: Post;
    
    constructor() {
        this.users = [];
        this.post = new Post()
    }
}