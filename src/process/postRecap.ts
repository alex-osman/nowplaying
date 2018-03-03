import { init } from './init'
import { Bot } from '../bot';
const ncp = require('copy-paste')

const main = async () => {
    const bot: Bot = await init()
    const report = await bot.postRecap()
    // console.log(report)
    ncp.copy(report.post.body, () => console.log('Copied to clipboard'))
}

main()