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
        const users: Array < any > = await this._con.query('SELECT * FROM posts');
        return users
            .map(data => ({
                author: data.author,
                votes: data.votes,
                created: data.created,
                permlink: data.permlink
            }) as Post)
            .filter((post) => post.author != 'loubega' && post.author != 'nowplaying-music')
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
            did_vote: d.did_vote
        }) as Post)
    }

    async writePosts(posts: Post[], onInsert: (post: Post) => Promise<any>): Promise<any> {
        try {
            const insertResponses: { post: Post, result: any }[] = await Promise.all(
                posts.map(async post => {
                    let result: any = {
                        err: true
                    }
                    try {
                        // result = await this._con.query('INSERT INTO posts SET ?', [post])
                        console.log(post)
                        result.onInsert = await onInsert(post)
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
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                return {
                    already: "there"
                }
            } else {
                throw e
            }
        }
    }
}