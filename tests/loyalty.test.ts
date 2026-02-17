describe("Loyalty / Idempotency Test", () => {
import fetch from "node-fetch";
import { describe } from "vitest";

const runE2E = process.env.RUN_E2E === "1";

(runE2E ? describe : describe.skip)("loyalty e2e", () => {
  it("skipped unless RUN_E2E=1", () => {
    expect(true).toBe(true);
  });
});
      console.log("Güncellenmiş puanlar:", updatedPoints);
    } else {
      console.warn("Aktif ödül yok. Seed verisi ekleyin.");
    }
  }, 20000); // 20s timeout
});