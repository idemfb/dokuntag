// tests/auth.integration.test.ts
import { describe, it, expect } from "vitest";
import { isValidUUID } from "../lib/validation";

describe("Auth Validation", () => {
  it("should validate UUIDs", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });
});