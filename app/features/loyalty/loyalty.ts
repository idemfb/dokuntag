// Bu dosya legacy fonksiyonlar içeriyor. Yeni kod için loyaltyService.ts kullanın.
// Gradual migration için burada tutulmuştur.

import { prisma } from '../../../lib/prisma';
import { logInfo, logWarn, logError } from '../../../lib/logger';

/**
 * @deprecated loyaltyService.ts kullanın
 * Transaksyon ve idempotency desteği yok
 */
export async function getUserPointsLegacy(userId: string) {
  const points = await prisma.loyaltyPoint.findUnique({
    where: { userId },
  });
  return points ?? { userId, points: 0, createdAt: new Date(), updatedAt: new Date() };
}

/**
 * @deprecated loyaltyService.ts kullanın
 * Basit read-only operasyonlar için kullanılabilir
 */
export async function listRewardsLegacy() {
  logInfo('LEGACY_LIST_REWARDS', {});
  return await prisma.reward.findMany({ where: { active: true } });
}
