/**
 * Simple in-memory caching with TTL
 * Production'da Redis gibi solution kullan
 */

import { logInfo, logWarn, logError } from './logger';

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class Cache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private readonly ttl: number; // milliseconds

  constructor(ttlSeconds: number = 60) {
    this.ttl = ttlSeconds * 1000;
    // Cleanup expired entries every minute
    this.startCleanupInterval();
  }

  private startCleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      const expiredKeys = Array.from(this.store.entries())
        .filter(([, entry]) => entry.expiresAt < now)
        .map(([key]) => key);

      expiredKeys.forEach((key) => this.store.delete(key));

      if (expiredKeys.length > 0) {
        logInfo('CACHE_DEBUG', { expiredCount: expiredKeys.length });
      }
    }, 60000); // Every minute
  }

  get(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      logInfo('CACHE_MISS', { key });
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      logInfo('CACHE_EXPIRED', { key });
      return null;
    }

    logInfo('CACHE_HIT', { key });
    return entry.value;
  }

  set(key: string, value: T) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttl,
    });
    logInfo('CACHE_SET', { key, ttl: this.ttl });
  }

  invalidate(key: string) {
    this.store.delete(key);
    logInfo('CACHE_INVALIDATED', { key });
  }

  clear() {
    this.store.clear();
    logInfo('CACHE_CLEARED', {});
  }

  getStats() {
    return {
      size: this.store.size,
      ttl: this.ttl,
    };
  }
}

/**
 * Global cache instances with appropriate TTLs
 */

// Rewards list - changes rarely, cache for 5 min
export const rewardsCache = new Cache<any[]>(300);

// User points - cache for 30 sec (balance can change frequently)
export const userPointsCache = new Cache<any>(30);

// Reward details - cache for 10 min
export const rewardDetailsCache = new Cache<any>(600);

/**
 * Cache key generators (consistent naming)
 */
export const cacheKeys = {
  activeRewards: () => 'rewards:active:list',
  userPoints: (userId: string) => `points:user:${userId}`,
  rewardDetails: (rewardId: string) => `reward:${rewardId}`,
  userClaimHistory: (userId: string) => `claims:user:${userId}`,
};

/**
 * Invalidate related caches when data changes
 */
export function invalidateRelatedCaches(operation: string, userId?: string) {
  // Always invalidate rewards list when operations happen
  rewardsCache.invalidate(cacheKeys.activeRewards());

  // Invalidate user-specific caches
  if (userId) {
    userPointsCache.invalidate(cacheKeys.userPoints(userId));
  }

  logInfo('CACHE_INVALIDATE_RELATED', { operation, userId });
}

/**
 * Cache decorator for async functions
 * Usage: const result = await withCache('key', async () => { ... })
 */
export async function withCache<T>(
  key: string,
  cache: Cache<T>,
  fetcher: () => Promise<T>
): Promise<T> {
  // Try cache first
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  // Cache miss - fetch fresh
  const fresh = await fetcher();

  // Store in cache
  cache.set(key, fresh);

  return fresh;
}
