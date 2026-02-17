/**
 * Input validation helpers
 * Enterprise-grade validation - Type-safe ve detailed error messages
 */

import { ValidationError } from './errors';

/**
 * Validate UUID v4 format
 */
export function isValidUUID(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validate string is CUID format
 */
export function isValidCUID(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  // CUID pattern: starts with 'c', followed by 24 alphanumeric chars
  return /^c[a-z0-9]{24}$/.test(value);
}

/**
 * Validate email format
 */
export function isValidEmail(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Validate positive integer
 */
export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

/**
 * Validate non-negative integer
 */
export function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * Validate string is not empty and trim it
 */
export function isValidString(
  value: unknown,
  minLength: number = 1,
  maxLength: number = 255
): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

/**
 * Validate reward claim request body
 */
export function validateClaimRewardRequest(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('body', 'İstek gövdesi geçersiz');
  }

  const { userId, rewardId, idempotencyKey } = body as Record<string, unknown>;

  // Validate userId
  if (!isValidString(userId, 1, 255)) {
    throw new ValidationError('userId', 'Geçerli kullanıcı ID\'si gerekli');
  }

  // Validate rewardId
  if (!userId || (typeof rewardId !== 'string' || rewardId.length === 0)) {
    throw new ValidationError('rewardId', 'Geçerli ödül ID\'si gerekli');
  }

  // Validate idempotencyKey
  if (!isValidUUID(idempotencyKey)) {
    throw new ValidationError(
      'idempotencyKey',
      'Geçerli UUID formatında idempotency key gerekli'
    );
  }

  return {
    userId: userId as string,
    rewardId: rewardId as string,
    idempotencyKey: idempotencyKey as string,
  };
}

/**
 * Validate add points request body
 */
export function validateAddPointsRequest(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('body', 'İstek gövdesi geçersiz');
  }

  const { userId, points } = body as Record<string, unknown>;

  // Validate userId
  if (!isValidString(userId, 1, 255)) {
    throw new ValidationError('userId', 'Geçerli kullanıcı ID\'si gerekli');
  }

  // Validate points
  if (!isPositiveInteger(points)) {
    throw new ValidationError('points', 'Puan sayısı pozitif bir tamsayı olmalıdır');
  }

  // Sanity check for absurd amounts
  if (points > 1_000_000) {
    throw new ValidationError(
      'points',
      'Puan sayısı 1,000,000\'dan fazla olamaz'
    );
  }

  return {
    userId: userId as string,
    points: points as number,
  };
}

/**
 * Validate refund request body
 */
export function validateRefundClaimRequest(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('body', 'İstek gövdesi geçersiz');
  }

  const { claimId, reason } = body as Record<string, unknown>;

  // Validate claimId
  if (!isValidCUID(claimId)) {
    throw new ValidationError(
      'claimId',
      'Geçerli claim ID\'si gerekli (CUID formatı)'
    );
  }

  // Validate reason
  const validReasons = ['user_request', 'admin_action', 'system_error', 'duplicate'];
  if (!isValidString(reason, 5, 50) || !validReasons.includes(reason as string)) {
    throw new ValidationError(
      'reason',
      `İade nedeni şu değerlerden biri olmalıdır: ${validReasons.join(', ')}`
    );
  }

  return {
    claimId: claimId as string,
    reason: reason as string,
  };
}

/**
 * Validate get user points request
 */
export function validateGetPointsRequest(userId: unknown) {
  if (!isValidString(userId, 1, 255)) {
    throw new ValidationError('userId', 'Geçerli kullanıcı ID\'si gerekli');
  }

  return { userId: userId as string };
}

/**
 * Validate admin points override request
 */
export function validatePointsOverrideRequest(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('body', 'İstek gövdesi geçersiz');
  }

  const { userId, newPoints, reason } = body as Record<string, unknown>;

  // Validate userId
  if (!isValidString(userId, 1, 255)) {
    throw new ValidationError('userId', 'Geçerli kullanıcı ID\'si gerekli');
  }

  // Validate newPoints
  if (!isNonNegativeInteger(newPoints)) {
    throw new ValidationError('newPoints', 'Yeni puan sayısı negatif olmayan bir tamsayı olmalıdır');
  }

  // Validate reason
  if (!isValidString(reason, 3, 255)) {
    throw new ValidationError('reason', 'Geçerli bir sebep gerekli (3-255 karakter)');
  }

  return {
    userId: userId as string,
    newPoints: newPoints as number,
    reason: reason as string,
  };
}

/**
 * Validate bulk add points request
 */
export function validateBulkPointsRequest(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('body', 'İstek gövdesi geçersiz');
  }

  const { userIds, points, reason } = body as Record<string, unknown>;

  // Validate userIds
  if (!Array.isArray(userIds) || userIds.length === 0 || userIds.length > 1000) {
    throw new ValidationError('userIds', 'Kullanıcı ID\'leri dizisi (1-1000 arasında) gerekli');
  }

  for (const userId of userIds) {
    if (!isValidString(userId, 1, 255)) {
      throw new ValidationError('userIds', `Geçersiz kullanıcı ID: ${userId}`);
    }
  }

  // Validate points
  if (!isPositiveInteger(points)) {
    throw new ValidationError('points', 'Puan sayısı pozitif bir tamsayı olmalıdır');
  }

  // Validate reason
  if (!isValidString(reason, 3, 255)) {
    throw new ValidationError('reason', 'Geçerli bir sebep gerekli (3-255 karakter)');
  }

  return {
    userIds: userIds as string[],
    points: points as number,
    reason: reason as string,
  };
}

/**
 * Validate admin stats request
 */
export function validateAdminStatsRequest(body: unknown) {
  // Stats endpoint doesn't require specific body validation
  return {};
}

/**
 * Common validation error handler for API routes
 */
export function handleValidationError(error: unknown) {
  if (error instanceof ValidationError) {
    return {
      statusCode: error.statusCode,
      body: {
        code: error.code,
        message: error.message,
        field: error.context.field,
      },
    };
  }
  throw error;
}
