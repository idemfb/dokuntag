module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const prisma = global.prisma || new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: [
        'query'
    ]
});
if ("TURBOPACK compile-time truthy", 1) {
    global.prisma = prisma;
}
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/app/features/loyalty/logger.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "logError",
    ()=>logError,
    "logInfo",
    ()=>logInfo,
    "logWarn",
    ()=>logWarn
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
function hash(value) {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash('sha256').update(value).digest('hex').substring(0, 12);
}
function baseLog(level, event, payload) {
    const safePayload = {
        ...payload
    };
    if (safePayload.idempotencyKey) {
        safePayload.idempotencyKey = hash(safePayload.idempotencyKey);
    }
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        event,
        payload: safePayload
    }));
}
function logInfo(event, payload) {
    baseLog('INFO', event, payload);
}
function logWarn(event, payload) {
    baseLog('WARN', event, payload);
}
function logError(event, payload) {
    baseLog('ERROR', event, payload);
}
}),
"[project]/app/features/loyalty/metrics.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getMetrics",
    ()=>getMetrics,
    "increment",
    ()=>increment
]);
const counters = {
    claim_attempt_total: 0,
    claim_success_total: 0,
    claim_duplicate_total: 0,
    claim_replay_total: 0,
    claim_conflict_total: 0,
    claim_retry_total: 0,
    claim_fatal_total: 0
};
function increment(metricName) {
    if (!counters[metricName]) {
        counters[metricName] = 0;
    }
    counters[metricName]++;
}
function getMetrics() {
    return {
        ...counters
    };
}
}),
"[project]/app/features/loyalty/loyaltyService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// --- Ek Fonksiyonlar: addPoints, getUserPoints, listActiveRewards ---
__turbopack_context__.s([
    "addPoints",
    ()=>addPoints,
    "claimReward",
    ()=>claimReward,
    "getUserPoints",
    ()=>getUserPoints,
    "listActiveRewards",
    ()=>listActiveRewards,
    "withRetry",
    ()=>withRetry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/features/loyalty/logger.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$metrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/features/loyalty/metrics.ts [app-route] (ecmascript)");
async function addPoints(userId, points) {
    if (points <= 0) {
        throw new Error('Puan 0dan büyük olmalı');
    }
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
        where: {
            id: userId
        }
    });
    if (!user) {
        throw new Error('Kullanıcı bulunamadı');
    }
    const updated = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].loyaltyPoint.upsert({
        where: {
            userId
        },
        update: {
            points: {
                increment: points
            }
        },
        create: {
            userId,
            points
        }
    });
    return {
        userId,
        points: updated.points
    };
}
async function getUserPoints(userId) {
    const points = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].loyaltyPoint.findUnique({
        where: {
            userId
        }
    });
    return points ?? {
        userId,
        points: 0
    };
}
async function listActiveRewards() {
    return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].reward.findMany({
        where: {
            active: true
        }
    });
}
;
;
;
;
async function claimReward(userId, rewardId, idempotencyKey) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$metrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["increment"])('claim_attempt_total');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logInfo"])('CLAIM_ATTEMPT', {
        userId,
        rewardId
    });
    // -------- PRE-CHECK (FAST REPLAY) --------
    const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].idempotencyRecord.findUnique({
        where: {
            userId_idempotencyKey: {
                userId,
                idempotencyKey
            }
        }
    });
    if (existing) {
        if (existing.rewardId !== rewardId) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$metrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["increment"])('claim_conflict_total');
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logWarn"])('CLAIM_CONFLICT', {
                userId,
                rewardId
            });
            return {
                response: {
                    success: false,
                    error: 'Idempotency-Key başka bir işlem için kullanılmış',
                    code: 'IDEMPOTENCY_CONFLICT'
                },
                statusCode: 409
            };
        }
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$metrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["increment"])('claim_replay_total');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logInfo"])('CLAIM_IDEMPOTENT_REPLAY', {
            userId,
            rewardId
        });
        return {
            response: JSON.parse(existing.responseJson),
            statusCode: existing.statusCode
        };
    }
    // -------- MAIN EXECUTION --------
    return withRetry(async ()=>{
        try {
            return await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
                const idemp = await tx.idempotencyRecord.findUnique({
                    where: {
                        userId_idempotencyKey: {
                            userId,
                            idempotencyKey
                        }
                    }
                });
                if (idemp) {
                    if (idemp.rewardId !== rewardId) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$metrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["increment"])('claim_conflict_total');
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logWarn"])('CLAIM_CONFLICT', {
                            userId,
                            rewardId
                        });
                        return {
                            response: {
                                success: false,
                                error: 'Idempotency-Key başka bir işlem için kullanılmış',
                                code: 'IDEMPOTENCY_CONFLICT'
                            },
                            statusCode: 409
                        };
                    }
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$metrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["increment"])('claim_replay_total');
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logInfo"])('CLAIM_IDEMPOTENT_REPLAY', {
                        userId,
                        rewardId
                    });
                    return {
                        response: JSON.parse(idemp.responseJson),
                        statusCode: idemp.statusCode
                    };
                }
                let claim;
                let response;
                let statusCode = 201;
                try {
                    claim = await tx.rewardClaim.create({
                        data: {
                            userId,
                            rewardId,
                            idempotencyKey
                        }
                    });
                } catch (e) {
                    if (e instanceof __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["Prisma"].PrismaClientKnownRequestError && e.code === 'P2002') {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$metrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["increment"])('claim_duplicate_total');
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logWarn"])('CLAIM_DUPLICATE', {
                            userId,
                            rewardId
                        });
                        const replay = await tx.idempotencyRecord.findUnique({
                            where: {
                                userId_idempotencyKey: {
                                    userId,
                                    idempotencyKey
                                }
                            }
                        });
                        if (replay) {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$metrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["increment"])('claim_replay_total');
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logInfo"])('CLAIM_IDEMPOTENT_REPLAY', {
                                userId,
                                rewardId
                            });
                            return {
                                response: JSON.parse(replay.responseJson),
                                statusCode: replay.statusCode
                            };
                        }
                    }
                    throw e;
                }
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$metrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["increment"])('claim_success_total');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logInfo"])('CLAIM_SUCCESS', {
                    userId,
                    rewardId
                });
                response = {
                    success: true,
                    data: claim
                };
                await tx.idempotencyRecord.create({
                    data: {
                        userId,
                        rewardId,
                        idempotencyKey,
                        responseJson: JSON.stringify(response),
                        statusCode
                    }
                });
                return {
                    response,
                    statusCode
                };
            });
        } catch (err) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$metrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["increment"])('claim_fatal_total');
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logError"])('CLAIM_FATAL', {
                userId,
                rewardId,
                message: err.message
            });
            return {
                response: {
                    success: false,
                    error: err.message || 'Bilinmeyen hata',
                    code: err.code || 'ERROR'
                },
                statusCode: 500
            };
        }
    });
}
async function withRetry(fn, maxRetries = 3) {
    let attempt = 0;
    let delay = 100;
    while(true){
        try {
            return await fn();
        } catch (err) {
            const msg = String(err?.message || '').toLowerCase();
            const code = err?.code;
            if (attempt < maxRetries && (code === 'SQLITE_BUSY' || msg.includes('database is locked') || msg.includes('deadlock') || msg.includes('serialization failure'))) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$metrics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["increment"])('claim_retry_total');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logWarn"])('CLAIM_RETRY', {
                    attemptNumber: attempt + 1,
                    reason: code || msg
                });
                await new Promise((r)=>setTimeout(r, delay));
                attempt++;
                delay *= 2;
                continue;
            }
            throw err;
        }
    }
}
}),
"[project]/lib/errors.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Enterprise-grade error handling system
 * Yapılandırılmış hata yönetimi, telemetry ve recovery
 */ __turbopack_context__.s([
    "ConcurrencyConflictError",
    ()=>ConcurrencyConflictError,
    "DatabaseError",
    ()=>DatabaseError,
    "DuplicateClaimError",
    ()=>DuplicateClaimError,
    "ForbiddenError",
    ()=>ForbiddenError,
    "InsufficientPointsError",
    ()=>InsufficientPointsError,
    "InvalidIdempotencyKeyError",
    ()=>InvalidIdempotencyKeyError,
    "LoyaltyError",
    ()=>LoyaltyError,
    "RateLimitError",
    ()=>RateLimitError,
    "RewardInactiveError",
    ()=>RewardInactiveError,
    "RewardNotFoundError",
    ()=>RewardNotFoundError,
    "SystemError",
    ()=>SystemError,
    "TransactionError",
    ()=>TransactionError,
    "UnauthorizedError",
    ()=>UnauthorizedError,
    "UserNotFoundError",
    ()=>UserNotFoundError,
    "ValidationError",
    ()=>ValidationError,
    "formatErrorResponse",
    ()=>formatErrorResponse,
    "getErrorStatus",
    ()=>getErrorStatus,
    "isLoyaltyError",
    ()=>isLoyaltyError
]);
class LoyaltyError extends Error {
    code;
    statusCode;
    context;
    timestamp;
    isDeveloperFacing;
    constructor(code, statusCode, message, context = {}, isDeveloperFacing = false){
        super(message);
        this.name = 'LoyaltyError';
        this.code = code;
        this.statusCode = statusCode;
        this.context = context;
        this.timestamp = new Date();
        this.isDeveloperFacing = isDeveloperFacing;
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            code: this.code,
            message: this.message,
            statusCode: this.statusCode,
            timestamp: this.timestamp,
            ...this.isDeveloperFacing && {
                context: this.context
            }
        };
    }
}
class InsufficientPointsError extends LoyaltyError {
    constructor(context){
        super('INSUFFICIENT_POINTS', 400, 'Yeterli puan bulunmamaktadır', context);
        this.name = 'InsufficientPointsError';
    }
}
class RewardNotFoundError extends LoyaltyError {
    constructor(rewardId, context){
        super('REWARD_NOT_FOUND', 404, `Ödül bulunamadı: ${rewardId}`, {
            ...context,
            rewardId
        }, true);
        this.name = 'RewardNotFoundError';
    }
}
class UserNotFoundError extends LoyaltyError {
    constructor(userId, context){
        super('USER_NOT_FOUND', 404, `Kullanıcı bulunamadı: ${userId}`, {
            ...context,
            userId
        }, true);
        this.name = 'UserNotFoundError';
    }
}
class RewardInactiveError extends LoyaltyError {
    constructor(rewardId, context){
        super('REWARD_INACTIVE', 400, 'Bu ödül artık aktif değildir', {
            ...context,
            rewardId
        });
        this.name = 'RewardInactiveError';
    }
}
class DuplicateClaimError extends LoyaltyError {
    constructor(claimId, context){
        super('DUPLICATE_CLAIM', 409, 'Bu ödül zaten talep edilmiştir', {
            ...context,
            claimId
        });
        this.name = 'DuplicateClaimError';
    }
}
class InvalidIdempotencyKeyError extends LoyaltyError {
    constructor(context){
        super('INVALID_IDEMPOTENCY_KEY', 400, 'İdempotency key gerekli ve UUID formatında olmalıdır', context);
        this.name = 'InvalidIdempotencyKeyError';
    }
}
class DatabaseError extends LoyaltyError {
    constructor(originalError, context){
        super('DATABASE_ERROR', 500, 'Veritabanı hatasından dolayı işlem tamamlanamamıştır', {
            ...context,
            metadata: {
                originalError: originalError.message
            }
        }, true);
        this.name = 'DatabaseError';
    }
}
class TransactionError extends LoyaltyError {
    constructor(originalError, context){
        super('TRANSACTION_ERROR', 500, 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyiniz', {
            ...context,
            metadata: {
                originalError: originalError.message
            }
        }, true);
        this.name = 'TransactionError';
    }
}
class ValidationError extends LoyaltyError {
    constructor(field, message, context){
        super('VALIDATION_ERROR', 400, `${field}: ${message}`, {
            ...context,
            field
        });
        this.name = 'ValidationError';
    }
}
class RateLimitError extends LoyaltyError {
    constructor(retryAfter, context){
        super('RATE_LIMIT_EXCEEDED', 429, `Çok fazla istek gönderdiniz. ${retryAfter} saniye sonra tekrar deneyin`, {
            ...context,
            metadata: {
                retryAfter
            }
        });
        this.name = 'RateLimitError';
    }
}
class UnauthorizedError extends LoyaltyError {
    constructor(context){
        super('UNAUTHORIZED', 401, 'Yetkilendirme başarısız oldu', context);
        this.name = 'UnauthorizedError';
    }
}
class ForbiddenError extends LoyaltyError {
    constructor(resource, context){
        super('FORBIDDEN', 403, `Bu kaynağa erişim izni yoktur: ${resource}`, {
            ...context,
            metadata: {
                resource
            }
        });
        this.name = 'ForbiddenError';
    }
}
class ConcurrencyConflictError extends Error {
    constructor(message = "Başka bir işlem aynı anda gerçekleşti"){
        super(message);
        this.name = "ConcurrencyConflictError";
    }
}
class SystemError extends Error {
    constructor(message = "Sistem hatası oluştu"){
        super(message);
        this.name = "SystemError";
    }
}
function isLoyaltyError(error) {
    return error instanceof LoyaltyError;
}
function getErrorStatus(error) {
    if (isLoyaltyError(error)) {
        return error.statusCode;
    }
    return 500;
}
function formatErrorResponse(error) {
    if (isLoyaltyError(error)) {
        return {
            code: error.code,
            message: error.message,
            status: error.statusCode
        };
    }
    return {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Bir sistem hatası oluştu',
        status: 500
    };
}
}),
"[project]/lib/logger.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/lib/errorHandler.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "withErrorHandler",
    ()=>withErrorHandler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/errors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/logger.ts [app-route] (ecmascript)");
;
;
;
function withErrorHandler(handler) {
    return async function(req) {
        try {
            // Delegate to original handler
            const result = await handler(req);
            return result;
        } catch (err) {
            // Log full error with stack when available for debugging
            if (err instanceof Error) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logError"])('UNHANDLED_API_ERROR', {
                    message: err.message,
                    stack: err.stack
                });
            } else {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$logger$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logError"])('UNHANDLED_API_ERROR', {
                    err
                });
            }
            const formatted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatErrorResponse"])(err);
            const status = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getErrorStatus"])(err);
            // Include context for LoyaltyError in dev mode for debugging
            const isDev = ("TURBOPACK compile-time value", "development") !== 'production';
            const responseBody = {
                success: false,
                error: formatted.message,
                code: formatted.code
            };
            if (isDev && (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isLoyaltyError"])(err) && err.context) {
                responseBody.context = err.context;
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(responseBody, {
                status
            });
        }
    };
}
}),
"[project]/app/api/loyalty/rewards/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$loyaltyService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/features/loyalty/loyaltyService.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errorHandler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/errorHandler.ts [app-route] (ecmascript)");
const dynamic = "force-dynamic";
;
;
;
;
const GET = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$errorHandler$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["withErrorHandler"])(async (req)=>{
    const url = new URL(req.url);
    const querySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        limit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((v)=>v === undefined ? undefined : Number(v), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().max(100).optional()),
        page: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((v)=>v === undefined ? undefined : Number(v), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional())
    });
    const parsed = querySchema.parse(Object.fromEntries(url.searchParams.entries()));
    // For now listActiveRewards ignores pagination but we validate inputs
    const rewards = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$features$2f$loyalty$2f$loyaltyService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listActiveRewards"])();
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: true,
        data: rewards,
        meta: parsed
    }, {
        status: 200
    });
});
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b4ec9293._.js.map