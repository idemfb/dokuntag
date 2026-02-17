/**
 * Admin Dashboard API Endpoints
 * Protected endpoints for admin operations
 */
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromRequest } from '@/lib/auth';
import { validateAdminStatsRequest } from '@/lib/validation';
import { getAdminStats, overrideUserPoints, bulkAddPoints } from '@/app/features/loyalty/adminService';
import { logInfo, logWarn, logError } from '@/lib/logger';
import { auditLog } from '@/lib/audit';
import { formatErrorResponse } from '@/lib/errors';
import { withErrorHandler } from '@/lib/errorHandler';

export const GET = withErrorHandler(async (request: NextRequest) => {
  // Enforce JWT auth and admin role directly from the incoming request
  const auth = await requireAuthFromRequest(request, 'admin');

  // Get stats
  const stats = await getAdminStats();

  // Log successful operation
  await auditLog({
    action: 'VIEW_STATS',
    userId: auth.userId,
    resourceId: 'system',
    resourceType: 'admin',
    status: 'SUCCESS',
    metadata: { stats },
  });

  return NextResponse.json(stats, { status: 200 });
});
