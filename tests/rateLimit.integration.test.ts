import { describe, it, expect } from "vitest";

const hasRedis = !!process.env.REDIS_URL;

(hasRedis ? describe : describe.skip)("rate limit integration", () => {
  it("skipped unless REDIS_URL provided", () => {
    expect(true).toBe(true);
  });
});
