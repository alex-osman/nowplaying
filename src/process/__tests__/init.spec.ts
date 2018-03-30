import {
    init
} from '../init';

describe('Init Test', () => {

    it('creates a bot successfully', async () => {
        const bot = await init()
        expect(bot).toBeTruthy
        expect(bot.users.length).toBeTruthy
        bot.close()
    })

    afterAll(async () => {
        console.log('after everything')
    })
});