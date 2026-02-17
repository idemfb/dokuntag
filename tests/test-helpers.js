/**
 * Test helpers for JWT token generation
 * Used in tests that were previously using x-user-id header fallback
 */
import { SignJWT } from 'jose';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
/**
 * Generate a JWT token for a test user
 * Mimics the production token creation in lib/auth.ts
 */
export async function generateTestToken(user) {
    const token = await new SignJWT({
        userId: user.userId,
        email: user.email,
        role: user.role,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(SECRET_KEY);
    return token;
}
/**
 * Standard test users that match the seed
 */
export const TEST_USERS = {
    ALICE: {
        userId: 'user-1',
        email: 'alice@example.com',
        role: 'user',
    },
    BOB: {
        userId: 'user-2',
        email: 'bob@example.com',
        role: 'user',
    },
    CHARLIE: {
        userId: 'user-3',
        email: 'charlie@example.com',
        role: 'user',
    },
    ADMIN: {
        userId: 'admin-1',
        email: 'admin@example.com',
        role: 'admin',
    },
    CONCURRENT_TEST: {
        userId: 'concurrent_test_user',
        email: 'concurrent_test@example.com',
        role: 'user',
    },
};
