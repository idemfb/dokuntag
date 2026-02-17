import { NextRequest, NextResponse } from 'next/server';
import { parseAuthContext, requireAuth } from '@/lib/auth';
import { refundClaim, getRefundStatistics } from '@/lib/refund-service';
import { withErrorHandler } from '@/lib/errorHandler';
import { parseBody, refundSchema } from '@/lib/schemas';

/**
 * POST /api/admin/refund
 * Admin-only endpoint to refund a reward claim
 * Reverses points and marks claim as refunded
 * 
 * Request body:
 * {
 *   claimId: string (CUID)
 *   reason: 'user_request' | 'admin_action' | 'system_error' | 'duplicate'
 * }
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  // Parse authentication
  const headers = Object.fromEntries(req.headers.entries());
  const authContext = await parseAuthContext(headers);

  // Require admin role
  requireAuth(authContext, 'admin');

  // Parse request body
  const { claimId, reason } = await parseBody(req, refundSchema);

  // Process refund
  const result = await refundClaim(claimId, reason, authContext.userId);

  return NextResponse.json(
    {
      success: true,
      data: result,
    },
    { status: 200 }
  );
});

/**
 * GET /api/admin/refund
 * List recent refunds (admin only)
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  // Parse authentication
  const headers = Object.fromEntries(req.headers.entries());
  const authContext = await parseAuthContext(headers);

  // Require admin role
  requireAuth(authContext, 'admin');

  // Get URL parameters
  const limit = req.nextUrl.searchParams.get('limit')
    ? parseInt(req.nextUrl.searchParams.get('limit') || '10')
    : 10;
  const hoursBack = req.nextUrl.searchParams.get('hours')
    ? parseInt(req.nextUrl.searchParams.get('hours') || '24')
    : 24;

  const stats = await getRefundStatistics(hoursBack);

  return NextResponse.json(
    {
      success: true,
      data: stats,
    },
    { status: 200 }
  );
});
