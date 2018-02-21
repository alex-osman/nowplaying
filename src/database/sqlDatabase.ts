import { User } from '../classes/user';
import { Post } from '../classes/post';

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

    async getUsers(): Promise < User[] > {
        const users: Array < any > = await this._con.query('SELECT * FROM posts WHERE is_approved=1');
        return users
            .map(data => ({
                author: data.author,
                votes: data.votes,
                created: data.created,
                permlink: data.permlink,
                did_comment: data.did_comment,
                did_vote: data.did_vote,
                is_approved: data.is_approved
            }) as Post)
            .filter((post) => post.author != 'loubega')
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

    async getPosts(): Promise < Post[] > {
        const posts: Array < any > = await this._con.query('SELECT * FROM posts');
        return posts.map(d => ({
            author: d.author,
            permlink: d.permlink,
            votes: d.votes,
            created: d.created,
            did_comment: d.did_comment,
            did_vote: d.did_vote,
            is_approved: d.is_approved,
        }) as Post)
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
            result: await this._con.query('UPDATE posts SET votes=? WHERE author=? AND permlink=?', [postObj.post.votes, postObj.post.author, postObj.post.permlink])
        })))
        
        return {
            created: insertResponses.length - toUpdate.length,
            updated: updateResponses.filter(res => res.result.changedRows).length,
            total: insertResponses.length
        }
    }

    async writeComment(post: Post): Promise<any> {
        const result = await this._con.query('UPDATE posts SET did_comment=1 WHERE author=? AND permlink=?', [post.author, post.permlink])
        console.log(result)
        return new Promise(resolve => resolve('hello'))
    }
    
    async writeVote(post: Post): Promise<any> {
        const result = await this._con.query('UPDATE posts SET did_vote=1 WHERE author=? AND permlink=?', [post.author, post.permlink])
        console.log(result)
        return new Promise(resolve => resolve('hello'))
    }
}