import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const body = await req.json();
    const { students } = body as {
      students: {
        fullName: string;
        parentName?: string | null;
        parentPhone?: string | null;
        notes?: string | null;
      }[];
    };

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { error: 'No students provided for import' },
        { status: 400 }
      );
    }

    // Verify class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Batch insert students
    const createdStudents = await Promise.all(
      students.map(async (s) => {
        return prisma.student.create({
          data: {
            classId,
            fullName: s.fullName.trim(),
            parentName: s.parentName ? s.parentName.trim() : null,
            parentPhone: s.parentPhone ? s.parentPhone.trim() : null,
            notes: s.notes ? s.notes.trim() : null,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      count: createdStudents.length,
    });
  } catch (error) {
    console.error('Error importing students from Excel:', error);
    return NextResponse.json(
      { error: 'Failed to import students' },
      { status: 500 }
    );
  }
}
