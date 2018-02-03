import { JsonMetadata } from './jsonMetadata'
export class Post {
    votes: number;

    // STEEM
    author: string;
    permlink: string;
    created: string;
    title: string;
    body: string;
    jsonMetadata: JsonMetadata;

    // SQL
    did_comment: boolean;
    did_vote: boolean;

    constructor() {
        this.jsonMetadata = {} as JsonMetadata
    }
}