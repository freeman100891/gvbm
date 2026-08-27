import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StudentBatchDeleteSchema } from '@/validators/student.schema';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const body = await req.json();

    const parsed = StudentBatchDeleteSchema.safeParse({ ...body, classId });
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { studentIds } = parsed.data;

    // Delete in batch
    const deleteResult = await prisma.student.deleteMany({
      where: {
        id: { in: studentIds },
        classId,
      },
    });

    return NextResponse.json({
      success: true,
      count: deleteResult.count,
    });
  } catch (error) {
    console.error('Error batch deleting students:', error);
    return NextResponse.json(
      { error: 'Failed to batch delete students' },
      { status: 500 }
    );
  }
}
