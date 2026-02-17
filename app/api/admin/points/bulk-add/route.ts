/**
 * Admin: Bulk Add Points
 * POST /api/admin/points/bulk-add
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseAuthContext, requireAuth } from '@/lib/auth';
import { validateBulkPointsRequest } from '@/lib/validation';
import { bulkAddPoints } from '@/app/features/loyalty/adminService';
import { logInfo, logWarn, logError } from '@/lib/logger';
import { auditLog } from '@/lib/audit';
import { formatErrorResponse } from '@/lib/errors';
import { withErrorHandler } from '@/lib/errorHandler';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const headers = Object.fromEntries(request.headers);
  const auth = await parseAuthContext(headers);

  // Require admin role (JWT-only, strict)
  requireAuth(auth, 'admin');

  // Validate request
  const body = await request.json();
  const { userIds, points, reason } = validateBulkPointsRequest(body);

  // Execute bulk operation
  const result = await bulkAddPoints(userIds, points, reason, auth.userId);

  // Log
  await auditLog({
    action: 'BULK_ADD_POINTS',
    userId: auth.userId,
    resourceId: 'bulk_operation',
    resourceType: 'system',
    status: result.failureCount === 0 ? 'SUCCESS' : 'PARTIAL_SUCCESS',
    metadata: {
      reason,
      totalUsers: userIds.length,
      successCount: result.successCount,
      failureCount: result.failureCount,
    },
  });

  logInfo('ADMIN_BULK_ADD', { successCount: result.successCount, failureCount: result.failureCount, adminId: auth.userId });
  return NextResponse.json(result, { status: 200 });
});
