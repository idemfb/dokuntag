import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        loyaltyPoint: true,
        rewardClaims: { include: { reward: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('GET /api/user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, email, name, password } = await req.json();

    if (!id || !email || !name || !password) {
      return NextResponse.json(
        { error: 'ID, email, name, and password required' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { 
        id, 
        email, 
        name,
        passwordHash,
        role: 'user',
      },
    });

    // Create loyalty points for new user
    await prisma.loyaltyPoint.create({
      data: { userId: id, points: 0 },
    });

    // Return user without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('POST /api/user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...data } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    // Return user without passwordHash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('PUT /api/user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
