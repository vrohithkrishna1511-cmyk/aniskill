import { prisma } from './prisma';

export interface UserBestTiming {
  seconds: number | null;
  formattedTime: string | null;
  source: string | null;
}

/**
 * Finds a user's authentic BEST RECORDED TIMING from database performance history.
 * Looks at RivalrySessions, StudySessions, and DailyStudyRecords.
 * Returns null if no performance timing has ever been recorded.
 */
export async function getUserBestTiming(userId: string): Promise<UserBestTiming> {
  if (!userId) return { seconds: null, formattedTime: null, source: null };

  const candidates: { seconds: number; source: string }[] = [];

  try {
    // 1. Rivalry sessions with recorded duration
    const rivalrySessions = await prisma.rivalrySession.findMany({
      where: {
        userId,
        durationSeconds: { gt: 0 },
      },
      orderBy: { durationSeconds: 'asc' },
      take: 10,
    });

    for (const s of rivalrySessions) {
      if (s.durationSeconds > 0) {
        candidates.push({ seconds: s.durationSeconds, source: 'Rivalry Arena' });
      }
    }

    // 2. Study sessions
    const studySessions = await prisma.studySession.findMany({
      where: {
        userId,
        durationSeconds: { gt: 0 },
      },
      orderBy: { durationSeconds: 'asc' },
      take: 10,
    });

    for (const s of studySessions) {
      if (s.durationSeconds > 0) {
        candidates.push({ seconds: s.durationSeconds, source: 'Training Session' });
      }
    }

    // 3. Daily study records
    const dailyRecords = await prisma.dailyStudyRecord.findMany({
      where: {
        userId,
        totalSeconds: { gt: 0 },
      },
      orderBy: { totalSeconds: 'asc' },
      take: 10,
    });

    for (const r of dailyRecords) {
      if (r.totalSeconds > 0) {
        candidates.push({ seconds: r.totalSeconds, source: 'Daily Training' });
      }
    }
  } catch (err) {
    console.error('Error fetching best timing for user:', userId, err);
  }

  if (candidates.length === 0) {
    return { seconds: null, formattedTime: null, source: null };
  }

  // Sort ascending (fastest / lowest valid time is best)
  candidates.sort((a, b) => a.seconds - b.seconds);
  const best = candidates[0];
  const m = Math.floor(best.seconds / 60).toString().padStart(2, '0');
  const s = (best.seconds % 60).toString().padStart(2, '0');

  return {
    seconds: best.seconds,
    formattedTime: `${m}:${s}`,
    source: best.source,
  };
}
