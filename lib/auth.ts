/**
 * Authentication & Authorization Module
 * Provides JWT token management, user verification, and role-based access control
 */

import { jwtVerify, SignJWT } from 'jose';
import { logInfo, logWarn, logError } from './logger';
import { UnauthorizedError, ForbiddenError } from './errors';
import type { NextRequest } from 'next/server';

// Production MUST provide JWT_SECRET. Fail fast if missing.
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined');
}

const JWT_SECRET = process.env.JWT_SECRET;
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const TOKEN_EXPIRY = '24h';

export interface AuthPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

export interface AuthContext {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  isAuthenticated: boolean;
}

/**
 * Create JWT token for user
 */
export async function createToken(payload: Omit<AuthPayload, 'iat' | 'exp'>): Promise<string> {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(TOKEN_EXPIRY)
      .setIssuer('dokuntag-api')
      .sign(SECRET_KEY);
    
    logInfo('TOKEN_CREATED', { userId: payload.userId });
    return token;
  } catch (error) {
    logError('TOKEN_CREATE_ERROR', { error });
    throw error;
  }
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string): Promise<AuthPayload> {
  try {
    // Enforce algorithm pinning and issuer
    const verified = await jwtVerify(token, SECRET_KEY, {
      algorithms: ['HS256'],
      issuer: 'dokuntag-api',
    });

    const payload = verified.payload as unknown as AuthPayload;
    return payload;
  } catch (error) {
    logWarn('TOKEN_VERIFY_FAIL', { error });
    // Throw explicit unauthorized error instead of returning null
    throw new UnauthorizedError();
  }
}

/**
 * Extract token from Authorization header
 * Format: Bearer <token>
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Parse auth context from request headers
 * STRICT: JWT-only authentication. No header fallback.
 * Returns unauthenticated context if JWT missing/invalid.
 * Callers must check isAuthenticated before granting access.
 */
export async function parseAuthContext(headers: Record<string, string | string[] | undefined>): Promise<AuthContext> {
  // Attempt JWT verification only. If token present but invalid, verifyToken will throw.
  const authHeader = typeof headers.authorization === 'string' ? headers.authorization : undefined;
  const token = extractTokenFromHeader(authHeader);

  if (token) {
    const payload = await verifyToken(token); // throws UnauthorizedError on invalid token
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      isAuthenticated: true,
    };
  }

  // No token present: unauthenticated context (for public routes). Protected routes should call requireAuthFromRequest.
  return {
    userId: '',
    email: '',
    role: 'user',
    isAuthenticated: false,
  };
}

/**
 * Enforce authentication directly from a NextRequest object.
 * Throws `UnauthorizedError` if token missing/invalid, `ForbiddenError` if role insufficient.
 */
export async function requireAuthFromRequest(req: NextRequest, minRole: 'user' | 'admin' = 'user'): Promise<AuthContext> {
  const authHeader = req.headers.get('authorization') || undefined;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    throw new UnauthorizedError();
  }

  const payload = await verifyToken(token); // will throw UnauthorizedError on invalid

  if (minRole === 'admin' && payload.role !== 'admin') {
    throw new ForbiddenError('admin');
  }

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    isAuthenticated: true,
  };
}

/**
 * Require authentication - throw error if not authenticated
 * STRICT: Must have valid JWT token that passed verification
 */
export function requireAuth(context: AuthContext, minRole: 'user' | 'admin' = 'user'): void {
  // Must be authenticated via valid JWT (not header fallback)
  if (!context.isAuthenticated) {
    const { UnauthorizedError } = require('./errors');
    throw new UnauthorizedError('JWT authentication required');
  }

  // Check role requirement
  if (minRole === 'admin' && context.role !== 'admin') {
    const { ForbiddenError } = require('./errors');
    throw new ForbiddenError('admin');
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(context: AuthContext): boolean {
  return context.role === 'admin';
}

/**
 * Check if accessing own resource (unless admin)
 */
export function canAccessResource(context: AuthContext, resourceUserId: string): boolean {
  return isAdmin(context) || context.userId === resourceUserId;
}
