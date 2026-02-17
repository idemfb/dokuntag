// lib/repositories/reward.repository.ts
// @deprecated - loyaltyService.ts를 사용하세요 (Use loyaltyService.ts instead)

import { prisma } from "../prisma";

export class RewardRepository {
  /**
   * @deprecated - Use claimReward from loyaltyService.ts
   */
  async claimReward(userId: string, rewardId: string, idempotencyKey: string) {
    return prisma.$transaction(async (tx) => {
      // 1️⃣ Aynı idempotencyKey daha önce kullanılmış mı?
      const existing = await tx.rewardClaim.findUnique({
        where: { idempotencyKey },
      });

      if (existing) {
        return existing; // idempotent davranış
      }

      // 2️⃣ Reward kontrolü
      const reward = await tx.reward.findUnique({
        where: { id: rewardId },
      });

      if (!reward) throw new Error("Reward not found");

      // 3️⃣ Kullanıcı puan kontrolü
      const userPoints = await tx.loyaltyPoint.findUnique({
        where: { userId },
      });

      if (!userPoints || userPoints.points < reward.costPoints)
        throw new Error("Not enough points");

      // 4️⃣ Puan düş
      await tx.loyaltyPoint.update({
        where: { userId },
        data: { points: userPoints.points - reward.costPoints },
      });

      // 5️⃣ Claim oluştur
      return tx.rewardClaim.create({
        data: {
          userId,
          rewardId,
          idempotencyKey,
        },
      });
    });
  }
}
