import { Bot } from './bot';
import { SteemBroadcaster } from './broadcaster/steemBroadcaster';
import { sqlDatabase } from './database/sqlDatabase';
import { SteemAPI } from './blockchainAPI/steemAPI';
import { settings } from './settings';

const local = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: settings.communityName
};
console.log(local)

const main = async () => {
  const bot = new Bot()
  bot.communityName = settings.communityName
  bot.week = settings.week
  bot.username = settings.username
  bot.password = settings.password
  bot.setBroadcaster(new SteemBroadcaster())
  bot.setBlockchainAPI(new SteemAPI())
  await bot.setDatabase(new sqlDatabase(local))
  bot.postWeek()
  
  // bot.scrape()


  // every minute scrape, vote, and comment
  // setInterval(() => {
  //   bot.scrape()
  //   bot.vote()
  //   bot.comment()
  // }, 1000 * 60)

}

main()
