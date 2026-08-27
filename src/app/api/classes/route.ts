import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_RANK_CONFIGS } from '@/lib/gamification-engine';
import { StudentRank } from '@/types';

async function seedDefaultClassesIfEmpty() {
  const count = await prisma.class.count();
  if (count > 0) return;

  try {
    const c1 = await prisma.class.create({
      data: {
        id: 'class-10a1-ielts',
        name: '10A1 - IELTS & Communication',
        academicYear: '2026-2027',
        description: 'Lớp chuyên sâu 4 kỹ năng & Thi đua tích điểm theo cấp bậc Dân - Vua',
      },
    });

    const c2 = await prisma.class.create({
      data: {
        id: 'class-grade9-starters',
        name: 'Grade 9B - Young Achievers',
        academicYear: '2026-2027',
        description: 'Lớp tăng cường ngữ pháp và từ vựng chuyển cấp THPT',
      },
    });

    const ranks: StudentRank[] = ['DAN', 'LINH', 'QUAN', 'VUA'];
    for (const c of [c1, c2]) {
      await prisma.rankConfig.createMany({
        data: ranks.map((r) => ({
          classId: c.id,
          rank: r,
          displayName: DEFAULT_RANK_CONFIGS[r].displayName,
          avatarType: DEFAULT_RANK_CONFIGS[r].avatarType,
          avatarValue: DEFAULT_RANK_CONFIGS[r].avatarValue,
          frameColor: DEFAULT_RANK_CONFIGS[r].frameColor,
          minPoints: DEFAULT_RANK_CONFIGS[r].minPoints,
        })),
      });
    }

    // Add initial student
    const s1 = await prisma.student.create({
      data: {
        classId: c1.id,
        fullName: 'Trần Gia Hân',
        avatar: '👑',
        parentName: 'Trần Quang Hưng',
        parentPhone: '0901234567',
        notes: 'IELTS Target 7.5, nói lưu loát',
      },
    });

    await prisma.pointLog.create({
      data: {
        studentId: s1.id,
        pointsChanged: 95,
        reason: 'Xuất sắc đạt Vua đợt thi đua 1',
      },
    });
  } catch (e) {
    console.error('Auto seed error:', e);
  }
}

export async function GET() {
  try {
    await seedDefaultClassesIfEmpty().catch(() => {});

    const classes = await prisma.class.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { students: true },
        },
      },
    });

    const formatted = classes.map((c) => ({
      ...c,
      studentCount: c._count.students,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to fetch classes',
        details: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, academicYear, description } = body;

    if (!name || !academicYear) {
      return NextResponse.json(
        { error: 'Class name and academic year are required' },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        academicYear,
        description: description || null,
      },
    });

    // Create default rank configs
    const rankConfigsData = (['DAN', 'LINH', 'QUAN', 'VUA'] as StudentRank[]).map(
      (rank) => ({
        classId: newClass.id,
        rank,
        displayName: DEFAULT_RANK_CONFIGS[rank].displayName,
        avatarType: DEFAULT_RANK_CONFIGS[rank].avatarType,
        avatarValue: DEFAULT_RANK_CONFIGS[rank].avatarValue,
        frameColor: DEFAULT_RANK_CONFIGS[rank].frameColor,
        minPoints: DEFAULT_RANK_CONFIGS[rank].minPoints,
      })
    );

    await prisma.rankConfig.createMany({
      data: rankConfigsData,
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error: any) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create class' },
      { status: 500 }
    );
  }
}
