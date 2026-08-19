import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper to resolve authenticated user
async function resolveUser(req: NextRequest, queryEmail?: string | null) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }
  const email = (session?.user?.email || queryEmail || 'shinobi@aniskill.local').toLowerCase().trim();

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: session?.user?.name || '',
        shinobiName: session?.user?.name || '',
        nickname: null,
        rank: 'NINJA_STUDENT',
        chakra: 0,
        totalXp: 0,
        dailyAvailableMinutes: 0,
      },
    });
  }
  return user;
}

// GET /api/syllabus/tree - Fetch all subjects, courses, and topics for the user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get('email');
    const user = await resolveUser(req, queryEmail);

    const dbSubjects = await prisma.subject.findMany({
      where: { userId: user.id },
      include: {
        courses: {
          include: {
            todoItems: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    const subjects = dbSubjects.map((s) => ({
      ...s,
      courses: s.courses.map((c) => ({
        ...c,
        todoItems: c.todoItems.map((t) => ({
          ...t,
          completed: t.status === 'COMPLETED',
          requiredMinutes: t.estimatedMinutes || t.targetMinutes || 20,
          completionDate: t.completedAt ? t.completedAt.toISOString() : undefined,
        })),
        topics: c.todoItems.map((t) => ({
          ...t,
          completed: t.status === 'COMPLETED',
          requiredMinutes: t.estimatedMinutes || t.targetMinutes || 20,
          completionDate: t.completedAt ? t.completedAt.toISOString() : undefined,
        })),
      })),
      chapters: s.courses.map((c) => ({
        ...c,
        todoItems: c.todoItems.map((t) => ({
          ...t,
          completed: t.status === 'COMPLETED',
          requiredMinutes: t.estimatedMinutes || t.targetMinutes || 20,
          completionDate: t.completedAt ? t.completedAt.toISOString() : undefined,
        })),
        topics: c.todoItems.map((t) => ({
          ...t,
          completed: t.status === 'COMPLETED',
          requiredMinutes: t.estimatedMinutes || t.targetMinutes || 20,
          completionDate: t.completedAt ? t.completedAt.toISOString() : undefined,
        })),
      })),
    }));

    return NextResponse.json({ success: true, subjects });
  } catch (error: any) {
    console.error('API /syllabus/tree GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/syllabus/tree - Create Subject, Course, or Topic
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const user = await resolveUser(req, searchParams.get('email') || body.email);
    const { action = 'CREATE_SUBJECT', title, icon, color, subjectId, courseId, estimatedMinutes, difficulty } = body;

    // 1. CREATE SUBJECT
    if (action === 'CREATE_SUBJECT' || !action) {
      if (!title || !title.trim()) {
        return NextResponse.json({ success: false, error: 'Subject title is required' }, { status: 400 });
      }

      const existingCount = await prisma.subject.count({
        where: { userId: user.id },
      });

      if (existingCount >= 10) {
        return NextResponse.json({ success: false, error: 'Subject limit reached (max 10 subjects)' }, { status: 400 });
      }

      const colors = ['#FF6B00', '#00F0FF', '#FF2E54', '#10B981', '#9D4EDD', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6'];
      const icons = ['BookOpen', 'Code', 'Cpu', 'Database', 'Layout', 'Layers', 'Terminal', 'Globe', 'Compass', 'Award'];
      
      const chosenColor = color || colors[existingCount % colors.length];
      const chosenIcon = icon || icons[existingCount % icons.length];

      // Create Subject with default Chapter 1: Core Fundamentals
      const newSubject = await prisma.subject.create({
        data: {
          userId: user.id,
          title: title.trim(),
          color: chosenColor,
          icon: chosenIcon,
          order: existingCount,
          courses: {
            create: [
              {
                title: `${title.trim()} Fundamentals & Setup`,
                order: 0,
              },
            ],
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

      return NextResponse.json({
        success: true,
        subject: {
          ...newSubject,
          chapters: newSubject.courses.map(c => ({
            ...c,
            topics: [],
            todoItems: [],
          })),
        },
      });
    }

    // 2. CREATE TOPIC
    if (action === 'CREATE_TOPIC') {
      if (!subjectId) {
        return NextResponse.json({ success: false, error: 'subjectId is required to create a topic' }, { status: 400 });
      }
      if (!title || !title.trim()) {
        return NextResponse.json({ success: false, error: 'Topic title is required' }, { status: 400 });
      }

      // Verify subject ownership
      const subject = await prisma.subject.findFirst({
        where: { id: subjectId, userId: user.id },
        include: { courses: true },
      });

      if (!subject) {
        return NextResponse.json({ success: false, error: 'Subject not found' }, { status: 404 });
      }

      // Find or create course
      let targetCourseId = courseId;
      if (!targetCourseId) {
        if (subject.courses.length > 0) {
          targetCourseId = subject.courses[0].id;
        } else {
          const createdCourse = await prisma.course.create({
            data: {
              subjectId: subject.id,
              title: `${subject.title} Core Topics`,
              order: 0,
            },
          });
          targetCourseId = createdCourse.id;
        }
      }

      const existingTopicCount = await prisma.todoItem.count({
        where: { courseId: targetCourseId },
      });

      const minutes = Number(estimatedMinutes) || 20;
      const newTopic = await prisma.todoItem.create({
        data: {
          courseId: targetCourseId,
          title: title.trim(),
          normalizedTitle: title.trim(),
          difficulty: difficulty || 'MEDIUM',
          estimatedMinutes: minutes,
          targetMinutes: minutes,
          estimatedMinMinutes: Math.max(10, minutes - 5),
          estimatedMaxMinutes: minutes + 10,
          actualMinutes: 0,
          attemptCount: 0,
          order: existingTopicCount,
          status: 'NOT_STARTED',
          progress: 0.0,
        },
      });

      return NextResponse.json({
        success: true,
        topic: {
          ...newTopic,
          completed: false,
          requiredMinutes: minutes,
        },
      });
    }

    // 3. CREATE COURSE / CHAPTER
    if (action === 'CREATE_COURSE') {
      if (!subjectId || !title) {
        return NextResponse.json({ success: false, error: 'subjectId and title are required' }, { status: 400 });
      }

      const subject = await prisma.subject.findFirst({
        where: { id: subjectId, userId: user.id },
      });

      if (!subject) {
        return NextResponse.json({ success: false, error: 'Subject not found' }, { status: 404 });
      }

      const courseCount = await prisma.course.count({ where: { subjectId } });
      const newCourse = await prisma.course.create({
        data: {
          subjectId,
          title: title.trim(),
          order: courseCount,
        },
        include: {
          todoItems: true,
        },
      });

      return NextResponse.json({ success: true, course: newCourse });
    }

    // 4. BATCH SAVE TOPICS / COURSES TO A SUBJECT
    if (action === 'BATCH_SAVE_TOPICS' || action === 'SAVE_SYLLABUS') {
      const { topics = [], courses = [], replaceExisting = false } = body;
      if (!subjectId) {
        return NextResponse.json({ success: false, error: 'subjectId is required for batch saving syllabus' }, { status: 400 });
      }

      const subject = await prisma.subject.findFirst({
        where: { id: subjectId, userId: user.id },
        include: {
          courses: {
            include: { todoItems: true },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!subject) {
        return NextResponse.json({ success: false, error: 'Subject not found' }, { status: 404 });
      }

      // Helper to compute minutes for difficulty
      const getMinutesForDifficulty = (diff: string, customMinutes?: number) => {
        if (customMinutes && Number(customMinutes) > 0) return Number(customMinutes);
        if (diff === 'EASY') return 15;
        if (diff === 'ADVANCED') return 45;
        if (diff === 'HARD' || diff === 'COMPLEX' || diff === 'VERY_HARD') return 30;
        return 20; // MODERATE / MEDIUM default
      };

      // Helper to normalize difficulty string
      const normalizeDifficulty = (rawDiff?: string): string => {
        if (!rawDiff) return 'MODERATE';
        const d = rawDiff.toUpperCase().trim();
        if (d === 'EASY') return 'EASY';
        if (d === 'ADVANCED') return 'ADVANCED';
        if (d === 'HARD' || d === 'COMPLEX' || d === 'VERY_HARD') return 'HARD';
        return 'MODERATE';
      };

      // Option A: Structured Courses (Units/Modules) are provided
      if (Array.isArray(courses) && courses.length > 0) {
        if (replaceExisting) {
          // Delete existing courses & their todoItems (Prisma cascade onDelete)
          await prisma.course.deleteMany({
            where: { subjectId: subject.id },
          });
        }

        for (let cIdx = 0; cIdx < courses.length; cIdx++) {
          const courseData = courses[cIdx];
          const courseTitle = (courseData.title || `Unit ${cIdx + 1}`).trim();
          const rawItems = courseData.todoItems || courseData.topics || [];

          const createdCourse = await prisma.course.create({
            data: {
              subjectId: subject.id,
              title: courseTitle,
              order: cIdx,
            },
          });

          for (let iIdx = 0; iIdx < rawItems.length; iIdx++) {
            const rawItem = rawItems[iIdx];
            const rawTitle = typeof rawItem === 'string' ? rawItem : rawItem.title || rawItem.normalizedTitle;
            if (!rawTitle || !rawTitle.trim()) continue;

            const cleanTitle = rawTitle.trim();
            const diff = typeof rawItem === 'object' ? normalizeDifficulty(rawItem.difficulty) : 'MODERATE';
            const minutes = typeof rawItem === 'object' 
              ? getMinutesForDifficulty(diff, rawItem.targetMinutes || rawItem.estimatedMinutes)
              : getMinutesForDifficulty(diff);

            await prisma.todoItem.create({
              data: {
                courseId: createdCourse.id,
                title: cleanTitle,
                normalizedTitle: cleanTitle,
                difficulty: diff,
                estimatedMinutes: minutes,
                targetMinutes: minutes,
                estimatedMinMinutes: Math.max(10, minutes - 5),
                estimatedMaxMinutes: minutes + 15,
                actualMinutes: 0,
                attemptCount: 0,
                order: iIdx,
                status: 'NOT_STARTED',
                progress: 0.0,
              },
            });
          }
        }
      } else {
        // Option B: Flat Topic list provided
        let targetCourse = subject.courses[0];
        if (!targetCourse) {
          targetCourse = await prisma.course.create({
            data: {
              subjectId: subject.id,
              title: `${subject.title} Curriculum`,
              order: 0,
            },
            include: { todoItems: true },
          });
        }

        if (replaceExisting) {
          await prisma.todoItem.deleteMany({
            where: { courseId: targetCourse.id },
          });
        }

        const currentItemCount = replaceExisting ? 0 : await prisma.todoItem.count({ where: { courseId: targetCourse.id } });

        for (let i = 0; i < topics.length; i++) {
          const rawItem = topics[i];
          const rawTitle = typeof rawItem === 'string' ? rawItem : rawItem.title || rawItem.normalizedTitle;
          if (!rawTitle || !rawTitle.trim()) continue;

          const cleanTitle = rawTitle.trim();
          const diff = typeof rawItem === 'object' ? normalizeDifficulty(rawItem.difficulty) : 'MODERATE';
          const minutes = typeof rawItem === 'object' 
            ? getMinutesForDifficulty(diff, rawItem.targetMinutes || rawItem.estimatedMinutes)
            : getMinutesForDifficulty(diff);

          await prisma.todoItem.create({
            data: {
              courseId: targetCourse.id,
              title: cleanTitle,
              normalizedTitle: cleanTitle,
              difficulty: diff,
              estimatedMinutes: minutes,
              targetMinutes: minutes,
              estimatedMinMinutes: Math.max(10, minutes - 5),
              estimatedMaxMinutes: minutes + 15,
              actualMinutes: 0,
              attemptCount: 0,
              order: currentItemCount + i,
              status: 'NOT_STARTED',
              progress: 0.0,
            },
          });
        }
      }

      // Fetch refreshed subject with full hierarchy
      const updatedSubject = await prisma.subject.findUnique({
        where: { id: subject.id },
        include: {
          courses: {
            include: {
              todoItems: { orderBy: { order: 'asc' } },
            },
            orderBy: { order: 'asc' },
          },
        },
      });

      return NextResponse.json({
        success: true,
        subject: {
          ...updatedSubject,
          courses: updatedSubject?.courses.map(c => ({
            ...c,
            topics: c.todoItems.map(t => ({
              ...t,
              completed: t.status === 'COMPLETED',
              requiredMinutes: t.estimatedMinutes || 20,
            })),
            todoItems: c.todoItems.map(t => ({
              ...t,
              completed: t.status === 'COMPLETED',
              requiredMinutes: t.estimatedMinutes || 20,
            })),
          })),
          chapters: updatedSubject?.courses.map(c => ({
            ...c,
            topics: c.todoItems.map(t => ({
              ...t,
              completed: t.status === 'COMPLETED',
              requiredMinutes: t.estimatedMinutes || 20,
            })),
            todoItems: c.todoItems.map(t => ({
              ...t,
              completed: t.status === 'COMPLETED',
              requiredMinutes: t.estimatedMinutes || 20,
            })),
          })),
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('API /syllabus/tree POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/syllabus/tree - Delete Subject, Course, or Topic
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = await resolveUser(req, searchParams.get('email'));
    const subjectId = searchParams.get('subjectId');
    const courseId = searchParams.get('courseId');
    const topicId = searchParams.get('topicId') || searchParams.get('todoItemId');

    // 1. DELETE SUBJECT (Cascade deletes all courses and topics in this subject)
    if (subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { id: subjectId, userId: user.id },
      });

      if (!subject) {
        return NextResponse.json({ success: false, error: 'Subject not found or unauthorized' }, { status: 404 });
      }

      // Also clean up any exams linked to this subject
      await prisma.exam.deleteMany({
        where: { subjectId: subject.id, userId: user.id },
      });

      await prisma.subject.delete({
        where: { id: subjectId },
      });

      return NextResponse.json({ success: true, deletedSubjectId: subjectId });
    }

    // 2. DELETE COURSE
    if (courseId) {
      const course = await prisma.course.findFirst({
        where: { id: courseId, subject: { userId: user.id } },
      });

      if (!course) {
        return NextResponse.json({ success: false, error: 'Course not found or unauthorized' }, { status: 404 });
      }

      await prisma.course.delete({
        where: { id: courseId },
      });

      return NextResponse.json({ success: true, deletedCourseId: courseId });
    }

    // 3. DELETE TOPIC / TODOITEM
    if (topicId) {
      // Find topic owned by this user
      const item = await prisma.todoItem.findFirst({
        where: {
          OR: [
            { id: topicId, course: { subject: { userId: user.id } } },
            { title: topicId, course: { subject: { userId: user.id } } },
            { normalizedTitle: topicId, course: { subject: { userId: user.id } } }
          ],
        },
      });

      if (!item) {
        return NextResponse.json({ success: false, error: 'Topic not found or unauthorized' }, { status: 404 });
      }

      await prisma.todoItem.delete({
        where: { id: item.id },
      });

      return NextResponse.json({ success: true, deletedTopicId: item.id });
    }

    return NextResponse.json({ success: false, error: 'subjectId, courseId, or topicId required' }, { status: 400 });
  } catch (error: any) {
    console.error('API /syllabus/tree DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH /api/syllabus/tree - Mark Topic Completed or update progress
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json();
    const user = await resolveUser(req, searchParams.get('email') || body.email);
    const { todoItemId, topicId, status, progress, quizScore, actualMinutes } = body;
    const targetId = todoItemId || topicId;

    if (!targetId) {
      return NextResponse.json({ success: false, error: 'todoItemId or topicId is required' }, { status: 400 });
    }

    const item = await prisma.todoItem.findFirst({
      where: {
        OR: [
          { id: targetId, course: { subject: { userId: user.id } } },
          { title: targetId, course: { subject: { userId: user.id } } },
        ],
      },
    });

    if (!item) {
      return NextResponse.json({ success: false, error: 'Topic not found or unauthorized' }, { status: 404 });
    }

    const wasCompleted = item.status === 'COMPLETED';
    const isNowCompleted = status === 'COMPLETED' || (status === undefined && progress === 1.0);

    const updatedItem = await prisma.todoItem.update({
      where: { id: item.id },
      data: {
        ...(status && { status }),
        ...(progress !== undefined && { progress }),
        ...(quizScore !== undefined && { quizScore }),
        ...(actualMinutes !== undefined && { actualMinutes: Number(actualMinutes) }),
        ...(isNowCompleted && !wasCompleted ? { completedAt: new Date(), progress: 1.0, status: 'COMPLETED' } : {}),
        ...(status === 'NOT_STARTED' ? { completedAt: null, progress: 0.0 } : {}),
        lastStudiedAt: new Date(),
      },
    });

    // Chakra Points Awarding: Only award Chakra when completing for the FIRST time
    let updatedChakra = user.chakra;
    if (isNowCompleted && !wasCompleted) {
      const awardedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          chakra: Math.min(100, user.chakra + 20),
          totalXp: { increment: 50 },
        },
      });
      updatedChakra = awardedUser.chakra;
    }

    return NextResponse.json({
      success: true,
      todoItem: {
        ...updatedItem,
        completed: updatedItem.status === 'COMPLETED',
      },
      topic: {
        ...updatedItem,
        completed: updatedItem.status === 'COMPLETED',
      },
      chakra: updatedChakra,
    });
  } catch (error: any) {
    console.error('API /syllabus/tree PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
