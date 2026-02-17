// --- Ek Fonksiyonlar: addPoints, getUserPoints, listActiveRewards ---
export async function addPoints(userId: string, points: number) {
  if (points <= 0) {
    throw new Error('Puan 0dan büyük olmalı')
  }
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new Error('Kullanıcı bulunamadı')
  }
  const updated = await prisma.loyaltyPoint.upsert({
    where: { userId },
    update: { points: { increment: points } },
    create: { userId, points },
  })
  return { userId, points: updated.points }
}

export async function getUserPoints(userId: string) {
  const points = await prisma.loyaltyPoint.findUnique({ where: { userId } })
  return points ?? { userId, points: 0 }
}

export async function listActiveRewards() {
  return await prisma.reward.findMany({ where: { active: true } })
}
import { prisma } from '../../../lib/prisma'
import { Prisma } from '@prisma/client'
import { logInfo, logWarn, logError } from './logger'
import { increment } from './metrics'

type ClaimResponse = {
  success: boolean
  data?: any
  error?: string
  code?: string
}

export async function claimReward(
  userId: string,
  rewardId: string,
  idempotencyKey: string
): Promise<{ response: ClaimResponse; statusCode: number }> {
  increment('claim_attempt_total')
  logInfo('CLAIM_ATTEMPT', { userId, rewardId })

  // -------- PRE-CHECK (FAST REPLAY) --------
  const existing = await prisma.idempotencyRecord.findUnique({
    where: {
      userId_idempotencyKey: {
        userId,
        idempotencyKey,
      },
    },
  })

  if (existing) {
    if (existing.rewardId !== rewardId) {
      increment('claim_conflict_total')
      logWarn('CLAIM_CONFLICT', { userId, rewardId })
      return {
        response: {
          success: false,
          error: 'Idempotency-Key başka bir işlem için kullanılmış',
          code: 'IDEMPOTENCY_CONFLICT',
        },
        statusCode: 409,
      }
    }

    increment('claim_replay_total')
    logInfo('CLAIM_IDEMPOTENT_REPLAY', { userId, rewardId })

    return {
      response: JSON.parse(existing.responseJson),
      statusCode: existing.statusCode,
    }
  }

  // -------- MAIN EXECUTION --------
  return withRetry(async () => {
    try {
      return await prisma.$transaction(async (tx) => {
        const idemp = await tx.idempotencyRecord.findUnique({
          where: {
            userId_idempotencyKey: {
              userId,
              idempotencyKey,
            },
          },
        })

        if (idemp) {
          if (idemp.rewardId !== rewardId) {
            increment('claim_conflict_total')
            logWarn('CLAIM_CONFLICT', { userId, rewardId })

            return {
              response: {
                success: false,
                error: 'Idempotency-Key başka bir işlem için kullanılmış',
                code: 'IDEMPOTENCY_CONFLICT',
              },
              statusCode: 409,
            }
          }

          increment('claim_replay_total')
          logInfo('CLAIM_IDEMPOTENT_REPLAY', { userId, rewardId })

          return {
            response: JSON.parse(idemp.responseJson),
            statusCode: idemp.statusCode,
          }
        }

        let claim
        let response: ClaimResponse
        let statusCode = 201

        try {
          claim = await tx.rewardClaim.create({
            data: {
              userId,
              rewardId,
              idempotencyKey,
            },
          })
        } catch (e: any) {
          if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === 'P2002'
          ) {
            increment('claim_duplicate_total')
            logWarn('CLAIM_DUPLICATE', { userId, rewardId })

            const replay = await tx.idempotencyRecord.findUnique({
              where: {
                userId_idempotencyKey: {
                  userId,
                  idempotencyKey,
                },
              },
            })

            if (replay) {
              increment('claim_replay_total')
              logInfo('CLAIM_IDEMPOTENT_REPLAY', { userId, rewardId })

              return {
                response: JSON.parse(replay.responseJson),
                statusCode: replay.statusCode,
              }
            }
          }

          throw e
        }

        increment('claim_success_total')
        logInfo('CLAIM_SUCCESS', { userId, rewardId })

        response = {
          success: true,
          data: claim,
        }

        await tx.idempotencyRecord.create({
          data: {
            userId,
            rewardId,
            idempotencyKey,
            responseJson: JSON.stringify(response),
            statusCode,
          },
        })

        return { response, statusCode }
      })
    } catch (err: any) {
      increment('claim_fatal_total')
      logError('CLAIM_FATAL', {
        userId,
        rewardId,
        message: err.message,
      })

      return {
        response: {
          success: false,
          error: err.message || 'Bilinmeyen hata',
          code: err.code || 'ERROR',
        },
        statusCode: 500,
      }
    }
  })
}

// ---------------- RETRY WRAPPER ----------------

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let attempt = 0
  let delay = 100

  while (true) {
    try {
      return await fn()
    } catch (err: any) {
      const msg = String(err?.message || '').toLowerCase()
      const code = err?.code

      if (
        attempt < maxRetries &&
        (code === 'SQLITE_BUSY' ||
          msg.includes('database is locked') ||
          msg.includes('deadlock') ||
          msg.includes('serialization failure'))
      ) {
        increment('claim_retry_total')
        logWarn('CLAIM_RETRY', {
          attemptNumber: attempt + 1,
          reason: code || msg,
        })

        await new Promise((r) => setTimeout(r, delay))
        attempt++
        delay *= 2
        continue
      }

      throw err
    }
  }
}