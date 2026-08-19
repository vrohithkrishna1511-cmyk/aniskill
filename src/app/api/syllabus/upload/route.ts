import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractSyllabusFromImages } from '@/lib/ai/gemini';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Check Gemini API Key configuration
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        isApiKeyMissing: true,
        error: 'GEMINI API KEY REQUIRED: Add GEMINI_API_KEY to your environment configuration to enable OCR.'
      }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { images = [] } = body;
    const email = (session?.user?.email || body.email || 'shinobi@aniskill.local').toLowerCase().trim();

    // Get user identity
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: '',
          shinobiName: '',
        },
      });
    }

    // Process screenshots with AI
    let extractedData;
    try {
      extractedData = await extractSyllabusFromImages(images);
    } catch (aiErr: any) {
      console.error('Gemini OCR processing error:', aiErr);
      return NextResponse.json({
        success: false,
        isAiError: true,
        error: `GEMINI OCR ERROR: ${aiErr.message || 'Failed to extract curriculum from screenshots.'}`
      }, { status: 500 });
    }

    const targetSubjectName = (extractedData.subjectName || 'New Subject').trim();
    const coursesToCreate = extractedData.courses || extractedData.units || [];

    // Check if user already owns a subject with this title (Deduplication)
    const allUserSubjects = await prisma.subject.findMany({
      where: { userId: user.id }
    });

    const existingSubject = allUserSubjects.find(
      (s: any) => s.title.toLowerCase().trim() === targetSubjectName.toLowerCase()
    );

    let resultSubject;

    if (existingSubject) {
      // Append new courses to existing subject
      for (let cIdx = 0; cIdx < coursesToCreate.length; cIdx++) {
        const courseObj = coursesToCreate[cIdx] as any;
        const rawItems = courseObj.todoItems || courseObj.topics || [];
        
        await prisma.course.create({
          data: {
            subjectId: existingSubject.id,
            title: courseObj.title,
            order: cIdx,
            todoItems: {
              create: rawItems.map((item: any, iIdx: number) => ({
                title: item.title,
                normalizedTitle: item.normalizedTitle || item.title,
                description: item.description || '',
                difficulty: item.difficulty || 'MEDIUM',
                estimatedMinutes: item.estimatedMinutes || item.targetMinutes || 20,
                estimatedMinMinutes: item.estimatedMinMinutes || 15,
                estimatedMaxMinutes: item.estimatedMaxMinutes || 30,
                targetMinutes: item.targetMinutes || item.estimatedMinutes || 20,
                actualMinutes: 0,
                attemptCount: 0,
                order: iIdx,
                status: 'NOT_STARTED',
              })),
            },
          },
        });
      }

      resultSubject = await prisma.subject.findUnique({
        where: { id: existingSubject.id },
        include: {
          courses: {
            include: {
              todoItems: true,
            },
          },
        },
      });
    } else {
      // Enforce 10-subject maximum account limit for new subjects
      if (allUserSubjects.length >= 10) {
        return NextResponse.json({
          success: false,
          error: 'Maximum limit of 10 subjects reached for your account. Please remove an existing subject before adding a new one.'
        }, { status: 400 });
      }

      // Create new Subject with Courses & TodoItems
      resultSubject = await prisma.subject.create({
        data: {
          userId: user.id,
          title: targetSubjectName,
          icon: extractedData.icon || 'BookOpen',
          color: extractedData.color || '#FF6B00',
          currentStreak: 0,
          bestStreak: 0,
          courses: {
            create: coursesToCreate.map((course: any, cIdx: number) => {
              const rawItems = course.todoItems || course.topics || [];
              return {
                title: course.title,
                order: cIdx,
                todoItems: {
                  create: rawItems.map((item: any, iIdx: number) => ({
                    title: item.title,
                    normalizedTitle: item.normalizedTitle || item.title,
                    description: item.description || '',
                    difficulty: item.difficulty || 'MEDIUM',
                    estimatedMinutes: item.estimatedMinutes || item.targetMinutes || 20,
                    estimatedMinMinutes: item.estimatedMinMinutes || 15,
                    estimatedMaxMinutes: item.estimatedMaxMinutes || 30,
                    targetMinutes: item.targetMinutes || item.estimatedMinutes || 20,
                    actualMinutes: 0,
                    attemptCount: 0,
                    order: iIdx,
                    status: 'NOT_STARTED',
                  })),
                },
              };
            }),
          },
        },
        include: {
          courses: {
            include: {
              todoItems: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ success: true, subject: resultSubject });
  } catch (error: any) {
    console.error('API /syllabus/upload database error:', error);
    const isDbErr = Boolean(
      error.code?.startsWith?.('P') ||
      error.message?.includes('database') ||
      error.message?.includes('column') ||
      error.message?.includes('prisma')
    );

    return NextResponse.json({
      success: false,
      isDatabaseError: isDbErr,
      error: isDbErr
        ? 'SYLLABUS IMPORT ERROR: ANISKILL could not save the syllabus because of a database configuration error. Please try again.'
        : error.message
    }, { status: 500 });
  }
}
