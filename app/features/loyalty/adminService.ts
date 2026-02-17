/**
 * Admin Service
 * Handles admin operations: user management, points override, analytics, etc.
 */

import { PrismaClient } from '@prisma/client';
import { logInfo, logWarn, logError } from '@/lib/logger';
import { UnauthorizedError, DatabaseError, ValidationError } from '@/lib/errors';
import { auditLog } from '@/lib/audit';
import { invalidateRelatedCaches } from '@/lib/cache';

const prisma = new PrismaClient();

export interface AdminStats {
  totalUsers: number;
  totalPoints: number;
  totalClaims: number;
  activeClaims: number;
  refundedClaims: number;
  totalRewards: number;
  activeRewards: number;
}

export interface UserPointsOverride {
  userId: string;
  previousPoints: number;
  newPoints: number;
  reason: string;
  adminId: string;
}

export interface BulkPointsOperation {
  successCount: number;
  failureCount: number;
  operations: Array<{ userId: string; success: boolean; message?: string }>;
}

/**
 * Get system statistics for admin dashboard
 */
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const [totalUsers, totalPoints, totalClaims, refundedClaims, totalRewards, activeRewards] = await Promise.all([
      prisma.user.count(),
      prisma.loyaltyPoint.aggregate({
        _sum: { points: true },
      }),
      prisma.rewardClaim.count(),
      prisma.rewardClaim.count({ where: { status: 'refunded' } }),
      prisma.reward.count(),
      prisma.reward.count({ where: { active: true } }),
    ]);

    const activeClaims = totalClaims - refundedClaims;

    return {
      totalUsers,
      totalPoints: totalPoints._sum.points || 0,
      totalClaims,
      activeClaims,
      refundedClaims,
      totalRewards,
      activeRewards,
    };
  } catch (error) {
    logError('ADMIN_STATS_ERROR', { error });
    throw new DatabaseError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Get detailed user info for admin
 */
export async function getUserDetailedInfo(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        loyaltyPoint: true,
        rewardClaims: {
          include: { reward: true },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    return user;
  } catch (error) {
    logError('USER_FETCH_ERROR', { userId, error });
    throw new DatabaseError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Override user loyalty points (admin only)
 * Used for: corrections, promotions, manual adjustments
 */
export async function overrideUserPoints(
  userId: string,
  newPoints: number,
  reason: string,
  adminId: string
): Promise<UserPointsOverride> {
  if (newPoints < 0) {
    throw new ValidationError('newPoints', 'Puanlar negatif olamaz');
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // Get current points
      const currentRecord = await tx.loyaltyPoint.findUnique({
        where: { userId },
      });

      const previousPoints = currentRecord?.points || 0;

      // Update points
      const updated = await tx.loyaltyPoint.upsert({
        where: { userId },
        update: { points: newPoints },
        create: { userId, points: newPoints },
      });

      // Audit log
      await auditLog({
        action: 'OVERRIDE_POINTS',
        userId: adminId,
        resourceId: userId,
        resourceType: 'user',
        status: 'SUCCESS',
        metadata: {
          reason,
          previousPoints,
          newPoints,
          difference: newPoints - previousPoints,
        },
      });

      // Invalidate cache
      invalidateRelatedCaches('points', userId);

      logInfo('ADMIN_OVERRIDE', { userId, previousPoints, newPoints, adminId, reason });

      return {
        userId,
        previousPoints,
        newPoints,
        reason,
        adminId,
      };
    });
  } catch (error) {
    logError('POINTS_INVALIDATE_ERROR', { userId, error });
    await auditLog({
      action: 'OVERRIDE_POINTS',
      userId: adminId,
      resourceId: userId,
      resourceType: 'user',
      status: 'FAILED',
      metadata: { reason, error: String(error) },
    });
    throw new DatabaseError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Bulk add points to multiple users
 */
export async function bulkAddPoints(
  userIds: string[],
  pointsToAdd: number,
  reason: string,
  adminId: string
): Promise<BulkPointsOperation> {
  const operations: BulkPointsOperation['operations'] = [];
  let successCount = 0;
  let failureCount = 0;

  for (const userId of userIds) {
    try {
      await prisma.loyaltyPoint.upsert({
        where: { userId },
        update: { points: { increment: pointsToAdd } },
        create: { userId, points: pointsToAdd },
      });

      operations.push({ userId, success: true });
      successCount++;

      // Invalidate cache
      invalidateRelatedCaches('points', userId);

      await auditLog({
        action: 'BULK_ADD_POINTS',
        userId: adminId,
        resourceId: userId,
        resourceType: 'user',
        status: 'SUCCESS',
        metadata: { reason, pointsToAdd },
      });
    } catch (error) {
      operations.push({ userId, success: false, message: String(error) });
      failureCount++;

      await auditLog({
        action: 'BULK_ADD_POINTS',
        userId: adminId,
        resourceId: userId,
        resourceType: 'user',
        status: 'FAILED',
        metadata: { reason, pointsToAdd, error: String(error) },
      });
    }
  }

  logInfo('ADMIN_ACTION', { successCount, failureCount, totalUsers: userIds.length, adminId, reason });

  return { successCount, failureCount, operations };
}

/**
 * Disable/Enable reward
 */
export async function updateRewardStatus(
  rewardId: string,
  active: boolean,
  adminId: string,
  reason?: string
): Promise<any> {
  try {
    const reward = await prisma.reward.update({
      where: { id: rewardId },
      data: { active },
    });

    await auditLog({
      action: 'UPDATE_REWARD',
      userId: adminId,
      resourceId: rewardId,
      resourceType: 'reward',
      status: 'SUCCESS',
      metadata: { active, reason },
    });

    logInfo('REWARD_STATUS_UPDATED', { rewardId, active, adminId });
    return reward;
  } catch (error) {
    logError('REWARD_STATUS_UPDATE_ERROR', { rewardId, error });
    throw new DatabaseError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Get top spending users
 */
export async function getTopSpendingUsers(limit: number = 10) {
  try {
    const result = await prisma.rewardClaim.groupBy({
      by: ['userId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    return result;
  } catch (error) {
    logError('TOP_SPENDERS_FETCH_ERROR', { error });
    throw new DatabaseError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Get user claims history with filters
 */
export async function getUserClaimsHistory(
  userId: string,
  filters?: { status?: string; rewardId?: string; limit?: number }
) {
  try {
    const limit = filters?.limit || 50;
    const claims = await prisma.rewardClaim.findMany({
      where: {
        userId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.rewardId && { rewardId: filters.rewardId }),
      },
      include: {
        reward: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return claims;
  } catch (error) {
    logError('CLAIM_HISTORY_FETCH_ERROR', { userId, error });
    throw new DatabaseError(error instanceof Error ? error : new Error(String(error)));
  }
}
