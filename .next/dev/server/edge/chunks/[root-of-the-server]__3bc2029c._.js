(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__3bc2029c._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/lib/logger.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Edge ve Node 18+ uyumlu SHA-256 hex hash fonksiyonu
 * Web Crypto API kullanır, sync fallback yoktur.
 */ __turbopack_context__.s([
    "hashIdempotencyKey",
    ()=>hashIdempotencyKey,
    "log",
    ()=>log,
    "logError",
    ()=>logError,
    "logInfo",
    ()=>logInfo,
    "logWarn",
    ()=>logWarn
]);
async function hashIdempotencyKey(key) {
    if (!key) return '';
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    // globalThis.crypto hem Node 18+ hem Edge'de mevcut
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
    // Buffer'dan hex string'e çevir
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map((b)=>b.toString(16).padStart(2, '0')).join('');
    return hex.slice(0, 12);
}
async function redact(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const out = Array.isArray(obj) ? [] : {};
    for(const k in obj){
        if (k.toLowerCase().includes('jwt')) {
            out[k] = '[REDACTED]';
        } else if (k === 'idempotencyKey') {
            out[k] = await hashIdempotencyKey(obj[k]);
        } else if (typeof obj[k] === 'object') {
            out[k] = await redact(obj[k]);
        } else {
            out[k] = obj[k];
        }
    }
    return out;
}
async function log(level, event, payload, context) {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        event,
        ...context,
        payload: await redact(payload)
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
}
function logInfo(event, payload, context) {
    log('info', event, payload, context);
}
function logWarn(event, payload, context) {
    log('warn', event, payload, context);
}
function logError(event, payload, context) {
    log('error', event, payload, context);
}
}),
"[project]/lib/rate-limit.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Rate limiting utility for protecting endpoints
 * Supports Redis-based limiter when REDIS_URL present, otherwise falls back to in-memory store
 */ __turbopack_context__.s([
    "checkRateLimit",
    ()=>checkRateLimit,
    "getClientIP",
    ()=>getClientIP,
    "getRateLimitKey",
    ()=>getRateLimitKey,
    "getResetTime",
    ()=>getResetTime
]);
class InMemoryStore {
    store = new Map();
    check(key, maxRequests, windowMs) {
        const now = Date.now();
        const entry = this.store.get(key);
        if (!entry || now > entry.resetTime) {
            this.store.set(key, {
                count: 1,
                resetTime: now + windowMs
            });
            return true;
        }
        if (entry.count < maxRequests) {
            entry.count++;
            return true;
        }
        return false;
    }
    getResetTime(key) {
        const entry = this.store.get(key);
        if (!entry) return 0;
        const resetIn = Math.ceil((entry.resetTime - Date.now()) / 1000);
        return Math.max(0, resetIn);
    }
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()){
            if (now > entry.resetTime) this.store.delete(key);
        }
    }
}
const memoryStore = new InMemoryStore();
/**
 * Attempt to use Redis if available and safe (not edge runtime).
 */ async function tryUseRedis() {
    if (!process.env.REDIS_URL) return null;
    // Avoid importing redis/ioredis in Edge runtime where it breaks
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
async function checkRateLimit(key, maxRequests, windowMs) {
    const redisUrl = process.env.REDIS_URL;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return memoryStore.check(key, maxRequests, windowMs);
}
async function getResetTime(key) {
    const redisUrl = process.env.REDIS_URL;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return memoryStore.getResetTime(key);
}
// Cleanup memory store periodically
setInterval(()=>memoryStore.cleanup(), 60000);
function getRateLimitKey(ip, endpoint) {
    return `${ip}:${endpoint}`;
}
function getClientIP(headers) {
    const forwarded = headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    const cfip = headers['cf-connecting-ip'];
    if (typeof cfip === 'string') {
        return cfip;
    }
    const realip = headers['x-real-ip'];
    if (typeof realip === 'string') {
        return realip;
    }
    return '127.0.0.1';
}
}),
"[project]/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logger$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/logger.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rate$2d$limit$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rate-limit.ts [middleware-edge] (ecmascript)");
;
;
;
async function middleware(request) {
    const pathname = request.nextUrl.pathname;
    const method = request.method;
    // Get client IP for rate limiting
    const clientIP = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rate$2d$limit$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["getClientIP"])({
        'x-forwarded-for': request.headers.get('x-forwarded-for') || undefined,
        'cf-connecting-ip': request.headers.get('cf-connecting-ip') || undefined,
        'x-real-ip': request.headers.get('x-real-ip') || undefined
    });
    // Log request
    logRequest(pathname, method, clientIP);
    // Apply endpoint-specific rate limits
    if (pathname.startsWith('/api/loyalty/claimReward')) {
        const maxRequests = parseInt(process.env.CLAIM_RATE_LIMIT_MAX || '10', 10);
        const windowMs = parseInt(process.env.CLAIM_RATE_LIMIT_WINDOW || '60000', 10);
        const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rate$2d$limit$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["getRateLimitKey"])(clientIP, 'claim');
        const allowed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rate$2d$limit$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkRateLimit"])(key, maxRequests, windowMs);
        if (!allowed) {
            const remaining = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rate$2d$limit$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["getResetTime"])(key);
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"](JSON.stringify({
                success: false,
                error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
                retryAfter: remaining
            }), {
                status: 429,
                headers: {
                    'Retry-After': remaining.toString(),
                    'Content-Type': 'application/json'
                }
            });
        }
    }
    if (pathname.startsWith('/api/scan')) {
        const maxRequests = parseInt(process.env.SCAN_RATE_LIMIT_MAX || '20', 10);
        const windowMs = parseInt(process.env.SCAN_RATE_LIMIT_WINDOW || '60000', 10);
        const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rate$2d$limit$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["getRateLimitKey"])(clientIP, 'scan');
        const allowed = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rate$2d$limit$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkRateLimit"])(key, maxRequests, windowMs);
        if (!allowed) {
            const remaining = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rate$2d$limit$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["getResetTime"])(key);
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"](JSON.stringify({
                success: false,
                error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
                retryAfter: remaining
            }), {
                status: 429,
                headers: {
                    'Retry-After': remaining.toString(),
                    'Content-Type': 'application/json'
                }
            });
        }
    }
    // Let request proceed
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
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
        "connect-src 'self' ws:"
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
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"](null, {
            status: 204,
            headers: response.headers
        });
    }
    return response;
}
const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)'
    ]
};
/**
 * Simple request logging
 */ function logRequest(pathname, method, ip) {
    if ("TURBOPACK compile-time truthy", 1) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logger$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["logInfo"])('INCOMING_REQUEST', {
            path: pathname,
            method,
            ip
        });
    }
}
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__3bc2029c._.js.map