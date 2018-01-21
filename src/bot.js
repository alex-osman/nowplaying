require("babel-core/register");
require("babel-polyfill");

import steem from "steem";
import { addPost, scrape, scrapeVotes } from './database'
import { recap, newWeek } from './reports'
import { setInterval } from "timers";

const week = process.argv.includes('--week')
  ? process.argv[process.argv.findIndex(arg => arg === '--week') + 1]
  : undefined

if (process.argv.includes('--scrape-votes')) {
  scrapeVotes()
  setInterval(() => scrapeVotes(), 60*60*1000)
}
if (process.argv.includes('--recap')) {
  recap({
    week: week,
    payout: process.argv[process.argv.indexOf('--payout') + 1]
  })
}
if (process.argv.includes('--report')) {
  newWeek({
    week: week,
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
console.log('...')