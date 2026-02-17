/**
 * Audit Log Model ve Service
 * Tüm operasyonları tracked tutar - compliance, debugging, fraud detection
 */

import { prisma } from './prisma';
import { logInfo, logWarn, logError } from './logger';

export type AuditAction =
  | 'CLAIM_REWARD'
  | 'ADD_POINTS'
  | 'REFUND_CLAIM'
  | 'UPDATE_REWARD'
  | 'USER_CREATED'
  | 'POINTS_DEDUCTED'
  | 'CLAIM_CANCELLED'
  | 'OVERRIDE_POINTS'
  | 'BULK_ADD_POINTS'
  | 'VIEW_STATS';

export interface AuditLogData {
  action: AuditAction;
  userId: string;
  resourceId?: string;
  resourceType?: string;
  changes?: Record<string, { before: any; after: any }>;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'PARTIAL_SUCCESS';
  failureReason?: string;
  metadata?: Record<string, any>;
}

/**
 * Create audit log - call this for every important operation
 */
export async function auditLog(data: AuditLogData) {
  try {
  const log = await prisma.auditLog.create({
      data: {
        action: data.action,
        userId: data.userId,
        resourceId: data.resourceId,
        resourceType: data.resourceType,
        changes: data.changes ? JSON.stringify(data.changes) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        status: data.status,
        failureReason: data.failureReason,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });

    logInfo('AUDIT_LOG', { auditId: log.id, action: data.action, userId: data.userId });

    return log;
  } catch (error) {
    logError('AUDIT_LOG_ERROR', { error, data });
    // Don't throw - audit logging should never break the main operation
  }
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(userId: string, limit: number = 50) {
  return await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  limit: number = 100
) {
  return await prisma.auditLog.findMany({
    where: {
      resourceType,
      resourceId,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get failed operations for investigation
 */
export async function getFailedOperations(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  return await prisma.auditLog.findMany({
    where: {
      status: 'FAILED',
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get activity summary for dashboard
 */
export async function getActivitySummary(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const [successCount, failureCount, actionBreakdown] = await Promise.all([
    prisma.auditLog.count({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: since },
      },
    }),
    prisma.auditLog.count({
      where: {
        status: 'FAILED',
        createdAt: { gte: since },
      },
    }),
    prisma.auditLog.groupBy({
      by: ['action'],
      where: { createdAt: { gte: since } },
      _count: true,
    }),
  ]);

  return {
    period: `${hours} saat`,
    successCount,
    failureCount,
    successRate: successCount / (successCount + failureCount),
    actionBreakdown: actionBreakdown.reduce(
      (acc, item) => ({
        ...acc,
        [item.action]: item._count,
      }),
      {} as Record<string, number>
    ),
  };
}
