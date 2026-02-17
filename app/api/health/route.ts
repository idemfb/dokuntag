import { validateEnv } from '@/lib/env';
import { prisma } from '@/lib/prisma';
validateEnv();

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'ok', time: new Date().toISOString() });
  } catch {
    return Response.json({ status: 'degraded' }, { status: 503 });
  }
}
