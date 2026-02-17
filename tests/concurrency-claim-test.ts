import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";
import { randomUUID } from "crypto";
import { describe, it, expect } from "vitest";

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
console.log("BASE_URL:", BASE_URL);
const CONCURRENT_REQUESTS = 100;
const USER_ID = "test-user-id";
const REWARD_ID = "test-reward-id";

describe("Concurrency Claim Test", () => {
  it(
    "should handle concurrent claims",
  console.log(`🚀 Starting ${CONCURRENT_REQUESTS} concurrent requests`);

  const promises = Array.from({ length: CONCURRENT_REQUESTS }).map(
        async () => {
          try {
            const res = await fetch(`${BASE_URL}/api/rewards/claim`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              body: JSON.stringify({
                userId: USER_ID,
                rewardId: REWARD_ID,
                idempotencyKey: randomUUID(),
              }),
            });
            return res.status;
          } catch (err) {
            return 500;
          }
        }
      );
  const results = await Promise.all(promises);

  const success = results.filter((r) => r === 200).length;
  const failed = results.length - success;

  console.log("---- RESULT ----");
  console.log("✅ Success:", success);
  console.log("❌ Failed:", failed);

  expect(success).toBeGreaterThan(0);
    },
    20000 // 20s timeout for network concurrency
  );
});
import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";
import { randomUUID } from "crypto";
import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
console.log("BASE_URL:", BASE_URL);
const CONCURRENT_REQUESTS = 100;
const USER_ID = "test-user-id";
const REWARD_ID = "test-reward-id";

describe("Concurrency Claim Test", () => {
  it("should handle concurrent claims", async () => {
    console.log(`🚀 Starting ${CONCURRENT_REQUESTS} concurrent requests`);
    const promises = Array.from({ length: CONCURRENT_REQUESTS }).map(
      async (_, i) => {
        try {
          const res = await fetch(`${BASE_URL}/api/rewards/claim`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: USER_ID,
              rewardId: REWARD_ID,
              idempotencyKey: randomUUID(),
            }),
          });
          return res.status;
        } catch (err) {
          return 500;
        }
      }
    );
    const results = await Promise.all(promises);
    const success = results.filter((r) => r === 200).length;
    const failed = results.length - success;
    console.log("---- RESULT ----");
    console.log("✅ Success:", success);
    console.log("❌ Failed:", failed);
    expect(success).toBeGreaterThan(0);
  }, 20000);
});
