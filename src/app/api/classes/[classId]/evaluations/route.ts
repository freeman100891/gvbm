import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period');
    const studentId = searchParams.get('studentId');

    let whereClause: any = { classId };
    if (period) whereClause.period = period;
    if (studentId) whereClause.studentId = studentId;

    const evaluations = await prisma.evaluation.findMany({
      where: whereClause,
      include: {
        student: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
    });

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const body = await req.json();
    const {
      studentId,
      period,
      vocabulary,
      grammar,
      speaking,
      attitude,
      generalComment,
    } = body;

    if (!studentId || !period || !generalComment) {
      return NextResponse.json(
        { error: 'studentId, period, and generalComment are required' },
        { status: 400 }
      );
    }

    // Find existing evaluation or create new
    const existing = await prisma.evaluation.findFirst({
      where: {
        studentId,
        period,
      },
    });

    let result;
    if (existing) {
      result = await prisma.evaluation.update({
        where: { id: existing.id },
        data: {
          vocabulary: vocabulary || null,
          grammar: grammar || null,
          speaking: speaking || null,
          attitude: attitude || null,
          generalComment: generalComment.trim(),
        },
      });
    } else {
      result = await prisma.evaluation.create({
        data: {
          studentId,
          classId,
          period,
          vocabulary: vocabulary || null,
          grammar: grammar || null,
          speaking: speaking || null,
          attitude: attitude || null,
          generalComment: generalComment.trim(),
        },
      });
    }

    return NextResponse.json({ success: true, evaluation: result });
  } catch (error) {
    console.error('Error saving evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to save evaluation' },
      { status: 500 }
    );
  }
}
