export class Post {
    votes: number;

    // STEEM
    author: string;
    permlink: string;
    created: string;
    title: string;
    body: string;
    jsonMetadata: any;

    // SQL
    did_comment: boolean;
    did_vote: boolean;
}