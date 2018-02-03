import { User } from './user';
import { Post } from './post';
import { reportOptions } from './reportOptions';

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