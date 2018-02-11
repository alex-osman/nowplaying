import { JsonMetadata } from './jsonMetadata'
export class Post {
    
    // STEEM
    author: string;
    permlink: string;
    created: string;
    title: string;
    body: string;
    jsonMetadata: JsonMetadata;
    votes: number;

    // SQL
    did_comment: boolean;
    did_vote: boolean;
    is_approved: boolean;

    constructor() {
        this.jsonMetadata = {} as JsonMetadata
    }
}