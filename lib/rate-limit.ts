/**
 * Rate limiting utility for protecting endpoints
 * Supports Redis-based limiter when REDIS_URL present, otherwise falls back to in-memory store
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class InMemoryStore {
  private store = new Map<string, RateLimitEntry>();

  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (entry.count < maxRequests) {
      entry.count++;
      return true;
    }

    return false;
  }

  getResetTime(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return 0;
    const resetIn = Math.ceil((entry.resetTime - Date.now()) / 1000);
    return Math.max(0, resetIn);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) this.store.delete(key);
    }
  }
}

const memoryStore = new InMemoryStore();

/**
 * Attempt to use Redis if available and safe (not edge runtime).
 */
async function tryUseRedis() {
  if (!process.env.REDIS_URL) return null;
  // Avoid importing redis/ioredis in Edge runtime where it breaks
  if (process.env.NEXT_RUNTIME === 'edge') return null;

  try {
    const Redis = (await import('ioredis')).default;
    return new Redis(process.env.REDIS_URL as string);
  } catch (err) {
    return null;
  }
}

/**
 * Check rate limit for a key. Returns true if allowed.
 */
export async function checkRateLimit(key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl && process.env.NEXT_RUNTIME !== 'edge') {
    const client = await tryUseRedis();
    if (client) {
      try {
        const windowSec = Math.ceil(windowMs / 1000);
        const val = await client.incr(key);
        if (val === 1) {
          await client.expire(key, windowSec);
        }
        // close client to avoid hanging connections in short-lived processes
        await client.quit();
        return val <= maxRequests;
      } catch (e) {
        // fall back to memory on any redis error
        return memoryStore.check(key, maxRequests, windowMs);
      }
    }
  }

  return memoryStore.check(key, maxRequests, windowMs);
}

export async function getResetTime(key: string): Promise<number> {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl && process.env.NEXT_RUNTIME !== 'edge') {
    const client = await tryUseRedis();
    if (client) {
      try {
        const ttl = await client.ttl(key);
        await client.quit();
        return Math.max(0, ttl);
      } catch (e) {
        return memoryStore.getResetTime(key);
      }
    }
  }

  return memoryStore.getResetTime(key);
}

// Cleanup memory store periodically
setInterval(() => memoryStore.cleanup(), 60000);

/**
 * Get rate limit key from IP and endpoint
 */
export function getRateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`;
}

/**
 * Extract client IP from headers
 */
export function getClientIP(headers: {
  'x-forwarded-for'?: string;
  'cf-connecting-ip'?: string;
  'x-real-ip'?: string;
}): string {
  const forwarded = headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }

  const cfip = headers['cf-connecting-ip'];
  if (typeof cfip === 'string') {
    return cfip;
  }

  const realip = headers['x-real-ip'];
  if (typeof realip === 'string') {
    return realip;
  }

  return '127.0.0.1';
}
