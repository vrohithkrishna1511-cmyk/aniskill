import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserBestTiming } from '@/lib/rivalry';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'START', roomCode, email = 'shinobi@aniskill.local', durationSeconds = 0, completedItems = [], completedTopics = [] } = body;
    const itemList = completedItems.length > 0 ? completedItems : completedTopics;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const room = await prisma.rivalryRoom.findUnique({
      where: { roomCode: roomCode.trim().toUpperCase() },
      include: { sessions: true },
    });

    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    if (action === 'START') {
      let session = room.sessions.find((s) => s.userId === user.id);
      if (!session) {
        session = await prisma.rivalrySession.create({
          data: {
            roomId: room.id,
            userId: user.id,
            startedAt: new Date(),
            status: 'TRAINING',
            assignedItems: JSON.stringify(itemList),
            completedItems: JSON.stringify([]),
          },
        });
      }
      return NextResponse.json({ success: true, session });
    }

    if (action === 'STOP' || action === 'FORFEIT') {
      let session = room.sessions.find((s) => s.userId === user.id);
      const newStatus = action === 'FORFEIT' ? 'FORFEITED' : 'STOPPED';
      const actualDuration = Number(durationSeconds);

      if (session) {
        session = await prisma.rivalrySession.update({
          where: { id: session.id },
          data: {
            stoppedAt: new Date(),
            durationSeconds: actualDuration,
            status: newStatus,
            completedItems: JSON.stringify(itemList),
          },
        });
      } else {
        session = await prisma.rivalrySession.create({
          data: {
            roomId: room.id,
            userId: user.id,
            startedAt: new Date(),
            stoppedAt: new Date(),
            durationSeconds: actualDuration,
            status: newStatus,
            assignedItems: JSON.stringify([]),
            completedItems: JSON.stringify(itemList),
          },
        });
      }

      // Check if both players have active sessions, or if running in Substitute Challenge mode
      const allSessions = await prisma.rivalrySession.findMany({
        where: { roomId: room.id },
      });

      const absentOpponentId = user.id === room.creatorId ? room.opponentId : room.creatorId;
      const hasActiveOpponentSession = allSessions.some((s) => s.userId === absentOpponentId && s.status === 'TRAINING');
      
      const isSubstituteMode = !absentOpponentId || !hasActiveOpponentSession;
      const isBothFinished = isSubstituteMode || (allSessions.length >= 2 && allSessions.every((s) => s.status !== 'TRAINING'));

      let winnerId: string | null = null;
      let comparisonData: any = null;
      let outcomeMessage = '';

      if (isSubstituteMode && newStatus !== 'FORFEITED') {
        // Substitute Challenge Mode: Compare active player current time vs absent player best time
        const absentBest = absentOpponentId ? await getUserBestTiming(absentOpponentId) : { seconds: null, formattedTime: null, source: null };
        const activeM = Math.floor(actualDuration / 60).toString().padStart(2, '0');
        const activeS = (actualDuration % 60).toString().padStart(2, '0');
        const activeFormatted = `${activeM}:${activeS}`;

        if (absentBest.seconds !== null && absentBest.seconds > 0) {
          // Compare times (faster / lower seconds wins)
          if (actualDuration <= absentBest.seconds) {
            winnerId = user.id;
            outcomeMessage = `🏆 YOUR TIME (${activeFormatted}) DEFEATED THEIR BEST RECORD (${absentBest.formattedTime})!`;
          } else {
            winnerId = absentOpponentId;
            outcomeMessage = `ABSENT SHINOBI'S BEST RECORD (${absentBest.formattedTime}) DEFENDED AGAINST YOUR TIME (${activeFormatted}).`;
          }
        } else {
          // Absent player has no recorded best time
          winnerId = user.id;
          outcomeMessage = `🏆 ACTIVE SHINOBI WINS: Opponent has no prior recorded time. Benchmark established at ${activeFormatted}!`;
        }

        comparisonData = {
          mode: 'SUBSTITUTE_CHALLENGE',
          activePlayer: {
            id: user.id,
            name: user.shinobiName || user.name,
            durationSeconds: actualDuration,
            formattedTime: activeFormatted,
          },
          absentPlayer: {
            id: absentOpponentId || null,
            bestTimeSeconds: absentBest.seconds,
            formattedTime: absentBest.formattedTime || 'NO BEST TIME RECORDED',
          },
          winnerId,
          outcomeMessage,
        };

        await prisma.rivalryRoom.update({
          where: { id: room.id },
          data: {
            status: 'COMPLETED',
            endedAt: new Date(),
            winnerId,
          },
        });
      } else if (isBothFinished) {
        // Normal 2-player live rivalry
        const s1 = allSessions.find((s) => s.userId === room.creatorId) || allSessions[0];
        const s2 = allSessions.find((s) => s.userId === room.opponentId) || allSessions[1];

        if (s1 && s2) {
          if (s1.status === 'FORFEITED' && s2.status !== 'FORFEITED') {
            winnerId = s2.userId;
            outcomeMessage = 'Opponent forfeited. Victory achieved!';
          } else if (s2.status === 'FORFEITED' && s1.status !== 'FORFEITED') {
            winnerId = s1.userId;
            outcomeMessage = 'Opponent forfeited. Victory achieved!';
          } else {
            const c1 = JSON.parse(s1.completedItems || '[]').length;
            const c2 = JSON.parse(s2.completedItems || '[]').length;
            if (c1 > c2) winnerId = s1.userId;
            else if (c2 > c1) winnerId = s2.userId;
            else {
              // Faster duration wins
              winnerId = s1.durationSeconds <= s2.durationSeconds ? s1.userId : s2.userId;
            }
            outcomeMessage = 'Normal Rivalry Complete! Both live sessions concluded.';
          }
        } else {
          winnerId = user.id;
          outcomeMessage = 'Solo Training Complete!';
        }

        await prisma.rivalryRoom.update({
          where: { id: room.id },
          data: {
            status: 'COMPLETED',
            endedAt: new Date(),
            winnerId,
          },
        });
      }

      return NextResponse.json({
        success: true,
        session,
        isBothFinished,
        isSubstituteMode,
        comparisonData,
        winnerId,
        message: isBothFinished
          ? (outcomeMessage || 'Rivalry Complete! Results revealed.')
          : 'Your session stopped. Waiting for opponent to finish training...',
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('API /rivalry/session error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
