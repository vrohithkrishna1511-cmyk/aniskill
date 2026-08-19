import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getSafeSession() {
  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSafeSession();
    const body = await req.json();
    const {
      action = 'START',
      sessionId,
      durationSeconds = 0,
      itemsCovered = [],
      topicsCovered = []
    } = body;
    const email = (session?.user?.email || body.email || 'shinobi@aniskill.local').toLowerCase().trim();
    const coveredList: string[] = itemsCovered.length > 0 ? itemsCovered : topicsCovered;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: session?.user?.name || '',
          shinobiName: session?.user?.name || '',
        },
      });
    }

    if (action === 'START') {
      const studySession = await prisma.studySession.create({
        data: {
          userId: user.id,
          startedAt: new Date(),
          status: 'IN_PROGRESS',
          itemsCovered: JSON.stringify(coveredList),
        },
      });
      return NextResponse.json({ success: true, session: studySession });
    }

    if (action === 'END_TRAINING') {
      const minutesSpentPerTopic = coveredList.length > 0
        ? Math.max(1, Math.round(Number(durationSeconds) / 60 / coveredList.length))
        : 15;

      let studySession = null;
      if (sessionId) {
        try {
          studySession = await prisma.studySession.update({
            where: { id: sessionId },
            data: {
              stoppedAt: new Date(),
              durationSeconds: Number(durationSeconds),
              status: 'COMPLETED',
              itemsCovered: JSON.stringify(coveredList),
            },
          });
        } catch (e) {
          // Fallback if session wasn't created prior
          studySession = await prisma.studySession.create({
            data: {
              id: sessionId,
              userId: user.id,
              startedAt: new Date(Date.now() - Math.max(60, Number(durationSeconds)) * 1000),
              stoppedAt: new Date(),
              durationSeconds: Number(durationSeconds),
              status: 'COMPLETED',
              itemsCovered: JSON.stringify(coveredList),
            },
          });
        }
      } else {
        studySession = await prisma.studySession.create({
          data: {
            userId: user.id,
            startedAt: new Date(Date.now() - Math.max(60, Number(durationSeconds)) * 1000),
            stoppedAt: new Date(),
            durationSeconds: Number(durationSeconds),
            status: 'COMPLETED',
            itemsCovered: JSON.stringify(coveredList),
          },
        });
      }

      for (const itemRef of coveredList) {
        // Match by ID or by title for the current user
        const item = await prisma.todoItem.findFirst({
          where: {
            OR: [
              { id: itemRef, course: { subject: { userId: user.id } } },
              { title: itemRef, course: { subject: { userId: user.id } } },
              { normalizedTitle: itemRef, course: { subject: { userId: user.id } } }
            ]
          }
        });

        if (item) {
          const newActual = item.actualMinutes + minutesSpentPerTopic;
          const newAttempts = item.attemptCount + 1;

          await prisma.todoItem.update({
            where: { id: item.id },
            data: {
              actualMinutes: newActual,
              attemptCount: newAttempts,
              status: 'COMPLETED',
              completedAt: item.completedAt || new Date(),
              lastStudiedAt: new Date(),
              progress: 1.0,
            }
          });
        }
      }

      // Minimum 1 hour (3600 seconds) required for valid study day requirement
      const isValidDuration = Number(durationSeconds) >= 3600;

      return NextResponse.json({
        success: true,
        session,
        isValidDuration,
        message: isValidDuration
          ? 'Minimum 1-hour study requirement satisfied! Proceed to daily AI quiz.'
          : 'Study session recorded. Note: Minimum 1 hour study required to complete daily streak.',
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('API /study/session error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
