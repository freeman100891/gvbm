import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  generateStudentContactExcel,
  generateGamificationLeaderboardExcel,
  generateMonthlyAttendanceExcel,
  generateImportTemplateExcel,
} from '@/lib/excel-generator';
import { calculateStudentRank } from '@/lib/gamification-engine';
import { StudentWithStats, RankConfigItem, ClassItem } from '@/types';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'contacts';

    if (type === 'template') {
      const buffer = await generateImportTemplateExcel();
      return new Response(buffer as any, {
        status: 200,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="Mau_Nhap_Hoc_Sinh_GVBM.xlsx"`,
        },
      });
    }

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        rankConfigs: true,
        students: {
          include: {
            pointLogs: true,
            attendances: true,
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
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        notes: s.notes,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        totalPoints,
        currentRank: rank,
        rankConfig: config,
        attendanceRate,
      };
    });

    const classItem: ClassItem = {
      id: classData.id,
      name: classData.name,
      academicYear: classData.academicYear,
      description: classData.description,
      createdAt: classData.createdAt,
      updatedAt: classData.updatedAt,
    };

    let buffer: Buffer;
    let filename = `Bao_Cao_${classData.name}_${type}.xlsx`;

    if (type === 'contacts') {
      buffer = await generateStudentContactExcel(classItem, studentsWithStats);
      filename = `Danh_Sach_Lien_Lac_${classData.name}.xlsx`;
    } else if (type === 'gamification') {
      buffer = await generateGamificationLeaderboardExcel(classItem, studentsWithStats);
      filename = `Bang_Xep_Hang_Thi_Dua_${classData.name}.xlsx`;
    } else if (type === 'attendance') {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const allAttendances = await prisma.attendance.findMany({
        where: { classId },
      });

      const formattedAtt = allAttendances.map((a) => ({
        id: a.id,
        studentId: a.studentId,
        classId: a.classId,
        date: a.date.toISOString(),
        status: a.status as any,
        note: a.note,
      }));

      buffer = await generateMonthlyAttendanceExcel(
        classItem,
        studentsWithStats,
        month,
        year,
        formattedAtt
      );
      filename = `Bang_Diem_Danh_Thang_${month}_${classData.name}.xlsx`;
    } else {
      buffer = await generateStudentContactExcel(classItem, studentsWithStats);
    }

    return new Response(buffer as any, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error('Error generating Excel file:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel file' },
      { status: 500 }
    );
  }
}
