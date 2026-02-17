import { describe, it, expect } from 'vitest';
import { claimReward } from '../app/features/loyalty/loyaltyService';

describe('Idempotency', () => {
  it('should return same claim for same idempotencyKey', async () => {
    const userId = 'user-2';
    const rewardId = 'reward-2';
    const idempotencyKey = '123e4567-e89b-12d3-a456-426614174000';
    const first = await claimReward(userId, rewardId, idempotencyKey);
    const second = await claimReward(userId, rewardId, idempotencyKey);
    expect(first.id).toBe(second.id);
  });
});
