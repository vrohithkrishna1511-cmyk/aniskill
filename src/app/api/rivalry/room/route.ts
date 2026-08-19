import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserBestTiming } from '@/lib/rivalry';

async function enrichRoomWithBestTimings(room: any) {
  if (!room) return null;

  const creatorBest = room.creatorId ? await getUserBestTiming(room.creatorId) : null;
  const opponentBest = room.opponentId ? await getUserBestTiming(room.opponentId) : null;

  const creatorPresence = 'PRESENT'; // The active caller in session
  const opponentPresence = room.opponentId && room.status === 'ACTIVE' && room.sessions?.some((s: any) => s.userId === room.opponentId && s.status === 'TRAINING') 
    ? 'PRESENT' 
    : 'ABSENT';

  const modeType = opponentPresence === 'PRESENT' ? 'NORMAL' : 'SUBSTITUTE_CHALLENGE';

  return {
    ...room,
    creatorPresence,
    opponentPresence,
    creatorBestTiming: creatorBest,
    opponentBestTiming: opponentBest,
    modeType,
    substituteTarget: opponentPresence === 'ABSENT' ? 'OPPONENT' : null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'CREATE', email = 'shinobi@aniskill.local', roomCode, mode = '1 HOUR', subjectName = 'Python' } = body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (action === 'CREATE') {
      // Generate unique 6-character room code (e.g. AK-7X92)
      const generatedCode = `AK-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const room = await prisma.rivalryRoom.create({
        data: {
          roomCode: generatedCode,
          creatorId: user.id,
          subjectName,
          mode,
          status: 'WAITING',
        },
        include: {
          creator: { select: { id: true, name: true, shinobiName: true, avatarUrl: true } },
          sessions: true,
        },
      });

      const enriched = await enrichRoomWithBestTimings(room);
      return NextResponse.json({ success: true, room: enriched });
    }

    if (action === 'JOIN') {
      if (!roomCode) {
        return NextResponse.json({ success: false, error: 'Room code required' }, { status: 400 });
      }

      const room = await prisma.rivalryRoom.findUnique({
        where: { roomCode: roomCode.trim().toUpperCase() },
        include: {
          creator: { select: { id: true, name: true, shinobiName: true, avatarUrl: true } },
          opponent: { select: { id: true, name: true, shinobiName: true, avatarUrl: true } },
          sessions: true,
        },
      });

      if (!room) {
        return NextResponse.json({ success: false, error: 'Invalid Rivalry Room code' }, { status: 404 });
      }

      // Allow rejoin if user is creator or existing opponent
      if (room.creatorId === user.id || room.opponentId === user.id) {
        const enriched = await enrichRoomWithBestTimings(room);
        return NextResponse.json({ success: true, room: enriched });
      }

      // Max 2 players rule
      if (room.opponentId && room.opponentId !== user.id) {
        return NextResponse.json({ success: false, error: 'RIVALRY ROOM FULL (Maximum 2 Shinobi allowed)' }, { status: 400 });
      }

      const updatedRoom = await prisma.rivalryRoom.update({
        where: { id: room.id },
        data: {
          opponentId: user.id,
          status: 'ACTIVE',
          startedAt: new Date(),
        },
        include: {
          creator: { select: { id: true, name: true, shinobiName: true, avatarUrl: true } },
          opponent: { select: { id: true, name: true, shinobiName: true, avatarUrl: true } },
          sessions: true,
        },
      });

      const enriched = await enrichRoomWithBestTimings(updatedRoom);
      return NextResponse.json({ success: true, room: enriched });
    }

    if (action === 'START_SOLO' || action === 'START_SUBSTITUTE') {
      if (!roomCode) {
        return NextResponse.json({ success: false, error: 'Room code required' }, { status: 400 });
      }

      const room = await prisma.rivalryRoom.update({
        where: { roomCode: roomCode.trim().toUpperCase() },
        data: {
          status: 'ACTIVE',
          startedAt: new Date(),
        },
        include: {
          creator: { select: { id: true, name: true, shinobiName: true, avatarUrl: true } },
          opponent: { select: { id: true, name: true, shinobiName: true, avatarUrl: true } },
          sessions: true,
        },
      });

      const enriched = await enrichRoomWithBestTimings(room);
      return NextResponse.json({ success: true, room: enriched, isSubstituteChallenge: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('API /rivalry/room error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomCode = searchParams.get('roomCode');
    const email = searchParams.get('email') || 'shinobi@aniskill.local';

    if (!roomCode) {
      const user = await prisma.user.findUnique({ where: { email } });
      const userBest = user ? await getUserBestTiming(user.id) : null;
      return NextResponse.json({ success: true, userBestTiming: userBest });
    }

    const room = await prisma.rivalryRoom.findUnique({
      where: { roomCode: roomCode.trim().toUpperCase() },
      include: {
        creator: { select: { id: true, name: true, shinobiName: true, avatarUrl: true } },
        opponent: { select: { id: true, name: true, shinobiName: true, avatarUrl: true } },
        sessions: true,
      },
    });

    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    const enriched = await enrichRoomWithBestTimings(room);
    return NextResponse.json({ success: true, room: enriched });
  } catch (error: any) {
    console.error('API /rivalry/room GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
