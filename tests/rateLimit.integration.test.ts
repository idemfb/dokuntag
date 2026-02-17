describe('Rate Limit (Redis)', () => {
const REDIS_URL = process.env.REDIS_URL;
const shouldRunRedis = !!REDIS_URL;

// ioredis-mock veya gerçek Redis yoksa test atlanır
const maybeDescribe = shouldRunRedis ? describe : describe.skip;

maybeDescribe('Rate Limit (Redis)', () => {
  it('should limit after max requests', async () => {
    const { checkRateLimitRedis } = await import('../lib/rateLimitRedis');
    const key = 'test-user:claim';
    let limited = false;
    for (let i = 0; i < 6; i++) {
      limited = await checkRateLimitRedis(key, 5, 60);
    }
    expect(limited).toBe(true);
  });
});
