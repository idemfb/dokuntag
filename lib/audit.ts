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

  // nullable fields (we may deliberately store null)
  changes?: string | null
  metadata?: string | null

  failureReason?: string
  ipAddress?: string
  userAgent?: string
}

/**
 * Remove keys with `undefined` values from an object.
 * This keeps `null` as-is (because Prisma accepts null for nullable fields).
 */
function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Partial<T> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as any)[k] = v
  }
  return out
}

export async function writeAuditLog(data: AuditLogInput) {
  try {
    const createData = stripUndefined({
      action: data.action,
      userId: data.userId,
      status: data.status,

      // optional strings: if undefined => removed; if string => kept
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      failureReason: data.failureReason,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,

      // nullable strings: allow null
      changes: data.changes ?? null,
      metadata: data.metadata ?? null,
    })

    const log = await prisma.auditLog.create({
      data: createData as any,
    })

    return log
  } catch (err) {
    // audit log should never break main flow
    return null
  }
}