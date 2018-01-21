import steem from "steem";
import { addPost, scrape } from './database'
import { report, payout } from './reports'
import { setInterval } from "timers";

const week = process.argv.includes('--week')
  ? process.argv[process.argv.findIndex(arg => arg === '--week') + 1]
  : undefined

if (process.argv.includes('--report')) {
  payout({
    week: week
  })
}
if (process.argv.includes('--scrape')) {
  scrape({
    week: week,
    vote: process.argv.includes('--vote'),
    comment: process.argv.includes('--comment'),
  })
  setInterval(() => {
    scrape({
      week: week,
      vote: false,
      comment: false,
    })
  }, 60*1000*5)
}
console.log('hello')