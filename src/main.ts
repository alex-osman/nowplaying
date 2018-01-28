const ncp = require('copy-paste')
import {
  weekFilter
} from './filters'
import {
  reportStartWeek
} from './reporter';
import {
  getUsers,
  getPosts,
  writePosts,
} from './data';

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
  const posts = await getPosts()
  const write = await writePosts(con, posts)
  console.log(write)
  // const report = reportStartWeek(users.filter(weekFilter(4)))

  // console.log(report)
  // ncp.copy(report, () => console.log('Copied to clipboard'))
}

main()