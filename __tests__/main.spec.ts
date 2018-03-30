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

  it('prints an environment variable', () => {
    console.log(process.env.TEST_RESULTS_DIR)
    console.log('env var', process.env)
    expect(3).toBe(3)
  })
});
