import { init } from './init'
import { Bot } from '../bot';
import { settings } from '../settings';

const main = async () => {
    const bot: Bot = await init()
    bot.payout(settings.payout)
    bot.close()
}

main()