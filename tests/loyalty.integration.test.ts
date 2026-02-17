import { describe, it, expect } from "vitest";
import { claimReward } from '../app/features/loyalty/loyaltyService';

describe('Loyalty Integration', () => {
  it('should claim reward idempotently', async () => {
    const userId = 'user-1';
    const rewardId = 'reward-1';
    const idempotencyKey = 'test-key-1';
    const first = await claimReward(userId, rewardId, idempotencyKey);
    const second = await claimReward(userId, rewardId, idempotencyKey);
    expect(first.response.id).toBe(second.response.id);
  });
});
