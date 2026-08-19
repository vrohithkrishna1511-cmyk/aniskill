import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomCode, subjectName = 'Python', email = 'shinobi@aniskill.local' } = body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const room = await prisma.rivalryRoom.findUnique({
      where: { roomCode: roomCode.trim().toUpperCase() },
      include: { creator: true, opponent: true },
    });

    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    // Update room subject
    await prisma.rivalryRoom.update({
      where: { id: room.id },
      data: { subjectName },
    });

    // Fetch syllabus TodoItems for this user for the selected subject
    const userSubject = await prisma.subject.findFirst({
      where: { userId: user.id, title: { contains: subjectName } },
      include: {
        courses: { include: { todoItems: true } },
      },
    });

    const allTodoItems = userSubject
      ? userSubject.courses.flatMap((c) => c.todoItems)
      : [
          { title: `${subjectName} - Foundational Logic`, difficulty: 'BASIC' },
          { title: `${subjectName} - Operations & Expressions`, difficulty: 'BASIC' },
          { title: `${subjectName} - Dynamic Data Handling`, difficulty: 'INTERMEDIATE' },
          { title: `${subjectName} - Modular Architecture`, difficulty: 'TOUGH' },
        ];

    // Allocate equal competitive workload of 4 TodoItems for both users
    const targetCount = 4;
    const completedCount = allTodoItems.filter((t: any) => t.status === 'COMPLETED').length;
    const uncompletedItems = allTodoItems.filter((t: any) => t.status !== 'COMPLETED');

    const allocatedItems = uncompletedItems.slice(0, targetCount).map((t: any) => t.title);

    // Fallback if not enough uncompleted items exist
    while (allocatedItems.length < targetCount) {
      allocatedItems.push(`${subjectName} - Challenge Item #${allocatedItems.length + 1}`);
    }

    return NextResponse.json({
      success: true,
      subjectName,
      targetCount,
      completedPriorCount: completedCount,
      allocatedItems,
      allocatedTopics: allocatedItems,
    });
  } catch (error: any) {
    console.error('API /rivalry/sync error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
