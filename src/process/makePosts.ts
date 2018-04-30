import { Bot } from '../bot';
import { settings } from '../settings';
import { init } from './init';

const main = async () => {
    const bot: Bot = await init();
    await bot.makePost();
    bot.close();
    process.exit()
};

main();
