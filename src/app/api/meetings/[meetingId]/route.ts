import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { meetingId } = await params;
    const note = await prisma.meetingNote.findUnique({
      where: { id: meetingId },
    });

    if (!note) {
      return NextResponse.json({ error: 'Meeting note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error fetching meeting note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting note' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { meetingId } = await params;
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

    const note = await prisma.meetingNote.update({
      where: { id: meetingId },
      data: {
        title: title ? title.trim() : undefined,
        category: category || undefined,
        meetingDate: meetingDate ? new Date(meetingDate) : undefined,
        location: location !== undefined ? (location ? location.trim() : null) : undefined,
        attendees: attendees !== undefined ? (attendees ? attendees.trim() : null) : undefined,
        content: content ? content.trim() : undefined,
        actionItems: actionItems !== undefined ? (typeof actionItems === 'string' ? actionItems : JSON.stringify(actionItems)) : undefined,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error updating meeting note:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting note' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { meetingId } = await params;
    await prisma.meetingNote.delete({
      where: { id: meetingId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting meeting note:', error);
    return NextResponse.json(
      { error: 'Failed to delete meeting note' },
      { status: 500 }
    );
  }
}
