export const dynamic = "force-dynamic";

import { NextRequest } from 'next/server';
import { getUserPoints } from '../../../features/loyalty/loyaltyService';
import { validateGetPointsRequest } from '@/lib/validation';
import { ok, fail } from '@/lib/response';

/**
 * GET /api/loyalty/points?userId=...
 * Get user loyalty points balance
 */
export async function GET(req: NextRequest) {
  try {
    const rawUserId = req.nextUrl.searchParams.get('userId');
    const { userId } = validateGetPointsRequest(rawUserId);
    const data = await getUserPoints(userId);
    return ok(data);
  } catch (error: any) {
    return fail({ code: error.code || 'INTERNAL', message: 'İşlem gerçekleştirilemedi.' }, error.statusCode || 500);
  }
}
