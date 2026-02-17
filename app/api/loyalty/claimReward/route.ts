
import { NextRequest } from 'next/server';
import { claimReward } from '@/app/features/loyalty/loyaltyService';
import { validateClaimRewardRequest } from '@/lib/validation';
import { ok, fail } from '@/lib/response';
import { checkRateLimitRedis } from '@/lib/rateLimitRedis';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, rewardId, idempotencyKey } = validateClaimRewardRequest(body);
    // Redis rate limit
    const limited = await checkRateLimitRedis(`${userId}:claim`, 5, 60);
    if (limited) return fail({ code: 'RATE_LIMIT', message: 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin.' }, 429);
    const result = await claimReward(userId, rewardId, idempotencyKey);
    return ok(result, 201);
  } catch (error: any) {
    return fail({ code: error.code || 'INTERNAL', message: 'İşlem gerçekleştirilemedi.', context: undefined }, error.statusCode || 500);
  }
}