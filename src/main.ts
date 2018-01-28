const ncp = require('copy-paste')
import {
  weekFilter,
  commentFilter
} from './filters'
import {
  reportStartWeek
} from './reporter';
import {
  getUsers,
  getPosts,
  writePosts,
} from './data';
import { Post } from './post';

const mysql = require('promise-mysql');

const local = {
  host: 'localhost',
  user: 'root', //process.env.DB_USER,
  password: 'password', //process.env.DB_PASS,
  database: 'nowplaying',
  dateStrings: true
};


const main = async () => {
  const con = await mysql.createConnection(local)
  const users = await getUsers(con)
  const posts = await getPosts() as Post[]
  const write = await writePosts(con, posts)
  // const comment = await commentPosts(con, posts.filter(commentFilter))
  // const vote = await commentPosts(con, posts.filter(voteFilter))

  // const report = reportStartWeek(users.filter(weekFilter(4)))

  // console.log(report)
  // ncp.copy(report, () => console.log('Copied to clipboard'))
}

main()