import { scrape } from "./database";

setInterval(() => {
    scrape({
        week: 4,
        vote: true,
        comment: true,
    })
}, 100*1000)