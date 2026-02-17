/**
 * Admin: Override User Points
 * POST /api/admin/points/override
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseAuthContext, requireAuth } from '@/lib/auth';
import { validatePointsOverrideRequest } from '@/lib/validation';
import { overrideUserPoints } from '@/app/features/loyalty/adminService';
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
  const { userId, newPoints, reason } = validatePointsOverrideRequest(body);

  // Execute override
  const result = await overrideUserPoints(userId, newPoints, reason, auth.userId);

  // Log
  await auditLog({
    action: 'OVERRIDE_POINTS',
    userId: auth.userId,
    resourceId: userId,
    resourceType: 'user',
    status: 'SUCCESS',
    metadata: result,
  });

  logInfo('ADMIN_POINTS_INVALIDATED', { userId, newPoints, adminId: auth.userId });
  return NextResponse.json(result, { status: 200 });
});
