import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetOption = '2 Months', customDays, email = 'shinobi@aniskill.local' } = body;

    let targetDays = 60; // default 2 months
    if (targetOption === '1 Month') targetDays = 30;
    if (targetOption === '2 Months') targetDays = 60;
    if (targetOption === '3 Months') targetDays = 90;
    if (targetOption === 'Custom' && customDays) targetDays = Number(customDays);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const dbSubjects = await prisma.subject.findMany({
      where: { userId: user.id },
      include: {
        courses: {
          include: {
            todoItems: true,
          },
        },
      },
    });

    let totalTodoItems = 0;
    let completedTodoItems = 0;
    let totalEstimatedMinutes = 0;

    dbSubjects.forEach((sub) => {
      sub.courses.forEach((course) => {
        course.todoItems.forEach((item) => {
          totalTodoItems++;
          if (item.status === 'COMPLETED') completedTodoItems++;
          else totalEstimatedMinutes += item.estimatedMinutes;
        });
      });
    });

    const remainingTodoItems = totalTodoItems - completedTodoItems;
    const dailyTargetMinutes = Math.max(60, Math.ceil(totalEstimatedMinutes / Math.max(1, targetDays)));

    return NextResponse.json({
      success: true,
      plan: {
        targetOption,
        targetDays,
        totalTodoItems,
        completedTodoItems,
        remainingTodoItems,
        totalEstimatedMinutes,
        dailyTargetMinutes,
        availableStudyMinutes: user.dailyAvailableMinutes,
        recommendedItemsPerDay: Math.ceil(remainingTodoItems / Math.max(1, targetDays)),
        totalTopics: totalTodoItems,
        completedTopics: completedTodoItems,
        remainingTopics: remainingTodoItems,
      },
    });
  } catch (error: any) {
    console.error('API /syllabus/plan error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
