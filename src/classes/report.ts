
import { Post } from './post';
import { reportOptions } from './reportOptions';
import { User } from './user';

export class Report {
    users: User[];
    post: Post;
    reportOptions: reportOptions;

    constructor() {
        this.users = [];
        this.reportOptions = {} as reportOptions;
        this.post = new Post();
    }
}