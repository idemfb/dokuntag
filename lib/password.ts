/**
 * Password hashing and verification using bcryptjs
 * Secure password storage with bcrypt algorithm
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 6) {
    throw new Error('Şifre en az 6 karakter olmalı');
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare plain text password with hash
 */
export async function comparePassword(
  plainPassword: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hash);
}

/**
 * Check if a hash is a placeholder (existing users migrated without real passwords)
 */
export function isPlaceholderHash(hash: string): boolean {
  return hash.includes('placeholder');
}
