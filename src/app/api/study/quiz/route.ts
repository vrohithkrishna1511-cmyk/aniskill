import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDailyQuiz } from '@/lib/ai/gemini';
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
    const { action = 'GENERATE', studiedItems = [], studiedTopics = [], answers = [], questions = [], durationSeconds = 3600 } = body;
    const email = (session?.user?.email || body.email || 'shinobi@aniskill.local').toLowerCase().trim();
    const itemList: string[] = studiedItems.length > 0 ? studiedItems : studiedTopics;

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

    if (action === 'GENERATE') {
      const generatedQuestions = await generateDailyQuiz(itemList);
      return NextResponse.json({ success: true, questions: generatedQuestions });
    }

    if (action === 'EVALUATE') {
      const { subjectId, sessionId } = body;
      const todayDate = new Date().toISOString().split('T')[0];
      const QUIZ_PASS_THRESHOLD = 60; // 60% pass threshold (3/5 questions correct)

      // 1. Check existing attempts for this user & subject today
      const previousAttempts = await prisma.quizAttempt.findMany({
        where: {
          userId: user.id,
          date: todayDate,
          ...(subjectId ? { subjectId } : {}),
        },
        orderBy: { createdAt: 'asc' },
      });

      const attemptNumber = previousAttempts.length + 1;
      if (attemptNumber > 5) {
        return NextResponse.json({
          success: false,
          error: 'Maximum limit of 5 quiz attempts reached for this subject session today.',
        }, { status: 400 });
      }

      // 2. Calculate score
      let correctCount = 0;
      questions.forEach((q: any, idx: number) => {
        if (answers[idx] !== undefined && Number(answers[idx]) === q.correctIndex) {
          correctCount++;
        }
      });

      const totalQuestions = questions.length || 5;
      const scorePercent = Math.round((correctCount / totalQuestions) * 100);
      const confidenceScore = Math.min(100, Math.round(scorePercent * 0.9 + 10));
      const passed = scorePercent >= QUIZ_PASS_THRESHOLD;
      const attemptsRemaining = Math.max(0, 5 - attemptNumber);

      // 3. Save Quiz Attempt
      const quizAttempt = await prisma.quizAttempt.create({
        data: {
          userId: user.id,
          subjectId: subjectId || undefined,
          sessionId: sessionId || undefined,
          date: todayDate,
          attemptNumber,
          questions: JSON.stringify(questions),
          answers: JSON.stringify(answers),
          score: scorePercent,
          confidence: confidenceScore,
          passed,
        },
      });

      // 4. Update TodoItem records completed in database for this user
      for (const itemRef of itemList) {
        await prisma.todoItem.updateMany({
          where: {
            OR: [
              { id: itemRef, course: { subject: { userId: user.id } } },
              { title: itemRef, course: { subject: { userId: user.id } } },
              { normalizedTitle: itemRef, course: { subject: { userId: user.id } } }
            ]
          },
          data: {
            status: 'COMPLETED',
            quizScore: scorePercent,
            knowledgeConfidence: confidenceScore,
            completedAt: new Date(),
            lastStudiedAt: new Date(),
            progress: 1.0,
          },
        });
      }

      let subjectStreakUpdated = false;
      let subjectStreakBroken = false;
      let newSubjectStreak = 0;

      // 5. Subject-Specific Streak Logic
      if (subjectId) {
        const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
        if (subject) {
          if (passed) {
            newSubjectStreak = subject.currentStreak + 1;
            await prisma.subject.update({
              where: { id: subjectId },
              data: {
                currentStreak: newSubjectStreak,
                bestStreak: Math.max(subject.bestStreak, newSubjectStreak),
              },
            });
            subjectStreakUpdated = true;
          } else if (!passed && attemptNumber === 5) {
            // All 5 attempts failed for THIS subject -> reset ONLY this subject's streak!
            await prisma.subject.update({
              where: { id: subjectId },
              data: { currentStreak: 0 },
            });
            subjectStreakBroken = true;
            newSubjectStreak = 0;
          } else {
            newSubjectStreak = subject.currentStreak;
          }
        }
      }

      // 6. Global Calendar Attendance Record (increment overall user streak once per calendar date)
      let newStreak = user.currentStreak;

      if (passed) {
        const existingRecord = await prisma.dailyStudyRecord.findUnique({
          where: { userId_date: { userId: user.id, date: todayDate } },
        });

        if (!existingRecord || !existingRecord.isCompleted) {
          newStreak = user.currentStreak + 1;
        }

        await prisma.dailyStudyRecord.upsert({
          where: { userId_date: { userId: user.id, date: todayDate } },
          update: {
            totalSeconds: { increment: durationSeconds },
            isCompleted: true,
            quizScore: scorePercent,
            streakCount: newStreak,
          },
          create: {
            userId: user.id,
            date: todayDate,
            totalSeconds: durationSeconds,
            isCompleted: true,
            quizScore: scorePercent,
            streakCount: newStreak,
          },
        });

        const xpEarned = 150 + Math.round((scorePercent / 100) * 150);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            currentStreak: newStreak,
            bestStreak: Math.max(user.bestStreak, newStreak),
            totalXp: { increment: xpEarned },
            chakra: Math.min(100, user.chakra + 20),
            lastActiveDate: todayDate,
          },
        });
      }

      return NextResponse.json({
        success: true,
        passed,
        scorePercent,
        confidenceScore,
        correctCount,
        totalQuestions,
        attemptNumber,
        attemptsRemaining,
        subjectStreakUpdated,
        subjectStreakBroken,
        newSubjectStreak,
        newStreak,
        xpEarned: passed ? 150 + Math.round((scorePercent / 100) * 150) : 0,
        quizAttempt,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('API /study/quiz error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
