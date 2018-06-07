import { init } from "./process/init";
import { Bot } from "./bot";

const main = async () => {
  const bot: Bot = await init();
  
  setInterval(bot.scrape, 1000 * 60 * 30)
  bot.scrape()
}
main()