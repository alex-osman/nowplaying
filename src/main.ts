const ncp = require('copy-paste')
import {
  weekFilter
} from './filters'
import {
  reportStartWeek
} from './reporter';
import {
  getUsers,
  getDBPosts,
  writePosts,
  writeComment,
  writeVote,
  getPosts,
} from './data';
import { Post } from './post';
import { vote, voteErrs, comment } from './broadcasts';
import { commentAndVote } from './bot';

const MILLI_PER_SECOND = 1000;
const SECONDS = 60;

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
  setInterval(async () => {
    // comment and vote on everything in the database
    commentAndVote(con)

    // scrape for more posts
    const posts = await getPosts()
    console.log(posts.length, 'scraped')

    // add to database
    const write = await writePosts(con, posts)
    console.log(write)
  }, SECONDS * MILLI_PER_SECOND)

  // const comment = await commentPosts(con, posts.filter(commentFilter))
  // const vote = await commentPosts(con, posts.filter(voteFilter))

  // const report = reportStartWeek(users.filter(weekFilter(4)))

  // console.log(report)
  // ncp.copy(report, () => console.log('Copied to clipboard'))
}

main()