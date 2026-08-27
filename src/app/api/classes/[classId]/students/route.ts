import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StudentUpsertSchema } from '@/validators/student.schema';
import { calculateStudentRank } from '@/lib/gamification-engine';
import { StudentWithStats, RankConfigItem } from '@/types';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        rankConfigs: true,
        students: {
          include: {
            pointLogs: {
              orderBy: { createdAt: 'desc' },
            },
            attendances: {
              orderBy: { date: 'desc' },
            },
          },
        },
      },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const rankConfigs = classData.rankConfigs as unknown as RankConfigItem[];

    const studentsWithStats: StudentWithStats[] = classData.students.map((s) => {
      const totalPoints = s.pointLogs.reduce((acc, l) => acc + l.pointsChanged, 0);
      const { rank, config } = calculateStudentRank(totalPoints, rankConfigs);

      const totalAtt = s.attendances.length;
      const presentCount = s.attendances.filter(
        (a) => a.status === 'PRESENT' || a.status === 'LATE'
      ).length;
      const attendanceRate = totalAtt > 0 ? (presentCount / totalAtt) * 100 : 100;

      return {
        id: s.id,
        classId: s.classId,
        fullName: s.fullName,
        avatar: s.avatar,
        gender: (s as any).gender || 'MALE',
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        notes: s.notes,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        totalPoints,
        currentRank: rank,
        rankConfig: config,
        recentLogs: s.pointLogs.slice(0, 5).map((l) => ({
          id: l.id,
          studentId: l.studentId,
          pointsChanged: l.pointsChanged,
          reason: l.reason,
          createdAt: l.createdAt,
        })),
        attendances: s.attendances.map((a) => ({
          id: a.id,
          studentId: a.studentId,
          classId: a.classId,
          date: a.date.toISOString().split('T')[0],
          status: a.status as any,
          note: a.note,
        })),
        attendanceRate,
      };
    });

    return NextResponse.json(studentsWithStats);
  } catch (error) {
    console.error('Error fetching students list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students list' },
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

    // Zod validation
    const parsed = StudentUpsertSchema.safeParse({ ...body, classId });
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const {
      fullName,
      avatar,
      gender,
      parentName,
      parentPhone,
      notes,
      initialPoints,
    } = parsed.data;

    const student = await prisma.student.create({
      data: {
        classId,
        fullName,
        avatar: avatar || null,
        parentName: parentName || null,
        parentPhone: parentPhone || null,
        notes: notes || null,
      },
    });

    if (initialPoints && Number(initialPoints) > 0) {
      await prisma.pointLog.create({
        data: {
          studentId: student.id,
          pointsChanged: Number(initialPoints),
          reason: 'Điểm khởi tạo ban đầu',
        },
      });
    }

    return NextResponse.json(student, { status: 201 });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: error?.message || String(error) || 'Failed to create student' },
      { status: 500 }
    );
  }
}
