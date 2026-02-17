import { z } from 'zod';
import { ValidationError } from './errors';

export const claimRewardSchema = z.object({
  userId: z.string().min(1),
  rewardId: z.string().min(1),
  idempotencyKey: z.string().uuid(),
});

export const addPointsSchema = z.object({
  userId: z.string().min(1),
  points: z.number().int().positive().max(1_000_000),
});

export const refundSchema = z.object({
  claimId: z.string().min(1),
  reason: z.enum(['user_request', 'admin_action', 'system_error', 'duplicate']),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function parseBody<T>(req: Request | any, schema: z.ZodType<T>): Promise<T> {
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0];
    const path = (first as any).path.join('.') || 'body';
    throw new ValidationError(path, first.message);
  }
  return result.data;
}
