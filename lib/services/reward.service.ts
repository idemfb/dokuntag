// lib/services/reward.service.ts
// @deprecated - loyaltyService.ts를 사용하세요 (Use loyaltyService.ts instead)

import { prisma } from "../prisma";
import { RewardRepository } from "../repositories/reward.repository";

const rewardRepo = new RewardRepository();

export class RewardService {
  /**
   * @deprecated - Use claimReward from loyaltyService.ts
   */
  static async claimReward({ userId, rewardId, idempotencyKey }: { userId: string; rewardId: string; idempotencyKey: string }) {
    return rewardRepo.claimReward(userId, rewardId, idempotencyKey);
  }
}
