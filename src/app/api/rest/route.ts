import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email = 'shinobi@aniskill.local', reason = 'Shinobi Recovery' } = body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const todayDate = new Date().toISOString().split('T')[0];

    // Check if user already took rest today or exceeded monthly limit (max 3 rest days/month)
    const currentMonth = todayDate.substring(0, 7); // YYYY-MM
    const monthlyRestCount = await prisma.shinobiRest.count({
      where: {
        userId: user.id,
        restDate: { startsWith: currentMonth },
      },
    });

    if (monthlyRestCount >= 3) {
      return NextResponse.json({
        success: false,
        error: 'Shinobi Rest limit reached (max 3 rest days per month). Train continuous chakra!',
      }, { status: 400 });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    const restRecord = await prisma.shinobiRest.create({
      data: {
        userId: user.id,
        restDate: todayDate,
        reason,
        originalMissionDate: todayDate,
        postponedMissionDate: tomorrowDate,
      },
    });

    return NextResponse.json({
      success: true,
      restRecord,
      message: `Shinobi Rest approved for ${todayDate}. Today's training postponed to ${tomorrowDate}. Streak protected!`,
    });
  } catch (error: any) {
    console.error('API /rest error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
