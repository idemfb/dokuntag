const memoryStore: Record<string, { count: number; reset: number }> = {}

export async function checkRateLimit(key: string, max: number, windowMs: number): Promise<boolean> {
  const now = Date.now()
  if (!memoryStore[key] || memoryStore[key].reset < now) {
    memoryStore[key] = { count: 1, reset: now + windowMs }
    return true
  }
  if (memoryStore[key].count < max) {
    memoryStore[key].count++
    return true
  }
  return false
}

export async function getResetTime(key: string): Promise<number> {
  const now = Date.now()
  if (!memoryStore[key]) return 0
  return Math.max(0, Math.floor((memoryStore[key].reset - now) / 1000))
}
