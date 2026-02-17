import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createToken } from '@/lib/auth';
import { comparePassword, isPlaceholderHash } from '@/lib/password';
import { parseBody, loginSchema } from '@/lib/schemas';
import { withErrorHandler } from '@/lib/errorHandler';

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 * Returns JWT token for subsequent authenticated requests
 */
export const POST = withErrorHandler(async (req: NextRequest) => {
  const { email, password } = await parseBody(req, loginSchema);

  // Find user with explicit select (IMPORTANT)
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      loyaltyPoint: {
        select: {
          points: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Kullanıcı bulunamadı' },
      { status: 404 }
    );
  }

  // Placeholder password check (migration case)
  if (isPlaceholderHash(user.passwordHash)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Lütfen şifrenizi sıfırlayın',
        error_code: 'PLACEHOLDER_PASSWORD',
      },
      { status: 401 }
    );
  }

  // Verify password
  const passwordMatch = await comparePassword(password, user.passwordHash);
  if (!passwordMatch) {
    return NextResponse.json(
      { success: false, error: 'Geçersiz şifre' },
      { status: 401 }
    );
  }

  // Generate JWT token
  const token = await createToken({
    userId: user.id,
    email: user.email,
    role: user.role as 'user' | 'admin',
  });

  return NextResponse.json(
    {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        points: user.loyaltyPoint?.points ?? 0,
      },
    },
    { status: 200 }
  );
});