import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateEnv } from "../lib/env";

describe("Env Validation", () => {
  let errSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errSpy?.mockRestore();
  });

  it("should throw if JWT_SECRET is too short", () => {
    process.env.JWT_SECRET = "short";
    process.env.DATABASE_URL = "postgres://user:pass@localhost:5432/db";
    process.env.REDIS_URL = "redis://localhost:6379";
    expect(() => validateEnv()).toThrow();
  });
});