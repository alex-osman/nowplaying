const ncp = require('copy-paste')

import {
  reportStartWeek
} from './reporter';
import {
  getUsers,
} from './data';
import { Bot } from './bot';
import { SteemBroadcaster } from './broadcasts';
import { sqlDatabase } from './sqlDatabase';
import { SteemAPI } from './steemAPI';

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
  bot.username = process.env.STEEM_USERNAME
  bot.password = process.env.STEEM_PASSWORD
  bot.setBroadcaster(new SteemBroadcaster())
  bot.setBlockchainAPI(new SteemAPI())
  await bot.setDatabase(new sqlDatabase(local))

  bot.scrape()
}

main()