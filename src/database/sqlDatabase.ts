import { settings } from './../settings';
import { User } from '../classes/user';
import { Post } from '../classes/post';
import { Track } from '../classes/track';

const mysql = require('promise-mysql')

export class sqlDatabase {
    private _con: any;
    private _options: { host: string, user: string, password: string, database: string};

    constructor(options: { host: string, user: string, password: string, database: string}) {
        this._options = options
    }

    async setup() {
        this._con = await mysql.createConnection(this._options)
    }
    async close() {
        console.log('Closing database connection')
        return this._con.end()
    }

    async getSpotifyAuth(): Promise<Object> {
        const result = await this._con.query('SELECT * FROM settings')
        return {
            spotify_auth: result[0].spotify_auth,
            spotify_refresh: result[0].spotify_refresh,
            spotify_access: result[0].spotify_access
        }
    }

    writeSpotifyAuth = async (auth: { spotify_access: String, spotify_refresh: String }): Promise<void> => {
        try {
            const result = await this._con.query('UPDATE settings SET ?', [auth]);
            return result;
        } catch (e) {
            console.log(e, 'error writing spotify auth');
            return;
        }
    }


    async getUsers(): Promise <User[]> {
        const users: Array <any> = await this._con.query('SELECT * FROM posts WHERE is_approved=1');
        return users
            .map(data => ({
                author: data.author,
                votes: data.votes,
                created: data.created,
                permlink: data.permlink,
                tag: data.tag,
                did_comment: data.did_comment,
                did_vote: data.did_vote,
                is_approved: data.is_approved
            }) as Post)
            .filter(post => !settings.blacklist.includes(post.author))
            .reduce((users: User[], post) => {
                const user = users.find(user => user.username === post.author)
                if (user) {
                    user.posts.push(post)
                } else {
                    users.push({
                        username: post.author,
                        posts: [post]
                    })
                }
                return users
            }, [])
    }

    async getPosts(): Promise <Post[]> {
        const posts: Array <any> = await this._con.query('SELECT * FROM posts');
        return posts.map(d => ({
            id: d.id,
            author: d.author,
            permlink: d.permlink,
            tag: d.tag,
            votes: d.votes,
            created: d.created,
            did_comment: d.did_comment,
            did_vote: d.did_vote,
            is_approved: d.is_approved,
            children: d.children,
            read_replies: d.read_replies
        }) as Post)
        .filter(post => !settings.blacklist.includes(post.author))
    }

    async getPostsByTrack(track: Track): Promise<Post[]> {
        const result: Array<any> = await this._con.query('SELECT * FROM tracks INNER JOIN posts on postId=posts.id where spotify_id=?', [track.spotify_id])
        return result.map(d => {
            const post = new Post();
            post.author = d.author
            post.permlink = d.permlink
            post.tag = d.tag
            post.created = d.created
            return post;
        })
    }

    async writePosts(posts: Post[]): Promise<any> {
        const insertResponses: { post: Post, result: any }[] = await Promise.all(
            posts.map(async post => {
                let result: any = {
                    err: true
                }
                try {
                    result = await this._con.query('INSERT INTO posts SET ?', [post])
                } catch (e) {
                    // Integrity error - this post already exists
                    // console.log('error inserting prolly cause im there already')
                }
                return {
                    post,
                    result
                }
            })
        )

        const toUpdate = insertResponses.filter(res => !res.result.changedRows)

        const updateResponses = await Promise.all(toUpdate.map(async postObj => ({
            post: postObj.post,
            result: await this._con.query('UPDATE posts SET votes=?, children=? WHERE author=? AND permlink=?', [postObj.post.votes, postObj.post.children, postObj.post.author, postObj.post.permlink])
        })))

        return {
            created: insertResponses.length - toUpdate.length,
            updated: updateResponses.filter(res => res.result.changedRows).length,
            total: insertResponses.length
        }
    }

    async approve(posts: Post[]): Promise<any> {
        if (!posts.length) {
            return
        }
        const result = await this._con.query('UPDATE posts SET is_approved=1 WHERE author IN (?) AND permlink IN (?)', [posts.map(post => post.author), posts.map(post => post.permlink)])
        // console.log(result)
        return result
    }

    async writeComment(post: Post): Promise<any> {
        const result = await this._con.query('UPDATE posts SET did_comment=1 WHERE author=? AND permlink=?', [post.author, post.permlink])
        // console.log(result)
        return result
    }

    async writeVote(post: Post): Promise<any> {
        const result = await this._con.query('UPDATE posts SET did_vote=1 WHERE author=? AND permlink=?', [post.author, post.permlink])
        return result
    }

    async writeTrack(track: Track): Promise<any> {
        const result = await this._con.query('INSERT INTO tracks SET ?', [track])
        return result
    }

    async stopReadReplies(post: Post): Promise<any> {
        const result = await this._con.query('UPDATE posts SET read_replies=0 WHERE author=? AND permlink=?', [post.author, post.permlink])
        console.log(result)
        return result
    }
}