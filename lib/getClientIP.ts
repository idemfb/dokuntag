import { NextRequest } from 'next/server'

export function getClientIP(req: NextRequest): string {
  // X-Forwarded-For, Cloudflare, Vercel, fallback
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const cf = req.headers.get('cf-connecting-ip')
  if (cf) return cf
  const real = req.headers.get('x-real-ip')
  if (real) return real
  // Edge runtime: req.ip yok, fallback
  return 'unknown'
}
