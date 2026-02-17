/**
 * Enterprise-grade error handling system
 * Yapılandırılmış hata yönetimi, telemetry ve recovery
 */

export interface ErrorContext {
  userId?: string;
  rewardId?: string;
  claimId?: string;
  requestId?: string;
  field?: string;
  metadata?: Record<string, any>;
}

export class LoyaltyError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly context: ErrorContext;
  public readonly timestamp: Date;
  public readonly isDeveloperFacing: boolean;

  constructor(
    code: string,
    statusCode: number,
    message: string,
    context: ErrorContext = {},
    isDeveloperFacing: boolean = false
  ) {
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
      ...(this.isDeveloperFacing && { context: this.context }),
    };
  }
}

/**
 * BUSINESS LOGIC ERRORS (User-facing)
 */

export class InsufficientPointsError extends LoyaltyError {
  constructor(context?: ErrorContext) {
    super(
      'INSUFFICIENT_POINTS',
      400,
      'Yeterli puan bulunmamaktadır',
      context
    );
    this.name = 'InsufficientPointsError';
  }
}

export class RewardNotFoundError extends LoyaltyError {
  constructor(rewardId: string, context?: ErrorContext) {
    super(
      'REWARD_NOT_FOUND',
      404,
      `Ödül bulunamadı: ${rewardId}`,
      { ...context, rewardId },
      true
    );
    this.name = 'RewardNotFoundError';
  }
}

export class UserNotFoundError extends LoyaltyError {
  constructor(userId: string, context?: ErrorContext) {
    super(
      'USER_NOT_FOUND',
      404,
      `Kullanıcı bulunamadı: ${userId}`,
      { ...context, userId },
      true
    );
    this.name = 'UserNotFoundError';
  }
}

export class RewardInactiveError extends LoyaltyError {
  constructor(rewardId: string, context?: ErrorContext) {
    super(
      'REWARD_INACTIVE',
      400,
      'Bu ödül artık aktif değildir',
      { ...context, rewardId }
    );
    this.name = 'RewardInactiveError';
  }
}

export class DuplicateClaimError extends LoyaltyError {
  constructor(claimId?: string, context?: ErrorContext) {
    super(
      'DUPLICATE_CLAIM',
      409,
      'Bu ödül zaten talep edilmiştir',
      { ...context, claimId }
    );
    this.name = 'DuplicateClaimError';
  }
}

export class InvalidIdempotencyKeyError extends LoyaltyError {
  constructor(context?: ErrorContext) {
    super(
      'INVALID_IDEMPOTENCY_KEY',
      400,
      'İdempotency key gerekli ve UUID formatında olmalıdır',
      context
    );
    this.name = 'InvalidIdempotencyKeyError';
  }
}

/**
 * SYSTEM ERRORS (Developer-facing)
 */

export class DatabaseError extends LoyaltyError {
  constructor(originalError: Error, context?: ErrorContext) {
    super(
      'DATABASE_ERROR',
      500,
      'Veritabanı hatasından dolayı işlem tamamlanamamıştır',
      { ...context, metadata: { originalError: originalError.message } },
      true
    );
    this.name = 'DatabaseError';
  }
}

export class TransactionError extends LoyaltyError {
  constructor(originalError: Error, context?: ErrorContext) {
    super(
      'TRANSACTION_ERROR',
      500,
      'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyiniz',
      { ...context, metadata: { originalError: originalError.message } },
      true
    );
    this.name = 'TransactionError';
  }
}

export class ValidationError extends LoyaltyError {
  constructor(field: string, message: string, context?: ErrorContext) {
    super(
      'VALIDATION_ERROR',
      400,
      `${field}: ${message}`,
      { ...context, field }
    );
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends LoyaltyError {
  constructor(retryAfter: number, context?: ErrorContext) {
    super(
      'RATE_LIMIT_EXCEEDED',
      429,
      `Çok fazla istek gönderdiniz. ${retryAfter} saniye sonra tekrar deneyin`,
      { ...context, metadata: { retryAfter } }
    );
    this.name = 'RateLimitError';
  }
}

export class UnauthorizedError extends LoyaltyError {
  constructor(context?: ErrorContext) {
    super(
      'UNAUTHORIZED',
      401,
      'Yetkilendirme başarısız oldu',
      context
    );
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends LoyaltyError {
  constructor(resource: string, context?: ErrorContext) {
    super(
      'FORBIDDEN',
      403,
      `Bu kaynağa erişim izni yoktur: ${resource}`,
      { ...context, metadata: { resource } }
    );
    this.name = 'ForbiddenError';
  }
}

/**
 * Compatibility class for old code
 */
export class ConcurrencyConflictError extends Error {
  constructor(message = "Başka bir işlem aynı anda gerçekleşti") {
    super(message);
    this.name = "ConcurrencyConflictError";
  }
}

export class SystemError extends Error {
  constructor(message = "Sistem hatası oluştu") {
    super(message);
    this.name = "SystemError";
  }
}

/**
 * Utils
 */

export function isLoyaltyError(error: unknown): error is LoyaltyError {
  return error instanceof LoyaltyError;
}

export function getErrorStatus(error: unknown): number {
  if (isLoyaltyError(error)) {
    return error.statusCode;
  }
  return 500;
}

export function formatErrorResponse(error: unknown) {
  if (isLoyaltyError(error)) {
    return {
      code: error.code,
      message: error.message,
      status: error.statusCode,
    };
  }

  return {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Bir sistem hatası oluştu',
    status: 500,
  };
}
