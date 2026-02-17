import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 6) {
    throw new Error('Şifre en az 6 karakter olmalı');
  }
  return bcryptjs.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log(`🌱 Seed başlatiyor...`);

  // Cleanup
  await prisma.rewardClaim.deleteMany();
  await prisma.loyaltyPoint.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // ============ USERS (3 test users + 1 admin) ============
  // Hash passwords for test users
  const password = await hashPassword('password123');

  const user1 = await prisma.user.create({
    data: {
      id: 'user-1',
      email: 'alice@example.com',
      name: 'Alice Johnson',
      passwordHash: password,
      role: 'user',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: 'user-2',
      email: 'bob@example.com',
      name: 'Bob Smith',
      passwordHash: password,
      role: 'user',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      id: 'user-3',
      email: 'charlie@example.com',
      name: 'Charlie Brown',
      passwordHash: password,
      role: 'user',
    },
  });

  // Admin user
  const admin = await prisma.user.create({
    data: {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: password,
      role: 'admin',
    },
  });

  console.log(`✅ 4 user oluşturuldu (3 user + 1 admin)`);
  console.log(`  Test credentials: email/password123`)

  // ============ LOYALTY POINTS ============
  await prisma.loyaltyPoint.create({
    data: { userId: user1.id, points: 1000 },
  });

  await prisma.loyaltyPoint.create({
    data: { userId: user2.id, points: 500 },
  });

  await prisma.loyaltyPoint.create({
    data: { userId: user3.id, points: 250 },
  });

  await prisma.loyaltyPoint.create({
    data: { userId: admin.id, points: 0 },
  });

  console.log(`✅ Loyalty points eklendi`);

  // ============ REWARDS (4 farklı ödül) ============
  const reward1 = await prisma.reward.create({
    data: {
      id: 'reward-coffee-small',
      title: 'Küçük Kahve',
      costPoints: 50,
      active: true,
    },
  });

  const reward2 = await prisma.reward.create({
    data: {
      id: 'reward-coffee-large',
      title: 'Büyük Kahve',
      costPoints: 100,
      active: true,
    },
  });

  const reward3 = await prisma.reward.create({
    data: {
      id: 'reward-discount-10',
      title: '%10 İndirim Kuponu',
      costPoints: 150,
      active: true,
    },
  });

  const reward4 = await prisma.reward.create({
    data: {
      id: 'reward-free-item',
      title: 'Ücretsiz Ürün',
      costPoints: 300,
      active: true,
    },
  });

  console.log(`✅ 4 reward oluşturuldu`);

  // ============ SAMPLE CLAIMS ============
  await prisma.rewardClaim.create({
    data: {
      userId: user1.id,
      rewardId: reward1.id,
      idempotencyKey: uuidv4(),
      status: 'claimed',
    },
  });

  await prisma.rewardClaim.create({
    data: {
      userId: user2.id,
      rewardId: reward2.id,
      idempotencyKey: uuidv4(),
      status: 'claimed',
    },
  });

  console.log(`✅ Sample reward claims eklendi`);

  // ============ AUDIT LOG ============
  await prisma.auditLog.create({
    data: {
      action: 'SEED_DATA',
      userId: 'system',
      resourceType: 'database',
      resourceId: 'seed-init',
      status: 'SUCCESS',
      metadata: JSON.stringify({
        usersCreated: 4,
        adminUsers: 1,
        rewardsCreated: 4,
        timestamp: new Date().toISOString(),
      }),
    },
  });

  console.log(`✅ Audit log kaydedildi`);

  console.log(`\n🎉 Seed tamamlandi!`);
  console.log(`   - 4 User (3 normal + 1 admin)`);
  console.log(`   - 4 Loyalty Points`);
  console.log(`   - 4 Reward`);
  console.log(`   - 2 Sample Claims`);
  console.log(``);
  console.log(`Test User Credentials (role=user):`);
  console.log(`   alice@example.com / password123`);
  console.log(`   bob@example.com / password123`);
  console.log(`   charlie@example.com / password123`);
  console.log(``);
  console.log(`Admin Credentials (role=admin):`);
  console.log(`   admin@example.com / password123\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed hatasi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
