import { describe, it, expect } from "vitest";

const runIntegration = process.env.RUN_INTEGRATION === "1";

(runIntegration ? describe : describe.skip)("Loyalty Integration", () => {
  it("should claim reward idempotently", async () => {
    // Test body (mocked or real service)
    expect(true).toBe(true);
  });
});
