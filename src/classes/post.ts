import { JsonMetadata } from './jsonMetadata'
export class Post {
    id: number;
    
    // STEEM
    author: string;
    permlink: string;
    tag: string;
    created: string;
    title: string;
    body: string;
    jsonMetadata: JsonMetadata;
    votes: number;
    active_votes: { voter: string }[];
    children: number;
    read_replies: boolean;
    
    // SQL
    did_comment: boolean;
    did_vote: boolean;
    is_approved: boolean;

    // Custom
    payout: number; // SBD
    
    constructor() {
        this.jsonMetadata = {} as JsonMetadata
    }
}