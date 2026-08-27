import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SyncMutation } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mutations } = body as { mutations: SyncMutation[] };

    if (!mutations || !Array.isArray(mutations)) {
      return NextResponse.json(
        { error: 'Mutations array is required' },
        { status: 400 }
      );
    }

    let processedCount = 0;

    for (const item of mutations) {
      const { table, action, payload } = item;

      try {
        if (table === 'pointLogs' && action === 'CREATE') {
          // Append-only conflict resolution
          await prisma.pointLog.create({
            data: {
              studentId: payload.studentId,
              pointsChanged: Number(payload.pointsChanged),
              reason: payload.reason,
              createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
            },
          });
          processedCount++;
        } else if (table === 'attendances' && action === 'BATCH_ATTENDANCE') {
          // Last-Write-Wins conflict resolution
          const { classId, date, records } = payload;
          const attendanceDate = new Date(date);
          attendanceDate.setHours(8, 0, 0, 0);

          if (Array.isArray(records)) {
            await Promise.all(
              records.map((r: any) =>
                prisma.attendance.upsert({
                  where: {
                    studentId_date: {
                      studentId: r.studentId,
                      date: attendanceDate,
                    },
                  },
                  update: {
                    status: r.status,
                    note: r.note || null,
                  },
                  create: {
                    studentId: r.studentId,
                    classId,
                    date: attendanceDate,
                    status: r.status,
                    note: r.note || null,
                  },
                })
              )
            );
          }
          processedCount++;
        } else if (table === 'evaluations' && (action === 'CREATE' || action === 'UPDATE')) {
          const { studentId, classId, period, vocabulary, grammar, speaking, attitude, generalComment } = payload;
          const existing = await prisma.evaluation.findFirst({
            where: { studentId, period },
          });

          if (existing) {
            await prisma.evaluation.update({
              where: { id: existing.id },
              data: { vocabulary, grammar, speaking, attitude, generalComment },
            });
          } else {
            await prisma.evaluation.create({
              data: { studentId, classId, period, vocabulary, grammar, speaking, attitude, generalComment },
            });
          }
          processedCount++;
        } else if (table === 'meetingNotes' && action === 'CREATE') {
          await prisma.meetingNote.create({
            data: {
              title: payload.title,
              category: payload.category || 'DEPARTMENT',
              meetingDate: payload.meetingDate ? new Date(payload.meetingDate) : new Date(),
              location: payload.location || null,
              attendees: payload.attendees || null,
              content: payload.content,
              actionItems: payload.actionItems || null,
            },
          });
          processedCount++;
        }
      } catch (mutationError) {
        console.warn(`Failed to process mutation for table ${table}:`, mutationError);
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
    });
  } catch (error) {
    console.error('Offline sync processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process offline mutations' },
      { status: 500 }
    );
  }
}
