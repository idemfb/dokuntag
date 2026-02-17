import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { userId, rewardId, idempotencyKey } = await req.json();

    if (!userId || !rewardId) {
      return NextResponse.json(
        { error: 'userId and rewardId required' },
        { status: 400 }
      );
    }

    const key = idempotencyKey || uuidv4();

    // Check if already claimed (idempotency)
    const existing = await prisma.rewardClaim.findUnique({
      where: { idempotencyKey: key },
      include: { reward: true },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: true,
          claim: existing,
          message: 'Already claimed (idempotent)',
        },
        { status: 200 }
      );
    }

    // Verify user and reward
    const [user, reward] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.reward.findUnique({ where: { id: rewardId } }),
    ]);

    if (!user || !reward) {
      return NextResponse.json(
        { error: 'User or reward not found' },
        { status: 404 }
      );
    }

    if (!reward.active) {
      return NextResponse.json(
        { error: 'Reward is not active' },
        { status: 400 }
      );
    }

    // Check loyalty points in transaction
    const claim = await prisma.$transaction(async (tx) => {
      const points = await tx.loyaltyPoint.findUnique({
        where: { userId },
      });

      if (!points || points.points < reward.costPoints) {
        throw new Error('Insufficient points');
      }

      // Deduct points
      await tx.loyaltyPoint.update({
        where: { userId },
        data: { points: { decrement: reward.costPoints } },
      });

      // Create claim
      const newClaim = await tx.rewardClaim.create({
        data: {
          userId,
          rewardId,
          idempotencyKey: key,
          status: 'claimed',
        },
        include: { reward: true },
      });

      return newClaim;
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'CLAIM_REWARD',
        userId,
        resourceType: 'reward',
        resourceId: claim.id,
        status: 'SUCCESS',
        metadata: JSON.stringify({
          rewardId,
          costPoints: reward.costPoints,
        }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        claim,
        message: `Reward claimed successfully`,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to claim reward';

    await prisma.auditLog.create({
      data: {
        action: 'CLAIM_REWARD',
        userId: req.nextUrl.searchParams.get('userId') || 'unknown',
        status: 'FAILED',
        failureReason: message,
      },
    });

    console.error('POST /api/claim error:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    const claims = await prisma.rewardClaim.findMany({
      where: { userId },
      include: { reward: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ userId, claims, total: claims.length });
  } catch (error) {
    console.error('GET /api/claim error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}
