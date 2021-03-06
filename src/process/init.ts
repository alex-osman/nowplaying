// initializes the bot to run the process

import { Bot } from '../bot';
import { SteemBroadcaster } from '../broadcaster/steemBroadcaster';
import { sqlDatabase } from '../database/sqlDatabase';
import { SteemAPI } from '../blockchainAPI/steemAPI';
import { settings } from '../settings';

const local = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: settings.communityName
};

export const init = async () => {
  const bot = new Bot()
  bot.communityName = settings.communityName
  bot.week = settings.week()
  bot.username = settings.username
  bot.password = settings.password
  bot.setBroadcaster(new SteemBroadcaster())
  bot.setBlockchainAPI(new SteemAPI())
  await bot.setDatabase(new sqlDatabase(local))

  // Dont authenticate in testing environment
  if (!process.env.NOWPLAYING_TESTING) {
    await bot.authenticate()
  }

  return bot
}
