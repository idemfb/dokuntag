describe("Loyalty / Idempotency Test", () => {
import fetch from "node-fetch";
import { v4 as uuid } from "uuid";
import { generateTestToken, TEST_USERS } from "./test-helpers";
import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.E2E_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
const TEST_USER = TEST_USERS.ALICE;

const shouldRunE2E = process.env.RUN_E2E === '1' || !!process.env.E2E_BASE_URL;

// E2E testler sadece RUN_E2E=1 veya E2E_BASE_URL set ise çalışır
const maybeDescribe = shouldRunE2E ? describe : describe.skip;

maybeDescribe("Loyalty / Idempotency Test", () => {
  it("Loyalty akışı test edilmeli", async () => {
    const token = await generateTestToken(TEST_USER);
    const authHeader = { Authorization: `Bearer ${token}` };

    // 1️⃣ Başlangıç puanları
    let res = await fetch(`${BASE_URL}/api/loyalty/points?userId=${TEST_USER.userId}`, { headers: authHeader });
    const initialPoints = await res.json();
    console.log("Başlangıç puanları:", initialPoints);

    // 2️⃣ Puan ekle
    res = await fetch(`${BASE_URL}/api/loyalty/addPoints`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ userId: TEST_USER.userId, points: 500 }),
    });
    const addedPoints = await res.json();
    console.log("Eklenen puanlar:", addedPoints);

    // 3️⃣ Aktif ödüller
    res = await fetch(`${BASE_URL}/api/loyalty/rewards`, { headers: authHeader });
    const rewards = await res.json();
    console.log("Ödüller:", rewards);

    if (rewards.length > 0) {
      const selectedReward = rewards[0];

      // 4️⃣ Claim et
      const idempotencyKey = uuid();
      res = await fetch(`${BASE_URL}/api/loyalty/claimReward`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          userId: TEST_USER.userId,
          rewardId: selectedReward.id,
          idempotencyKey,
        }),
      });
      const claimResult = await res.json();
      console.log("Claim sonucu:", claimResult);

      // 5️⃣ Aynı claim tekrar (idempotency)
      res = await fetch(`${BASE_URL}/api/loyalty/claimReward`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          userId: TEST_USER.userId,
          rewardId: selectedReward.id,
          idempotencyKey,
        }),
      });
      const idempotentResult = await res.json();
      console.log("İdempotent sonuç:", idempotentResult);

      // 6️⃣ Güncellenmiş puanlar
      res = await fetch(`${BASE_URL}/api/loyalty/points?userId=${TEST_USER.userId}`, { headers: authHeader });
      const updatedPoints = await res.json();
      console.log("Güncellenmiş puanlar:", updatedPoints);
    } else {
      console.warn("Aktif ödül yok. Seed verisi ekleyin.");
    }
  }, 20000); // 20s timeout
});