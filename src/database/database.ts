import { Post } from '../classes/post';
import { Track } from '../classes/track';
import { User } from '../classes/user';

export interface IDatabase {
    setup: () => Promise<void>;
    close: () => Promise<void>;
    getUsers: () => Promise<User[]>;
    getPosts: () => Promise<Post[]>;
    getSpotifyAuth: () => Promise<String>;
    getPostsByTrack: (track: Track) => Promise<Post[]>;
    
    writeSpotifyAuth: (auth: { spotify_access: String, spotify_refresh: String }) => Promise<String>;
    approve: (post: Post[]) => Promise<any>;
    writePosts: (posts: Post[]) => Promise<{ created: number, updated: number, total: number }>;
    writeComment: (post: Post) => Promise<any>;
    writeVote: (post: Post) => Promise<any>;
    writeTrack: (track: Track) => Promise<any>;
    stopReadReplies: (post: Post) => Promise<any>;
}