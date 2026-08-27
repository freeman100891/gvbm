import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const body = await req.json();
    const { studentId, pointsChanged, reason } = body;

    if (!studentId || pointsChanged === undefined || !reason) {
      return NextResponse.json(
        { error: 'studentId, pointsChanged, and reason are required' },
        { status: 400 }
      );
    }

    const log = await prisma.pointLog.create({
      data: {
        studentId,
        pointsChanged: Number(pointsChanged),
        reason: reason.trim(),
      },
    });

    // Calculate updated total points
    const allLogs = await prisma.pointLog.findMany({
      where: { studentId },
    });
    const totalPoints = allLogs.reduce((acc, l) => acc + l.pointsChanged, 0);

    return NextResponse.json({
      success: true,
      log,
      totalPoints,
    });
  } catch (error) {
    console.error('Error logging point change:', error);
    return NextResponse.json(
      { error: 'Failed to record point change' },
      { status: 500 }
    );
  }
}
