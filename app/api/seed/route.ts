import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { withErrorHandler } from "@/lib/errorHandler";

export const POST = withErrorHandler(async (req: NextRequest) => {
  // Hash test password
  const testPassword = await hashPassword("password123");

  // Test user
  await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      id: "user123",
      email: "test@example.com",
      name: "Test User",
      passwordHash: testPassword,
      role: "user",
    },
  });

  // Test reward
  await prisma.reward.upsert({
    where: { id: "reward456" },
    update: {},
    create: {
      id: "reward456",
      title: "Test Reward",
      costPoints: 50,
      active: true,
    },
  });

  // Test loyalty point
  await prisma.loyaltyPoint.upsert({
    where: { userId: "user123" },
    update: {},
    create: {
      userId: "user123",
      points: 100,
    },
  });

  return NextResponse.json({ success: true, message: "Seed başarılı" });
});
