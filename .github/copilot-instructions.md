# dokuntag: AI Coding Agent Instructions

## Project Overview
A **Next.js 14 loyalty/rewards system** where users earn points and claim rewards with strict concurrency safety and idempotency guarantees. **Enterprise-ready** with comprehensive error handling, audit logging, caching, and refund management.

Key features: 
- Turkish language support
- SQLite persistence with Prisma
- Transaction-based consistency
- Advanced error handling & recovery
- Audit logging for compliance  
- Performance caching layer
- Refund/cancellation system

## Architecture & Data Flow

### Core Domain Model
- **User**: Identity with loyalty points tracked separately
- **Reward**: Redemption items with point costs (must be active)
- **RewardClaim**: Transaction record with unique `idempotencyKey` preventing duplicates + refund status
- **LoyaltyPoint**: User point balance (created via upsert)
- **AuditLog**: Comprehensive audit trail for all operations

### API Entry Points  
All loyalty endpoints are in `app/api/loyalty/`:
- `POST /addPoints` → `addPoints(userId, pointsToAdd)`
- `POST /claimReward` → `claimReward(userId, rewardId, idempotencyKey)`  
- `POST /refund` → `refundClaim(claimId, reason, [refundedBy])` — **NEW**
- `GET /rewards` → list active rewards
- `GET /points?userId=X` → get user balance

### Service Layer Patterns
- app/features/loyalty/loyaltyService.ts - Core loyalty operations
- app/features/loyalty/refundService.ts - Refund & cancellation logic
- All use `prisma.$transaction()` for atomicity

## Critical Patterns & Conventions

### 🔒 Idempotency & Concurrency Safety
**Problem solved**: Concurrent reward claims & duplicate prevention.  
**Solution**: Every claim uses unique `idempotencyKey` (UUID) + database constraints:
```typescript
// Step 1: Check if already claimed (idempotent)
const existing = await tx.rewardClaim.findUnique({ where: { idempotencyKey } });
if (existing) return existing; // Return cached result

// Step 2-3: Validate & execute atomically in transaction
```

### 💾 Prisma Transactions for Consistency
All multi-step operations must use `prisma.$transaction()`:
```typescript
export async function claimReward(userId, rewardId, idempotencyKey) {
  return prisma.$transaction(async (tx) => {
    // Check existing
    // Validate reward
    // Deduct points
    // Record claim
    // Return result
  });
}
```
**Critical rule**: Don't mix `prisma` and `tx` - always use tx parameter inside transactions.

### ⬆️ Upsert for Point Creation
Initialize points using upsert for new users:
```typescript
await prisma.loyaltyPoint.upsert({
  where: { userId },
  update: { points: { increment: pointsToAdd } },
  create: { userId, points: pointsToAdd }
});
```

### 🛡️ **ENTERPRISE: Advanced Error Handling**
Located in lib/errors.ts - Structured error system:
```typescript
// Extends Error with code, status, context
export class LoyaltyError extends Error {
  code: string;        // "INSUFFICIENT_POINTS"
  statusCode: number;  // 400, 401, 404, 409, 500
  context: ErrorContext;
}

// Business logic errors (user-facing)
- InsufficientPointsError
- RewardNotFoundError / RewardInactiveError
- DuplicateClaimError
- InvalidIdempotencyKeyError

// System errors (developer-facing)
- DatabaseError
- TransactionError
- ValidationError
- RateLimitError / UnauthorizedError / ForbiddenError
```

Usage in endpoints:
```typescript
try {
  const result = await claimReward(...);
  return NextResponse.json(result, { status: 201 });
} catch (error) {
  const statusCode = isLoyaltyError(error) ? error.statusCode : 500;
  return NextResponse.json(formatErrorResponse(error), { status: statusCode });
}
```

### 📝 **ENTERPRISE: Audit Logging**
Located in lib/audit.ts - Tracks every operation:
```typescript
await auditLog({
  action: 'CLAIM_REWARD',        // or 'REFUND_CLAIM', 'ADD_POINTS', etc
  userId: user.id,
  resourceId: claimId,
  resourceType: 'claim',
  status: 'SUCCESS' | 'FAILED',
  metadata: { /* context data */ }
});

// Query functions:
- getUserAuditLogs(userId, limit)
- getResourceAuditLogs(resourceType, resourceId)
- getFailedOperations(hours)        // For investigation
- getActivitySummary(hours)         // For dashboards
```

### ⚡ **ENTERPRISE: Caching System**
Located in lib/cache.ts - In-memory + TTL:
```typescript
// Global cache instances
export const rewardsCache = new Cache<any[]>(300);        // 5 min
export const userPointsCache = new Cache<any>(30);        // 30 sec
export const rewardDetailsCache = new Cache<any>(600);    // 10 min

// Usage
const rewards = await withCache(
  cacheKeys.activeRewards(),
  rewardsCache,
  () => prisma.reward.findMany({ where: { active: true } })
);

// Invalidate on changes
invalidateRelatedCaches('claim', userId);  // Clears user-specific caches
```

### ♻️ **ENTERPRISE: Refund System**
Located in app/features/loyalty/refundService.ts:
```typescript
export async function refundClaim(
  claimId: string,
  reason: 'user_request' | 'admin_action' | 'system_error' | 'duplicate',
  refundedBy?: string  // Admin ID
): Promise<RefundResult>

// What happens:
// 1. Find claim & verify not already refunded
// 2. Get reward costPoints
// 3. Return points to user (increment)
// 4. Mark claim as refunded with reason
// 5. Audit log + cache invalidation
```

Plus admin functions:
```typescript
getUserRefundHistory(userId, limit)
getRefundStatistics(hours)           // Dashboard metrics
cancelAllUserClaims(userId, reason, adminId)  // Bulk action
```

### ✅ **ENTERPRISE: Input Validation**
Located in lib/validation.ts - Type-safe validators:
```typescript
// Utilities
isValidUUID(value)          // UUID v4 format
isValidCUID(value)          // CUID format
isValidEmail(value)
isPositiveInteger(value)
isValidString(value, minLen, maxLen)

// Request validators
validateClaimRewardRequest(body)   // Returns { userId, rewardId, idempotencyKey }
validateAddPointsRequest(body)     // Returns { userId, points }
validateRefundClaimRequest(body)   // Returns { claimId, reason }
validateGetPointsRequest(userId)

// Throws ValidationError on failure
```

## Developer Workflows

### Local Development
```bash
npm run dev               # Start dev server
npm run build             # TypeScript check + Next.js build
npx prisma generate      # Regenerate Prisma client (auto on npm install)
npx prisma migrate dev   # Create/apply migrations
```

### Testing & Verification
- **Loyalty flow**: `npx ts-node tests/loyalty.test.ts`
- **Concurrency**: `npx ts-node tests/concurrency-loyalty-test.ts`
- **Manual API**: See tests/ for request patterns

### Seeding Data
- `npm run seed` → Populate Rewards + Users
- `curl -X POST http://localhost:3000/api/seed` → HTTP seed

## Import Path Aliases & Structure  
- `@/*` resolves to workspace root (tsconfig.json)
- Use `@/lib/...` for utilities (errors, audit, cache, validation)
- Use `@/app/features/...` for service layer
- Prisma always via `@/lib/prisma`

## Turkish Language Context
Project uses Turkish for:
- Error messages (lib/errors.ts)
- Log output (lib/logger.ts with Pino)
- Audit action labels
- User-facing text

## Key Files Reference
| File | Purpose |
|------|---------|
| prisma/schema.prisma | Data model with AuditLog + refund fields |
| app/features/loyalty/loyaltyService.ts | Core operations (claim, addPoints, listRewards) |
| app/features/loyalty/refundService.ts | Refund & cancellation logic |
| lib/errors.ts | Enterprise error classes |
| lib/audit.ts | Audit logging & analytics |
| lib/cache.ts | Performance caching (in-memory) |
| lib/validation.ts | Input validation helpers |
| lib/prisma.ts | Global Prisma singleton |
| lib/logger.ts | Pino logger with Structured JSON |

## Patterns to Avoid
❌ **Don't**: Call `prisma` directly inside tx callback—use `tx` parameter  
❌ **Don't**: Forget idempotency keys or error handling in new endpoints  
❌ **Don't**: Skip audit logging for privileged operations  
❌ **Don't**: Cache without invalidation triggers  
❌ **Don't**: Throw generic Error—use LoyaltyError or subclass  
❌ **Don't**: Import Prisma directly—always via `@/lib/prisma`

## Production Readiness Checklist
- [x] Error handling (structured, typed, recoverable)
- [x] Audit logging (compliance, debugging, fraud detection)
- [x] Input validation (type-safe, detailed messages)
- [x] Caching (performance optimization)
- [x] Refund system (user cancellation + admin actions)
- [ ] Authentication/Authorization (add JWT + role checks)
- [ ] Rate limiting (add middleware)
- [ ] Database backups & disaster recovery
- [ ] Monitoring & alerting (log aggregation, metrics)
- [ ] Load testing & performance profiling
