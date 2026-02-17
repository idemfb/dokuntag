export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { listActiveRewards } from '../../../features/loyalty/loyaltyService';
import { withErrorHandler } from '@/lib/errorHandler';

/**
 * GET /api/loyalty/rewards
 * List all active rewards that users can claim
 */
export const GET = withErrorHandler(async (req: NextRequest) => {
  const url = new URL(req.url);

  const querySchema = z.object({
    limit: z.preprocess((v) => (v === undefined ? undefined : Number(v)), z.number().int().positive().max(100).optional()),
    page: z.preprocess((v) => (v === undefined ? undefined : Number(v)), z.number().int().positive().optional()),
  });

  const parsed = querySchema.parse(Object.fromEntries(url.searchParams.entries()));

  // For now listActiveRewards ignores pagination but we validate inputs
  const rewards = await listActiveRewards();
  return NextResponse.json({ success: true, data: rewards, meta: parsed }, { status: 200 });
});