import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ScanLog {
  id: string;
  userId: string;
  tagData: string;
  scanTime: Date;
  metadata?: Record<string, any>;
}

// In-memory scan log (production'da DB kullanılmalı)
const scanLogs: ScanLog[] = [];

export async function POST(req: NextRequest) {
  try {
    const { userId, tagData, metadata } = await req.json();

    if (!userId || !tagData) {
      return NextResponse.json(
        { error: 'userId and tagData required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create scan log
    const scanLog: ScanLog = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      tagData,
      scanTime: new Date(),
      metadata,
    };

    scanLogs.push(scanLog);

    // Audit log kaydet
    if (prisma.auditLog) {
      await prisma.auditLog.create({
        data: {
          action: 'SCAN_TAG',
          userId,
          resourceType: 'scan',
          resourceId: scanLog.id,
          status: 'SUCCESS',
          metadata: JSON.stringify(metadata || {}),
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        scanId: scanLog.id,
        message: `Tag scanned for user ${user.name}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/scan error:', error);
    return NextResponse.json(
      { error: 'Failed to process scan' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    const userScans = scanLogs.filter((log) => log.userId === userId);

    return NextResponse.json({
      userId,
      totalScans: userScans.length,
      recentScans: userScans.slice(-10),
    });
  } catch (error) {
    console.error('GET /api/scan error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scans' },
      { status: 500 }
    );
  }
}
