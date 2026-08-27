import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string; studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || 'Đặt lại điểm đầu kỳ thi đua mới (Về Dân)';

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { pointLogs: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const currentPoints = student.pointLogs.reduce(
      (acc, l) => acc + l.pointsChanged,
      0
    );

    if (currentPoints !== 0) {
      await prisma.pointLog.create({
        data: {
          studentId,
          pointsChanged: -currentPoints,
          reason,
        },
      });
    }

    return NextResponse.json({
      success: true,
      previousPoints: currentPoints,
      newPoints: 0,
    });
  } catch (error) {
    console.error('Error resetting points:', error);
    return NextResponse.json(
      { error: 'Failed to reset student points' },
      { status: 500 }
    );
  }
}
