import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export async function checkRateLimitRedis(key: string, max: number, windowSec: number) {
  const now = Math.floor(Date.now() / 1000);
  const redisKey = `rl:${key}:${now - (now % windowSec)}`;
  const count = await redis.incr(redisKey);
  if (count === 1) await redis.expire(redisKey, windowSec);
  return count > max;
}
