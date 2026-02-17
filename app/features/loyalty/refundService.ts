import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/audit';
import { invalidateRelatedCaches } from '@/lib/cache';
import { LoyaltyError } from '@/lib/errors';
import { isValidUUID } from '@/lib/validation';

export interface RefundResult {
  claimId: string;
  userId: string;
  refundedPoints: number;
  newBalance: number;
  refundedAt: string;
  reason: string;
  refundedBy: string | null;
}

export interface RefundStatistics {
  totalRefunds: number;
  totalPointsRefunded: number;
  averageRefundPoints: number;
  topReason: string;
}

export async function refundClaim(
  claimId: string,
  reason: 'user_request' | 'admin_action' | 'system_error' | 'duplicate',
  refundedBy?: string | null
): Promise<RefundResult> {
  if (!isValidUUID(claimId)) {
    throw new LoyaltyError('INVALID_CLAIM_ID', 400, 'Invalid claim ID format');
  }

  return prisma.$transaction(async (tx) => {
    // Get claim with reward
    const claim = await tx.rewardClaim.findUnique({
      where: { id: claimId },
      include: { reward: true },
    });

    if (!claim) {
      throw new LoyaltyError(
        'CLAIM_NOT_FOUND',
        404,
        'Talep bulunamadı'
      );
    }

    // Check if already refunded
    if (claim.status === 'refunded') {
      throw new LoyaltyError(
        'ALREADY_REFUNDED',
        409,
        'Bu talep zaten iade edildi'
      );
    }

    // Get reward cost
    const refundedPoints = claim.reward?.costPoints ?? 0;

    // Return points to user
    const loyaltyPoint = await tx.loyaltyPoint.upsert({
      where: { userId: claim.userId },
      update: { points: { increment: refundedPoints } },
      create: { userId: claim.userId, points: refundedPoints },
    });

    // Update claim status
    const refundedAt = new Date();
    await tx.rewardClaim.update({
      where: { id: claimId },
      data: {
        status: 'refunded',
        refundReason: reason,
        refundedAt,
        refundedBy: refundedBy ?? null,
      },
    });

    // Audit log
    try {
      await auditLog({
        action: 'REFUND_CLAIM',
        userId: claim.userId,
        resourceId: claimId,
        resourceType: 'claim',
        status: 'SUCCESS',
        metadata: {
          reason,
          pointsRefunded: refundedPoints,
          refundedBy: refundedBy ?? 'system',
        },
      });
    } catch (auditErr) {
      console.warn('Audit log failed for refundClaim', String(auditErr));
    }

    // Cache invalidation
    try {
      invalidateRelatedCaches('claim', claim.userId);
    } catch (cacheErr) {
      console.warn('Cache invalidation failed for refundClaim', String(cacheErr));
    }

    return {
      claimId,
      userId: claim.userId,
      refundedPoints,
      newBalance: loyaltyPoint.points,
      refundedAt: refundedAt.toISOString(),
      reason,
      refundedBy: refundedBy ?? null,
    };
  }).catch((err) => {
    if (err instanceof LoyaltyError) throw err;
    throw new LoyaltyError(
      'REFUND_TRANSACTION_ERROR',
      500,
      'İade işlemi başarısız oldu',
      { metadata: { cause: String(err) } },
      true
    );
  });
}

export async function getUserRefundHistory(userId: string, limit = 50) {
  if (!isValidUUID(userId)) {
    throw new LoyaltyError('INVALID_USER_ID', 400, 'Invalid user ID format');
  }

  return prisma.rewardClaim.findMany({
    where: {
      userId,
      status: 'refunded',
    },
    include: { reward: true },
    orderBy: { refundedAt: 'desc' },
    take: limit,
  });
}

export async function getRefundStatistics(
  hours = 24
): Promise<RefundStatistics> {
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

  const refunds = await prisma.rewardClaim.findMany({
    where: {
      status: 'refunded',
      refundedAt: {
        gte: startTime,
      },
    },
    include: { reward: true },
  });

  const totalRefunds = refunds.length;
  const totalPointsRefunded = refunds.reduce(
    (sum, ref) => sum + (ref.reward?.costPoints ?? 0),
    0
  );

  const reasonCounts: Record<string, number> = {};
  refunds.forEach((ref) => {
    reasonCounts[ref.refundReason ?? 'unknown'] =
      (reasonCounts[ref.refundReason ?? 'unknown'] ?? 0) + 1;
  });

  const topReason =
    Object.entries(reasonCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ??
    'none';

  return {
    totalRefunds,
    totalPointsRefunded,
    averageRefundPoints:
      totalRefunds > 0 ? totalPointsRefunded / totalRefunds : 0,
    topReason,
  };
}

export async function cancelAllUserClaims(
  userId: string,
  reason: 'user_request' | 'admin_action' | 'system_error' | 'duplicate',
  adminId: string
) {
  if (!isValidUUID(userId) || !isValidUUID(adminId)) {
    throw new LoyaltyError(
      'INVALID_IDS',
      400,
      'Invalid user ID or admin ID format'
    );
  }

  const claims = await prisma.rewardClaim.findMany({
    where: {
      userId,
      status: { not: 'refunded' },
    },
  });

  const results: Array<RefundResult & { success: boolean } | { claimId: string; success: boolean; error: string }> = [];
  for (const claim of claims) {
    try {
      const result = await refundClaim(claim.id, reason, adminId);
      results.push({ ...result, success: true });
    } catch (err) {
      results.push({
        claimId: claim.id,
        success: false,
        error: String(err),
      });
    }
  }

  return results;
}
