import { NextResponse, type NextRequest } from 'next/server';
import { logInfo } from './lib/logger';
import { getRateLimitKey, getClientIP, checkRateLimit, getResetTime } from './lib/rate-limit';

/**
 * Middleware for Next.js App Router
 * Handles:
 * - Rate limiting for sensitive endpoints
 * - Request logging
 * - Security headers
 * 
 * For endpoint-specific rate limits, see individual route handlers
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Get client IP for rate limiting
  const clientIP = getClientIP({
    'x-forwarded-for': request.headers.get('x-forwarded-for') || undefined,
    'cf-connecting-ip':
      request.headers.get('cf-connecting-ip') || undefined,
    'x-real-ip': request.headers.get('x-real-ip') || undefined,
  });

  // Log request
  logRequest(pathname, method, clientIP);

  // Apply endpoint-specific rate limits
  if (pathname.startsWith('/api/loyalty/claimReward')) {
    const maxRequests = parseInt(
      process.env.CLAIM_RATE_LIMIT_MAX || '10',
      10
    );
    const windowMs = parseInt(
      process.env.CLAIM_RATE_LIMIT_WINDOW || '60000',
      10
    );

    const key = getRateLimitKey(clientIP, 'claim');
    const allowed = await checkRateLimit(key, maxRequests, windowMs);

    if (!allowed) {
      const remaining = await getResetTime(key);
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
          retryAfter: remaining,
        }),
        {
          status: 429,
          headers: {
            'Retry-After': remaining.toString(),
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  if (pathname.startsWith('/api/scan')) {
    const maxRequests = parseInt(
      process.env.SCAN_RATE_LIMIT_MAX || '20',
      10
    );
    const windowMs = parseInt(
      process.env.SCAN_RATE_LIMIT_WINDOW || '60000',
      10
    );

    const key = getRateLimitKey(clientIP, 'scan');
    const allowed = await checkRateLimit(key, maxRequests, windowMs);

    if (!allowed) {
      const remaining = await getResetTime(key);
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
          retryAfter: remaining,
        }),
        {
          status: 429,
          headers: {
            'Retry-After': remaining.toString(),
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  // Let request proceed
  const response = NextResponse.next();

  // Add security headers (Helmet-like)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Content Security Policy - conservative default, allow self and required origins
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "connect-src 'self' ws:",
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);

  // CORS headers (adjust CORS_ORIGIN in .env)
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  response.headers.set('Access-Control-Allow-Origin', corsOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests quickly
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  return response;
}

/**
 * Configure which routes should use middleware
 * Exclude static files, images, etc.
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

/**
 * Simple request logging
 */
function logRequest(pathname: string, method: string, ip: string) {
  if (process.env.NODE_ENV !== 'test') {
    logInfo('INCOMING_REQUEST', { path: pathname, method, ip });
  }
}
