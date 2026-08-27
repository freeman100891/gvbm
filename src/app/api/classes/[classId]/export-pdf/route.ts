import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { StudentPDFTemplate } from '@/components/reports/student-pdf-template';
import { calculateStudentRank } from '@/lib/gamification-engine';
import { StudentWithStats, RankConfigItem, ClassItem } from '@/types';
import React from 'react';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const period = searchParams.get('period') || 'Tháng 09/2026';

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId query param is required' },
        { status: 400 }
      );
    }

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        rankConfigs: true,
      },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        pointLogs: true,
        attendances: true,
        evaluations: {
          where: { period },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const rankConfigs = classData.rankConfigs as unknown as RankConfigItem[];
    const totalPoints = student.pointLogs.reduce((acc, l) => acc + l.pointsChanged, 0);
    const { rank, config } = calculateStudentRank(totalPoints, rankConfigs);

    const totalAtt = student.attendances.length;
    const presentCount = student.attendances.filter(
      (a) => a.status === 'PRESENT' || a.status === 'LATE'
    ).length;
    const attendanceRate = totalAtt > 0 ? (presentCount / totalAtt) * 100 : 100;

    const studentWithStats: StudentWithStats = {
      id: student.id,
      classId: student.classId,
      fullName: student.fullName,
      avatar: student.avatar,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      notes: student.notes,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      totalPoints,
      currentRank: rank,
      rankConfig: config,
      attendanceRate,
    };

    const classItem: ClassItem = {
      id: classData.id,
      name: classData.name,
      academicYear: classData.academicYear,
      description: classData.description,
      createdAt: classData.createdAt,
      updatedAt: classData.updatedAt,
    };

    const evaluation = student.evaluations[0] || null;

    // Render PDF buffer
    const pdfElement = React.createElement(StudentPDFTemplate, {
      student: studentWithStats,
      classData: classItem,
      evaluation: evaluation ? ({ ...evaluation, createdAt: evaluation.createdAt.toISOString(), updatedAt: evaluation.updatedAt.toISOString() } as any) : null,
      periodName: period,
    });

    const pdfBuffer = await renderToBuffer(pdfElement as any);

    return new Response(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="Phieu_Nhan_Xet_${encodeURIComponent(student.fullName)}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
