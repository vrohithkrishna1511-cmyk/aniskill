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

export async function GET(req: NextRequest) {
  try {
    const session = await getSafeSession();
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get('email');
    const email = (session?.user?.email || queryEmail || 'shinobi@aniskill.local').toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const fallbackName = session?.user?.name || '';
      user = await prisma.user.create({
        data: {
          email,
          name: fallbackName,
          shinobiName: fallbackName,
          nickname: null,
          avatarUrl: session?.user?.image || undefined,
          dailyAvailableMinutes: 0,
          currentStreak: 0,
          bestStreak: 0,
          totalXp: 0,
          chakra: 0,
          rank: 'NINJA_STUDENT',
          lastActiveDate: new Date().toISOString().split('T')[0],
        },
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('API /user/profile GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSafeSession();
    const body = await req.json();
    const email = (session?.user?.email || body.email || 'shinobi@aniskill.local').toLowerCase().trim();
    const { shinobiName, nickname, dailyAvailableMinutes, rank } = body;

    const cleanShinobiName = shinobiName && shinobiName !== 'null' && shinobiName !== 'undefined' ? shinobiName.trim() : undefined;

    const updatedUser = await prisma.user.upsert({
      where: { email },
      update: {
        ...(cleanShinobiName !== undefined && { shinobiName: cleanShinobiName, name: cleanShinobiName }),
        ...(nickname !== undefined && { nickname: nickname || null }),
        ...(dailyAvailableMinutes !== undefined && { dailyAvailableMinutes: Number(dailyAvailableMinutes) }),
        ...(rank && { rank }),
        updatedAt: new Date(),
      },
      create: {
        email,
        name: cleanShinobiName || session?.user?.name || '',
        shinobiName: cleanShinobiName || session?.user?.name || '',
        nickname: nickname || null,
        dailyAvailableMinutes: Number(dailyAvailableMinutes) || 0,
        currentStreak: 0,
        bestStreak: 0,
        totalXp: 0,
        chakra: 0,
        rank: rank || 'NINJA_STUDENT',
        lastActiveDate: new Date().toISOString().split('T')[0],
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('API /user/profile POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
