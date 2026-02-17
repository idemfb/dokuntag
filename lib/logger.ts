


/**
 * Edge ve Node 18+ uyumlu SHA-256 hex hash fonksiyonu
 * Web Crypto API kullanır, sync fallback yoktur.
 */
export async function hashIdempotencyKey(key: string): Promise<string> {
  if (!key) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  // globalThis.crypto hem Node 18+ hem Edge'de mevcut
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  // Buffer'dan hex string'e çevir
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hex.slice(0, 12);
}

async function redact(obj: any): Promise<any> {
  if (!obj || typeof obj !== 'object') return obj;
  const out: any = Array.isArray(obj) ? [] : {};
  for (const k in obj) {
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


type LogContext = {
  requestId?: string;
  userId?: string;
  ip?: string;
  [key: string]: any;
};

export async function log(level: string, event: string, payload: object, context?: LogContext) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...context,
    payload: await redact(payload),
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry));
}

export function logInfo(event: string, payload: object, context?: LogContext) {
  log('info', event, payload, context);
}
export function logWarn(event: string, payload: object, context?: LogContext) {
  log('warn', event, payload, context);
}
export function logError(event: string, payload: object, context?: LogContext) {
  log('error', event, payload, context);
}
