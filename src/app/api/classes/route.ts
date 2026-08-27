import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_RANK_CONFIGS } from '@/lib/gamification-engine';
import { StudentRank } from '@/types';

export async function GET() {
  try {
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
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
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
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}
