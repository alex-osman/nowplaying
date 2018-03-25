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

const main = async () => {
  const TIME = 1000 * 60 * 30
  const bot = new Bot()
  bot.communityName = settings.communityName
  bot.week = settings.week
  bot.username = settings.username
  bot.password = settings.password
  bot.setBroadcaster(new SteemBroadcaster())
  bot.setBlockchainAPI(new SteemAPI())
  await bot.setDatabase(new sqlDatabase(local))
  // bot.postWeek()
  // every minute scrape, vote, and comment
  setInterval(() => { bot.scrape(); }, TIME)
  
  bot.scrape()
}

main()
