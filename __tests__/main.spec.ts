import { Bot } from "../src/bot";
import { init } from '../src/process/init';


describe('TestExample0', () => {
  // Act before assertions
  beforeAll(async () => {
    console.log('beforeAll')
  });

  // Assert if setTimeout was called properly
  it('always passes', () => {
    expect(true).toBe(true);
    expect(false).toBe(false);
  });
  
  // Assert greeter result
  it('this also always passes', () => {
    expect(5).toBe(5);
  });

  it('creates a bot successfully', () => {
    return init().then(bot => {
      expect(bot).toBeTruthy
      expect(bot.users.length).toBe(0)
    })
  })
});
