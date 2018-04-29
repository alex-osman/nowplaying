import { init } from './init'
import { Bot } from '../bot';
import { settings } from '../settings';

const main = async () => {
    const bot: Bot = await init()
    await bot.payout(settings.payout)
    bot.close()
}

main()