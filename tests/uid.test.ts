// tests/uid.test.ts
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../lib/hash";

describe("Password Hashing", () => {
  it("should hash and verify correctly", async () => {
    const password = "securePassword123";
    const hashed = await hashPassword(password);
    expect(await verifyPassword(password, hashed)).toBe(true);
  });
});