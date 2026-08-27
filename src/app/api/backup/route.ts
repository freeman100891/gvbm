import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        students: true,
        attendances: true,
        evaluations: true,
        rankConfigs: true,
      },
    });

    const pointLogs = await prisma.pointLog.findMany();
    const meetingNotes = await prisma.meetingNote.findMany();

    const snapshot = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      appName: 'GVBM Platform',
      data: {
        classes,
        pointLogs,
        meetingNotes,
      },
    };

    return new Response(JSON.stringify(snapshot, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="GVBM_Backup_${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Backup export error:', error);
    return NextResponse.json(
      { error: 'Failed to create backup export' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data } = body;

    if (!data || !data.classes) {
      return NextResponse.json(
        { error: 'Invalid backup file format' },
        { status: 400 }
      );
    }

    // Clean existing
    await prisma.pointLog.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.evaluation.deleteMany();
    await prisma.rankConfig.deleteMany();
    await prisma.student.deleteMany();
    await prisma.class.deleteMany();
    await prisma.meetingNote.deleteMany();

    // Restore classes and child entities
    for (const c of data.classes) {
      const createdClass = await prisma.class.create({
        data: {
          id: c.id,
          name: c.name,
          academicYear: c.academicYear,
          description: c.description || null,
        },
      });

      if (c.rankConfigs && Array.isArray(c.rankConfigs)) {
        await prisma.rankConfig.createMany({
          data: c.rankConfigs.map((rc: any) => ({
            classId: createdClass.id,
            rank: rc.rank,
            displayName: rc.displayName,
            avatarType: rc.avatarType,
            avatarValue: rc.avatarValue,
            frameColor: rc.frameColor,
            minPoints: rc.minPoints,
          })),
        });
      }

      if (c.students && Array.isArray(c.students)) {
        for (const s of c.students) {
          await prisma.student.create({
            data: {
              id: s.id,
              classId: createdClass.id,
              fullName: s.fullName,
              avatar: s.avatar || null,
              parentName: s.parentName || null,
              parentPhone: s.parentPhone || null,
              notes: s.notes || null,
            },
          });
        }
      }

      if (c.attendances && Array.isArray(c.attendances)) {
        for (const att of c.attendances) {
          await prisma.attendance.create({
            data: {
              id: att.id,
              studentId: att.studentId,
              classId: createdClass.id,
              date: new Date(att.date),
              status: att.status,
              note: att.note || null,
            },
          });
        }
      }

      if (c.evaluations && Array.isArray(c.evaluations)) {
        for (const ev of c.evaluations) {
          await prisma.evaluation.create({
            data: {
              id: ev.id,
              studentId: ev.studentId,
              classId: createdClass.id,
              period: ev.period,
              vocabulary: ev.vocabulary || null,
              grammar: ev.grammar || null,
              speaking: ev.speaking || null,
              attitude: ev.attitude || null,
              generalComment: ev.generalComment,
            },
          });
        }
      }
    }

    if (data.pointLogs && Array.isArray(data.pointLogs)) {
      for (const pl of data.pointLogs) {
        await prisma.pointLog.create({
          data: {
            id: pl.id,
            studentId: pl.studentId,
            pointsChanged: pl.pointsChanged,
            reason: pl.reason,
            createdAt: new Date(pl.createdAt),
          },
        });
      }
    }

    if (data.meetingNotes && Array.isArray(data.meetingNotes)) {
      for (const mn of data.meetingNotes) {
        await prisma.meetingNote.create({
          data: {
            id: mn.id,
            title: mn.title,
            category: mn.category,
            meetingDate: new Date(mn.meetingDate),
            location: mn.location || null,
            attendees: mn.attendees || null,
            content: mn.content,
            actionItems: mn.actionItems || null,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Restore backup error:', error);
    return NextResponse.json(
      { error: 'Failed to restore database from backup' },
      { status: 500 }
    );
  }
}
