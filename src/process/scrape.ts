import { init } from './init'
import { Bot } from '../bot';


const main = async () => {
    const bot: Bot = await init()
    bot.scrape()
    bot.close()
}

main()