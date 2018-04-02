import {
    init
} from '../init';

describe('Init Test', () => {

    it('creates a bot successfully', async () => {
        const bot = await init()
        expect(bot).toBeTruthy
        expect(bot.users).toBeTruthy
        bot.close()
    })
});