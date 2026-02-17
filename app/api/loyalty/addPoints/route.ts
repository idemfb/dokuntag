import { NextRequest } from 'next/server';
import { addPoints } from '../../../features/loyalty/loyaltyService';
import { ok, fail } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, points } = body;
    if (!userId || typeof userId !== 'string') {
      return fail({ code: 'VALIDATION', message: 'Geçersiz kullanıcı.' }, 400);
    }
    if (typeof points !== 'number' || points <= 0) {
      return fail({ code: 'VALIDATION', message: 'Puan pozitif olmalı.' }, 400);
    }
    const data = await addPoints(userId, points);
    return ok(data, 201);
  } catch (error: any) {
    return fail({ code: error.code || 'INTERNAL', message: 'İşlem gerçekleştirilemedi.' }, error.statusCode || 500);
  }
}
