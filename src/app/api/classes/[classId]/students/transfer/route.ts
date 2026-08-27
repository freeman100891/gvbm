import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StudentTransferSchema } from '@/validators/student.schema';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const body = await req.json();

    const parsed = StudentTransferSchema.safeParse({
      ...body,
      sourceClassId: classId,
    });

    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { studentIds, targetClassId, keepPointHistory } = parsed.data;

    // Verify target class exists
    const targetClass = await prisma.class.findUnique({
      where: { id: targetClassId },
    });

    if (!targetClass) {
      return NextResponse.json(
        { error: 'Lớp học đích không tồn tại' },
        { status: 404 }
      );
    }

    // 1. Move students to target class
    await prisma.student.updateMany({
      where: {
        id: { in: studentIds },
        classId,
      },
      data: {
        classId: targetClassId,
      },
    });

    // 2. Handle point history
    if (!keepPointHistory) {
      // Calculate current total points for each student and append a neutralizing PointLog
      for (const sId of studentIds) {
        const logs = await prisma.pointLog.findMany({
          where: { studentId: sId },
        });
        const currentPoints = logs.reduce((acc, l) => acc + l.pointsChanged, 0);

        if (currentPoints !== 0) {
          await prisma.pointLog.create({
            data: {
              studentId: sId,
              pointsChanged: -currentPoints,
              reason: `Chuyển sang lớp ${targetClass.name} (Đặt lại điểm về Dân)`,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      transferredCount: studentIds.length,
      targetClassName: targetClass.name,
    });
  } catch (error) {
    console.error('Error transferring students:', error);
    return NextResponse.json(
      { error: 'Failed to transfer students' },
      { status: 500 }
    );
  }
}
