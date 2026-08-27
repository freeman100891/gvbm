import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AttendanceStatus } from '@/types';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const { searchParams } = new URL(req.url);
    const dateQuery = searchParams.get('date');

    let whereClause: any = { classId };

    if (dateQuery) {
      const startOfDay = new Date(dateQuery);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateQuery);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
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
    const { date, records } = body as {
      date: string; // YYYY-MM-DD
      records: { studentId: string; status: AttendanceStatus; note?: string }[];
    };

    if (!date || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Date and records array are required' },
        { status: 400 }
      );
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(8, 0, 0, 0);

    // Upsert each record
    const results = await Promise.all(
      records.map(async (record) => {
        return prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: record.studentId,
              date: attendanceDate,
            },
          },
          update: {
            status: record.status,
            note: record.note || null,
          },
          create: {
            studentId: record.studentId,
            classId,
            date: attendanceDate,
            status: record.status,
            note: record.note || null,
          },
        });
      })
    );

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error('Error saving batch attendance:', error);
    return NextResponse.json(
      { error: 'Failed to save attendance' },
      { status: 500 }
    );
  }
}
