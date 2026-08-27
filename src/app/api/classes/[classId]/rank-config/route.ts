import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RankConfigItem } from '@/types';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const configs = await prisma.rankConfig.findMany({
      where: { classId },
    });
    return NextResponse.json(configs);
  } catch (error) {
    console.error('Error fetching rank configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rank configs' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const body = await req.json();
    const { configs } = body as { configs: RankConfigItem[] };

    if (!configs || !Array.isArray(configs)) {
      return NextResponse.json(
        { error: 'Configs array is required' },
        { status: 400 }
      );
    }

    const updated = await Promise.all(
      configs.map(async (c) => {
        return prisma.rankConfig.upsert({
          where: {
            classId_rank: {
              classId,
              rank: c.rank as any,
            },
          },
          update: {
            displayName: c.displayName,
            avatarType: c.avatarType,
            avatarValue: c.avatarValue,
            frameColor: c.frameColor,
            minPoints: Number(c.minPoints),
          },
          create: {
            classId,
            rank: c.rank as any,
            displayName: c.displayName,
            avatarType: c.avatarType,
            avatarValue: c.avatarValue,
            frameColor: c.frameColor,
            minPoints: Number(c.minPoints),
          },
        });
      })
    );

    return NextResponse.json({ success: true, configs: updated });
  } catch (error) {
    console.error('Error updating rank configs:', error);
    return NextResponse.json(
      { error: 'Failed to update rank configs' },
      { status: 500 }
    );
  }
}
