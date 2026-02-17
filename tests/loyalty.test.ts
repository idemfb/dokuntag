import { describe, it, expect } from "vitest";

const runE2E = process.env.RUN_E2E === "1";

(runE2E ? describe : describe.skip)("loyalty e2e", () => {
  it("skipped unless RUN_E2E=1", () => {
    expect(true).toBe(true);
  });
});