import { init } from './init'
import { Bot } from '../bot';
const ncp = require('copy-paste')

const main = async () => {
    const bot: Bot = await init()
    const report = await bot.postWeek()
    // console.log(report)
    ncp.copy(report.post.body, () => console.log('Copied to clipboard'))
    bot.close()
}

main()
