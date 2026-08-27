import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StudentUpsertSchema } from '@/validators/student.schema';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string; studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        pointLogs: {
          orderBy: { createdAt: 'desc' },
        },
        attendances: {
          orderBy: { date: 'desc' },
        },
        evaluations: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student profile' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ classId: string; studentId: string }> }
) {
  try {
    const { classId, studentId } = await params;
    const body = await req.json();

    const parsed = StudentUpsertSchema.safeParse({ ...body, classId });
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { fullName, avatar, gender, parentName, parentPhone, notes } = parsed.data;

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        fullName,
        avatar: avatar !== undefined ? avatar : undefined,
        parentName: parentName !== undefined ? parentName : undefined,
        parentPhone: parentPhone !== undefined ? parentPhone : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ classId: string; studentId: string }> }
) {
  try {
    const { studentId } = await params;

    // Delete student (Cascade deletes attendances, pointLogs, evaluations)
    await prisma.student.delete({
      where: { id: studentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
