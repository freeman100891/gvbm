import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
              take: 30,
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

      // Attendance stats
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

    return NextResponse.json({
      ...classData,
      students: studentsWithStats,
    });
  } catch (error) {
    console.error('Error fetching class details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class details' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    await prisma.class.delete({
      where: { id: classId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    );
  }
}
