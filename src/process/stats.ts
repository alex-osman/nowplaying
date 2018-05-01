import { init } from './init'
import { Bot } from '../bot';


const main = async () => {
    const bot: Bot = await init()
    await bot.stats()
    bot.close()
}

main()