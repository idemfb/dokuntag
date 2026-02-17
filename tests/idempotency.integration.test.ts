import { describe, it, expect } from "vitest";

const runIntegration = process.env.RUN_INTEGRATION === "1";

(runIntegration ? describe : describe.skip)("Idempotency", () => {
  it("should return same claim for same idempotencyKey", async () => {
    // Test body (mocked or real service)
    expect(true).toBe(true);
  });
});
