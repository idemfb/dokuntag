/**
 * Refund & Cancellation Service
 * Handles refund processing with transaction safety and audit logging
 * Atomic point reversal and claim status updates
 */

import { prisma } from './prisma';

export interface RefundResult {
  success: boolean;
  claimId: string;
  refundedPoints: number;
  newUserBalance: number;
  refundReason: string;
  timestamp: Date;
}

/**
 * Refund a reward claim - reverse points and mark as refunded
 * Transaction-safe with atomic point restoration
 * 
 * @param claimId - The ID of the claim to refund
 * @param reason - Reason for refund: 'user_request', 'admin_action', 'system_error', 'duplicate'
 * @param refundedBy - Optional admin user ID who processed the refund
 */
export async function refundClaim(
  claimId: string,
  reason: 'user_request' | 'admin_action' | 'system_error' | 'duplicate',
  refundedBy?: string
): Promise<RefundResult> {
  return prisma.$transaction(async (tx) => {
    // Step 1: Find the claim
    const claim = await tx.rewardClaim.findUnique({
      where: { id: claimId },
      include: { reward: true, user: true },
    });

    if (!claim) {
      throw new Error(`Claim bulunamadı: ${claimId}`);
    }

    // Step 2: Check if already refunded
    if (claim.refundedAt) {
      throw new Error(`Bu claim zaten refund edilmiş: ${claim.refundedAt}`);
    }

    // Step 3: Get reward cost points
    const rewardCostPoints = claim.reward.costPoints;

    // Step 4: Restore points to user atomically
    const updatedPoints = await tx.loyaltyPoint.update({
      where: { userId: claim.userId },
      data: {
        points: { increment: rewardCostPoints },
      },
    });

    // Step 5: Mark claim as refunded
    const refundedClaim = await tx.rewardClaim.update({
      where: { id: claimId },
      data: {
        status: 'refunded',
        refundReason: reason,
        refundedAt: new Date(),
        refundedBy: refundedBy || 'system',
      },
    });

    // Step 6: Log refund action
    await tx.auditLog.create({
      data: {
        action: 'REFUND_CLAIM',
        userId: claim.userId,
        resourceId: claimId,
        resourceType: 'claim',
        status: 'SUCCESS',
        metadata: JSON.stringify({
          reason,
          refundedPoints: rewardCostPoints,
          newBalance: updatedPoints.points,
          refundedBy: refundedBy || 'system',
        }),
      },
    });

    return {
      success: true,
      claimId,
      refundedPoints: rewardCostPoints,
      newUserBalance: updatedPoints.points,
      refundReason: reason,
      timestamp: refundedClaim.refundedAt || new Date(),
    };
  });
}

/**
 * Get refund history for a user
 */
export async function getUserRefundHistory(userId: string, limit: number = 10) {
  return prisma.rewardClaim.findMany({
    where: {
      userId,
      refundedAt: { not: null },
    },
    include: { reward: true },
    orderBy: { refundedAt: 'desc' },
    take: limit,
  });
}

/**
 * Get refund statistics for dashboard
 */
export async function getRefundStatistics(hoursBack: number = 24) {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const refunds = await prisma.rewardClaim.findMany({
    where: {
      refundedAt: { gte: since },
    },
    include: { reward: true },
  });

  const totalRefunded = refunds.reduce((sum, r) => sum + r.reward.costPoints, 0);
  const refundCount = refunds.length;

  return {
    period: `${hoursBack}h`,
    refundCount,
    totalPointsRestored: totalRefunded,
    refunds,
  };
}

/**
 * Cancel all claims for a user (admin action)
 * Useful for account closure or fraud resolution
 */
export async function cancelAllUserClaims(
  userId: string,
  reason: string,
  adminId: string
) {
  const claim = await prisma.$transaction(async (tx) => {
    // Get all non-refunded claims
    const claims = await tx.rewardClaim.findMany({
      where: {
        userId,
        refundedAt: null,
      },
      include: { reward: true },
    });

    let totalPointsRestored = 0;

    // Refund each claim
    for (const c of claims) {
      // Update claim
      await tx.rewardClaim.update({
        where: { id: c.id },
        data: {
          status: 'refunded',
          refundReason: reason,
          refundedAt: new Date(),
          refundedBy: adminId,
        },
      });

      // Restore points
      await tx.loyaltyPoint.update({
        where: { userId },
        data: {
          points: { increment: c.reward.costPoints },
        },
      });

      totalPointsRestored += c.reward.costPoints;
    }

    // Log bulk action
    await tx.auditLog.create({
      data: {
        action: 'BULK_REFUND_CLAIMS',
        userId,
        resourceType: 'user',
        status: 'SUCCESS',
        metadata: JSON.stringify({
          reason,
          claimsRefunded: claims.length,
          totalPointsRestored,
          adminId,
        }),
      },
    });

    return {
      claimsRefunded: claims.length,
      totalPointsRestored,
    };
  });

  return claim;
}
