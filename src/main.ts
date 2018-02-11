import { Bot } from './bot';
import { SteemBroadcaster } from './broadcaster/steemBroadcaster';
import { sqlDatabase } from './database/sqlDatabase';
import { SteemAPI } from './blockchainAPI/steemAPI';


const mysql = require('promise-mysql');

const local = {
  host: '192.168.0.2',
  user: 'nodice', //process.env.DB_USER,
  password: '', //process.env.DB_PASS,
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
  // bot.scrape()
  
  
  // every minute scrape, vote, and comment
  setInterval(() => {
    bot.scrape()
    bot.vote()
    bot.comment()
  }, 1000 * 60)

  // const payout = await bot.payout(1.425)
  // console.log(payout)
}

main()