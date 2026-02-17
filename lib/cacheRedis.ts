
import Redis from 'ioredis';

let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) {
    if (!process.env.REDIS_URL) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('REDIS_URL ortam değişkeni zorunlu (production)');
      } else {
        console.warn('REDIS_URL tanımsız, dev modda Redis devre dışı');
        // Dev fallback: sahte Redis objesi
        return {
          get: async () => null,
          set: async () => undefined,
          del: async () => undefined,
        } as any;
      }
    }
    try {
      redis = new Redis(process.env.REDIS_URL);
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Redis bağlantısı başarısız: ' + (err as Error).message);
      } else {
        console.warn('Redis bağlantısı kurulamadı, dev fallback aktif:', err);
        return {
          get: async () => null,
          set: async () => undefined,
          del: async () => undefined,
        } as any;
      }
    }
  }
  return redis;
}

export async function cacheGet(key: string) {
  const r = getRedis();
  const val = await r.get(key);
  return val ? JSON.parse(val) : null;
}
export async function cacheSet(key: string, value: any, ttlSec: number) {
  const r = getRedis();
  await r.set(key, JSON.stringify(value), 'EX', ttlSec);
}
export async function cacheDel(key: string) {
  const r = getRedis();
  await r.del(key);
}
