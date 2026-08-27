import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MeetingCategory } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as MeetingCategory | null;
    const search = searchParams.get('search');

    let whereClause: any = {};
    if (category && category !== ('ALL' as any)) {
      whereClause.category = category;
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const notes = await prisma.meetingNote.findMany({
      where: whereClause,
      orderBy: { meetingDate: 'desc' },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching meeting notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting notes' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      category,
      meetingDate,
      location,
      attendees,
      content,
      actionItems,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const note = await prisma.meetingNote.create({
      data: {
        title: title.trim(),
        category: category || 'DEPARTMENT',
        meetingDate: meetingDate ? new Date(meetingDate) : new Date(),
        location: location ? location.trim() : null,
        attendees: attendees ? attendees.trim() : null,
        content: content.trim(),
        actionItems: actionItems ? (typeof actionItems === 'string' ? actionItems : JSON.stringify(actionItems)) : null,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating meeting note:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting note' },
      { status: 500 }
    );
  }
}
