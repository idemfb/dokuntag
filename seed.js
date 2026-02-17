// seed.js - Seed script for test data
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["query", "error"],
});

async function main() {
  console.log("🌱 Seed başlıyor...");

  // Kullanıcıları temizle ve yeniden oluştur
  await prisma.user.deleteMany();
  console.log("✅ Eski kullanıcılar silindi");

  // Ödülleri temizle
  await prisma.reward.deleteMany();
  console.log("✅ Eski ödüller silindi");

  // Test kullanıcıları oluştur
  const user1 = await prisma.user.create({
    data: {
      id: "user123",
      email: "user1@example.com",
      name: "Test User 1",
      loyaltyPoint: { create: { points: 500 } },
    },
  });
  console.log("✅ Kullanıcı oluşturuldu:", user1.id);

  const user2 = await prisma.user.create({
    data: {
      id: "user456",
      email: "user2@example.com",
      name: "Test User 2",
      loyaltyPoint: { create: { points: 1000 } },
    },
  });
  console.log("✅ Kullanıcı oluşturuldu:", user2.id);

  // Test ödülleri oluştur
  const reward1 = await prisma.reward.create({
    data: {
      id: "reward_100",
      title: "100 Puan Ödülü",
      costPoints: 100, // <--- costPoints kullanıyoruz (points değil)
      active: true,
    },
  });
  console.log("✅ Ödül oluşturuldu:", reward1.id);

  const reward2 = await prisma.reward.create({
    data: {
      id: "reward_500",
      title: "500 Puan Ödülü",
      costPoints: 500,
      active: true,
    },
  });
  console.log("✅ Ödül oluşturuldu:", reward2.id);

  const reward3 = await prisma.reward.create({
    data: {
      id: "reward_inactive",
      title: "İnaktif Ödül",
      costPoints: 50,
      active: false,
    },
  });
  console.log("✅ İnaktif ödül oluşturuldu:", reward3.id);

  console.log("\n📊 Seed Özeti:");
  console.log("Kullanıcılar:", [user1.id, user2.id]);
  console.log("Ödüller:", [reward1.id, reward2.id, reward3.id]);
  console.log("\n🌱 Seed tamamlandı!");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
