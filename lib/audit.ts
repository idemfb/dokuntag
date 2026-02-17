import { prisma } from './prisma'

export type AuditStatus = 'SUCCESS' | 'FAILURE' | 'PARTIAL_SUCCESS'

export type AuditAction =
  | 'CLAIM_ATTEMPT'
  | 'CLAIM_SUCCESS'
  | 'CLAIM_DUPLICATE'
  | 'CLAIM_CONFLICT'
  | 'CLAIM_RETRY'
  | 'CLAIM_FATAL'
  | 'SCAN'
  | 'CLAIM'
  | 'NOTIFY'
  | string

export type AuditLogInput = {
  action: AuditAction
  userId: string
  status: AuditStatus

  resourceType?: string
  resourceId?: string

  // nullable fields
  changes?: string | null
  metadata?: string | null

  failureReason?: string
  ipAddress?: string
  userAgent?: string
}

/**
 * Remove keys with `undefined` values from an object.
 * Keeps `null` as-is (Prisma accepts null for nullable fields).
 */
function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Partial<T> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as any)[k] = v
  }
  return out
}

/**
 * Main writer (explicit name)
 */
export async function writeAuditLog(data: AuditLogInput) {
  try {
    const createData = stripUndefined({
      action: data.action,
      userId: data.userId,
      status: data.status,

      resourceType: data.resourceType,
      resourceId: data.resourceId,
      failureReason: data.failureReason,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,

      // allow explicit null
      changes: data.changes ?? null,
      metadata: data.metadata ?? null,
    })

    const log = await prisma.auditLog.create({
      data: createData as any,
    })

    return log
  } catch {
    // audit log should never break main flow
    return null
  }
}

/**
 * Backward-compatible export expected by other modules:
 * import { auditLog } from '@/lib/audit'
 */
export const auditLog = writeAuditLog