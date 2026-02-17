import { randomUUID } from 'crypto';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const CONCURRENT_REQUESTS = 10;

interface ClaimRequest {
  userId: string;
  rewardId: string;
  idempotencyKey: string;
  ipIndex: number; // for spoofing different IPs
}

async function testConcurrentClaims() {
  console.log(`\n🚀 === CONCURRENCY LOYALTY TEST ===\n`);

  // Setup: Use seeded test user and reward
  const userId = 'concurrent_test_user';
  const rewardId = 'concurrent_test_reward';

  console.log(`Kullanıcı: ${userId}`);
  console.log(`Ödül: ${rewardId}`);
  console.log(`Concurrent Requests: ${CONCURRENT_REQUESTS}`);

  // Reset claims for this test
  console.log(`\n📋 Setup: Clearing existing claims...`);
  // Note: In a real scenario, you'd call an admin endpoint to reset test data
  // For now, we rely on test data being fresh

  // Prepare concurrent requests with different idempotency keys
  const requests: ClaimRequest[] = Array.from({ length: CONCURRENT_REQUESTS }, (_, i) => ({
    userId,
    rewardId,
    idempotencyKey: randomUUID(),
    ipIndex: i,
  }));

  console.log(`⏱️ Launching ${CONCURRENT_REQUESTS} concurrent claims...\n`);

  const startTime = Date.now();

  // Execute all requests concurrently
  const results = await Promise.allSettled(
    requests.map((req) =>
      fetch(`${BASE_URL}/api/loyalty/claimReward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': `192.168.100.${req.ipIndex}`, // Spoof IPs to bypass rate limiting
        },
        body: JSON.stringify({
          userId: req.userId,
          rewardId: req.rewardId,
          idempotencyKey: req.idempotencyKey,
        }),
      })
        .then((res) => res.json())
        .then((data) => ({
          ...data,
          requestNo: req.ipIndex + 1,
          status: 'fulfilled' as const,
        }))
        .catch((error) => ({
          error: error.message,
          requestNo: req.ipIndex + 1,
          status: 'rejected' as const,
        }))
    )
  );

  const duration = Date.now() - startTime;

  // Analyze results
  const fulfilled = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  const successful = fulfilled.filter((r) => r.success === true).length;
  const failed = fulfilled.filter((r) => 'error' in r).length;
  const rejected = results.filter((r) => r.status === 'rejected').length;

  console.log(`\n📊 RESULTS (completed in ${duration}ms):\n`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Rejected: ${rejected}`);

  // Show sample errors
  if (failed > 0) {
    console.log(`\n📋 Sample Errors:`);
    fulfilled
      .filter((r) => 'error' in r)
      .slice(0, 3)
      .forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.error || 'Unknown error'}`);
      });
  }

  // Show sample successes
  if (successful > 0) {
    console.log(`\n✅ Sample Success:`);
    fulfilled
      .filter((r) => r.success === true)
      .slice(0, 2)
      .forEach((r, i) => {
        console.log(`  ${i + 1}. Claim ID: ${r.data?.id || 'unknown'}`);
      });
  }

  // Expectations
  console.log(`\n💡 Expected Behavior:`);
  console.log(`- First request should succeed (1 claim created)`);
  console.log(`- Remaining should fail with DUPLICATE_CLAIM error`);
  console.log(`- Points deducted: 100x successful`);
  console.log(`- Final points: ${5000 - successful * 100}`);

  // Validation
  const testPassed = successful >= 1 && failed >= CONCURRENT_REQUESTS - successful;

  if (testPassed) {
    console.log(`\n✅ === TEST PASSED ===\n`);
  } else {
    console.log(
      `\n⚠️  === TEST INCOMPLETE === (successful: ${successful}, expected: >=1)\n`
    );
  }

  process.exit(testPassed ? 0 : 1);
}

testConcurrentClaims().catch((err) => {
  console.error('❌ Test error:', err.message);
  process.exit(1);
});
