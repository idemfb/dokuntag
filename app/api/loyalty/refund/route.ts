import { NextRequest, NextResponse } from 'next/server';
import { refundClaim } from '@/app/features/loyalty/refundService';
import { auditLog } from '@/lib/audit';
import { logInfo, logWarn, logError } from '@/lib/logger';
import { parseBody, refundSchema } from '@/lib/schemas';
import { isLoyaltyError, formatErrorResponse } from '@/lib/errors';
import { withErrorHandler } from '@/lib/errorHandler';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

  logInfo('REFUND_CLAIM_ATTEMPT', { requestId });

  // Parse and validate request body
  const { claimId, reason } = await parseBody(req, refundSchema);

    // Get user info from headers (in production, use JWT)
    const userId = req.headers.get('x-user-id') || 'anonymous';
    const isAdmin = req.headers.get('x-is-admin') === 'true';

    // Permission check
    if (!isAdmin && userId === 'anonymous') {
      logWarn('REFUND_UNAUTHORIZED', { requestId });
      return NextResponse.json(
        {
          code: 'UNAUTHORIZED',
          message: 'Bu işlem için yetkiye ihtiyacınız vardır',
        },
        { status: 401 }
      );
    }

    // Process refund
    const result = await refundClaim(claimId, reason as any, isAdmin ? userId : undefined);

    // Audit log success
    await auditLog({
      action: 'REFUND_CLAIM',
      userId: isAdmin ? userId : result.userId,
      resourceId: claimId,
      resourceType: 'claim',
      status: 'SUCCESS',
      metadata: { reason, isAdmin },
    });

    logInfo('REFUND_SUCCESS', { requestId, claimId, refundedPoints: result.refundedPoints });

    return NextResponse.json(result, { status: 200 });
});
