import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { generateTestToken, TEST_USERS } from './test-helpers.js';

const prisma = new PrismaClient();
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const CONCURRENT_REQUESTS = 10;

async function setupTestData() {
  // Use seeded test user — don't delete/recreate
  // Just clear existing claims for this test
  await prisma.rewardClaim.deleteMany({
    where: { userId: 'concurrent_test_user' }
  });

  let user = await prisma.user.findUnique({
    where: { id: 'concurrent_test_user' }
  });

  let reward = await prisma.reward.findUnique({
    where: { id: 'concurrent_test_reward' }
  });

  // If not seeded, create them
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: 'concurrent_test_user',
        email: `concurrent_test_${Date.now()}@test.com`,
        name: 'Concurrency Test User',
        passwordHash: 'placeholder',
        role: 'user',
        loyaltyPoint: { create: { points: 5000 } },
      },
    });
  }

  if (!reward) {
    reward = await prisma.reward.create({
      data: {
        id: 'concurrent_test_reward',
        title: 'Concurrency Test Reward',
        costPoints: 100,
        active: true,
      },
    });
  } else {
    // Ensure reward is active
    if (!reward.active) {
      reward = await prisma.reward.update({
        where: { id: 'concurrent_test_reward' },
        data: { active: true }
      });
    }
  }

  // Ensure user has 5000 points for the test
  await prisma.loyaltyPoint.upsert({
    where: { userId: 'concurrent_test_user' },
    update: { points: 5000 },
    create: { userId: 'concurrent_test_user', points: 5000 }
  });

  return { user, reward };
}

async function runConcurrencyTest() {
  const { user, reward } = await setupTestData();

  console.log(`\n🚀 === CONCURRENCY TEST BAŞLATILDI ===\n`);
  console.log(`Kullanıcı: ${user.id}`);
  console.log(`Ödül: ${reward.title} (${reward.costPoints} puan)`);
  console.log(`Concurrent Request Sayısı: ${CONCURRENT_REQUESTS}`);

  // Generate JWT token for test user (strict JWT-only auth)
  const token = await generateTestToken(TEST_USERS.CONCURRENT_TEST);
  const authHeader = `Bearer ${token}`;

  const requests = Array.from({ length: CONCURRENT_REQUESTS }, (_, i) => ({
    userId: user.id,
    rewardId: reward.id,
    idempotencyKey: randomUUID(),
    requestNo: i + 1,
  }));

  console.log(
    `⏱️ ${CONCURRENT_REQUESTS} adet concurrent claim başlatılıyor...\n`
  );

  const startTime = Date.now();
  const results = await Promise.allSettled(
    requests.map((req, i) =>
      fetch(`${BASE_URL}/api/loyalty/claimReward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'X-Forwarded-For': `192.168.1.${i + 100}`, // Different IPs for rate limiting
        },
        body: JSON.stringify({
          userId: req.userId,
          rewardId: req.rewardId,
          idempotencyKey: req.idempotencyKey,
        }),
      })
        .then((res) => res.json())
        .then((data) => ({ ...data, requestNo: req.requestNo, status: 'success' }))
        .catch((error) => ({
          error: error.message,
          requestNo: req.requestNo,
          status: 'failed',
        }))
    )
  );
  const duration = Date.now() - startTime;

  const successful = results.filter(
    (r) => r.status === 'fulfilled' && !('error' in r.value)
  ).length;
  const failed = results.filter(
    (r) => r.status === 'fulfilled' && 'error' in r.value
  ).length;
  const rejected = results.filter((r) => r.status === 'rejected').length;

  console.log(`\n📊 SONUÇLAR (${duration}ms'de tamamlandı):\n`);
  console.log(`✅ Başarılı: ${successful}`);
  console.log(`❌ Başarısız: ${failed}`);
  console.log(`⚠️  Rejected: ${rejected}`);

  // Log first few errors for debugging
  const failedResults = results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((v) => 'error' in v)
    .slice(0, 3);
  
  if (failedResults.length > 0) {
    console.log(`\n📋 Sample Errors:`);
    failedResults.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.error || 'Unknown error'}`);
    });
  }

  const finalPoints = await prisma.loyaltyPoint.findUnique({
    where: { userId: user.id },
  });
  const totalClaims = await prisma.rewardClaim.count({
    where: { userId: user.id, rewardId: reward.id },
  });

  console.log(`\n💾 VERİTABANI DURUMU:`);
  console.log(`Kalan Puan: ${finalPoints?.points}`);
  console.log(`Toplam Claim Sayısı: ${totalClaims}`);
  console.log(`Expected Puan: ${5000 - successful * 100}`);

  if (successful > 0 && finalPoints?.points === 5000 - successful * 100) {
    console.log(`\n✅ === TEST BAŞARILI ===\n`);
  } else {
    console.log(`\n⚠️ === TEST TAMAMLANDI ===\n`);
  }

  await prisma.$disconnect();
}

runConcurrencyTest().catch((err) => {
  console.error('Test hatası:', err);
  process.exit(1);
});
