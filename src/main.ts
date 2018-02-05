import { Bot } from './bot';
import { SteemBroadcaster } from './broadcaster/steemBroadcaster';
import { sqlDatabase } from './database/sqlDatabase';
import { SteemAPI } from './blockchainAPI/steemAPI';


const mysql = require('promise-mysql');

const local = {
  host: 'localhost',
  user: 'root', //process.env.DB_USER,
  password: 'password', //process.env.DB_PASS,
  database: 'nowplaying'
};


const main = async () => {
  const bot = new Bot()
  bot.communityName = 'nowplaying'
  bot.week = 5
  bot.username = process.env.STEEM_USERNAME
  bot.password = process.env.STEEM_PASSWORD
  bot.setBroadcaster(new SteemBroadcaster())
  bot.setBlockchainAPI(new SteemAPI())
  await bot.setDatabase(new sqlDatabase(local))
  bot.stats()
  // bot.scrape()
  // setInterval(() => bot.scrape(), 1000 * 60) // every minute
  // const payout = await bot.payout(1.425)
  // console.log(payout)
}

main()