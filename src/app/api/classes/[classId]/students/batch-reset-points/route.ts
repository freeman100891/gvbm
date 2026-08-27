import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StudentResetPointsSchema } from '@/validators/student.schema';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const body = await req.json();

    const parsed = StudentResetPointsSchema.safeParse({ ...body, classId });
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { studentIds, reason } = parsed.data;

    let resetCount = 0;

    for (const studentId of studentIds) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { pointLogs: true },
      });

      if (student) {
        const currentPoints = student.pointLogs.reduce(
          (acc, l) => acc + l.pointsChanged,
          0
        );

        if (currentPoints !== 0) {
          await prisma.pointLog.create({
            data: {
              studentId,
              pointsChanged: -currentPoints,
              reason: reason || 'Đặt lại điểm thi đua hàng loạt (Về Dân)',
            },
          });
          resetCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      resetCount,
    });
  } catch (error) {
    console.error('Error batch resetting points:', error);
    return NextResponse.json(
      { error: 'Failed to batch reset points' },
      { status: 500 }
    );
  }
}
