import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export interface TestUser {
  userId: string
  username: string
  email: string
}

// Örnek test kullanıcılar
export const TEST_USERS: Record<string, TestUser> = {
  ALICE: { userId: "user-alice", username: "Alice", email: "alice@example.com" },
  BOB: { userId: "user-bob", username: "Bob", email: "bob@example.com" }
}

/**
 * JWT token üretir (test ortamı için)
 */
export function generateTestToken(user: TestUser) {
  const secret = process.env.JWT_SECRET || "dev-secret-key-change-in-production-minimum-32-characters!"
  return jwt.sign({ userId: user.userId, username: user.username }, secret, { expiresIn: process.env.TOKEN_EXPIRY || "1h" })
}