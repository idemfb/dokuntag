import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugP2002() {
  console.log('\n🔍 === DEBUG P2002 ERROR META ===\n');

  // Setup test user
  await prisma.user.upsert({
    where: { id: 'debug_user' },
    update: {},
    create: {
      id: 'debug_user',
      email: 'debug@test.com',
      name: 'Debug User',
      passwordHash: 'placeholder',
      role: 'user',
      loyaltyPoint: { create: { points: 1000 } },
    },
  });

  // Setup test reward
  await prisma.reward.upsert({
    where: { id: 'debug_reward' },
    update: { active: true },
    create: {
      id: 'debug_reward',
      title: 'Debug Reward',
      costPoints: 100,
      active: true,
    },
  });

  // Clear existing claims
  await prisma.rewardClaim.deleteMany({
    where: { userId: 'debug_user', rewardId: 'debug_reward' },
  });

  // First claim - should succeed
  const firstClaim = await prisma.rewardClaim.create({
    data: {
      userId: 'debug_user',
      rewardId: 'debug_reward',
      idempotencyKey: 'first-claim',
    },
  });

  console.log('✅ First claim created:', firstClaim.id);

  // Second claim - should fail with P2002 (userId + rewardId unique constraint)
  try {
    const secondClaim = await prisma.rewardClaim.create({
      data: {
        userId: 'debug_user',
        rewardId: 'debug_reward',
        idempotencyKey: 'second-claim',
      },
    });
    console.log('❌ Second claim should have failed but succeeded:', secondClaim.id);
  } catch (e: any) {
    if (e.code === 'P2002') {
      console.log('✅ Got P2002 error as expected');
      console.log('Error code:', e.code);
      console.log('Error message:', e.message);
      console.log('Meta object:', JSON.stringify(e.meta, null, 2));
      console.log('Meta.target:', e.meta?.target);
      console.log('Meta.target (stringified):', JSON.stringify(e.meta?.target));
    } else {
      console.log('❌ Got unexpected error code:', e.code);
      console.log('Error:', e);
    }
  }

  // Third claim - should fail with P2002 (idempotencyKey unique constraint)
  console.log('\n--- Testing idempotencyKey uniqueness ---\n');

  try {
    const thirdClaim = await prisma.rewardClaim.create({
      data: {
        userId: 'debug_user_2',
        rewardId: 'debug_reward',
        idempotencyKey: 'first-claim', // Same idempotencyKey as first claim
      },
    });
    console.log('❌ Third claim should have failed but succeeded:', thirdClaim.id);
  } catch (e: any) {
    if (e.code === 'P2002') {
      console.log('✅ Got P2002 error for idempotencyKey constraint');
      console.log('Error code:', e.code);
      console.log('Error message:', e.message);
      console.log('Meta object:', JSON.stringify(e.meta, null, 2));
      console.log('Meta.target:', e.meta?.target);
      console.log('Meta.target (stringified):', JSON.stringify(e.meta?.target));
    } else {
      console.log('❌ Got unexpected error code:', e.code);
      console.log('Error:', e);
    }
  }

  await prisma.$disconnect();
}

debugP2002();
