import crypto from 'crypto'

function hash(value: string) {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex')
    .substring(0, 12)
}

function baseLog(level: string, event: string, payload: any) {
  const safePayload = { ...payload }

  if (safePayload.idempotencyKey) {
    safePayload.idempotencyKey = hash(safePayload.idempotencyKey)
  }

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      event,
      payload: safePayload,
    })
  )
}

export function logInfo(event: string, payload: any) {
  baseLog('INFO', event, payload)
}

export function logWarn(event: string, payload: any) {
  baseLog('WARN', event, payload)
}

export function logError(event: string, payload: any) {
  baseLog('ERROR', event, payload)
}