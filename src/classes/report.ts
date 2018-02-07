
import { Post } from './post';
import { ReportOptions } from './ReportOptions';
import { User } from './user';

export class Report {
    users: User[];
    post: Post;
    reportOptions: ReportOptions;

    constructor() {
        this.users = [];
        this.reportOptions = {} as ReportOptions;
        this.post = new Post();
    }
}