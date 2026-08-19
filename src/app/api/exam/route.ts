import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get('email');
    const email = (session?.user?.email || queryEmail || 'shinobi@aniskill.local').toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: true, exams: [] });
    }

    const exams = await prisma.exam.findMany({
      where: { userId: user.id },
      orderBy: { examDate: 'asc' },
    });

    return NextResponse.json({ success: true, exams });
  } catch (error: any) {
    console.error('API /exam GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { subject, subjectId, examDate, planData } = body;
    const email = (session?.user?.email || body.email || 'shinobi@aniskill.local').toLowerCase().trim();

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

    const serializedPlan = planData ? (typeof planData === 'string' ? planData : JSON.stringify(planData)) : null;

    // Check if an exam for this subject & date already exists for this user
    const existingExam = await prisma.exam.findFirst({
      where: {
        userId: user.id,
        subject,
        examDate,
      },
    });

    if (existingExam) {
      const updatedExam = await prisma.exam.update({
        where: { id: existingExam.id },
        data: {
          ...(subjectId ? { subjectId } : {}),
          ...(serializedPlan ? { planData: serializedPlan } : {}),
        } as any,
      });
      return NextResponse.json({ success: true, exam: updatedExam });
    }

    // Limit to max 10 exams
    const existingCount = await prisma.exam.count({ where: { userId: user.id } });
    if (existingCount >= 10) {
      return NextResponse.json({ success: false, error: 'Maximum 10 Chūnin Exams reached for your account' }, { status: 400 });
    }

    const newExam = await prisma.exam.create({
      data: {
        userId: user.id,
        subject,
        subjectId,
        examDate,
        planData: serializedPlan,
      } as any,
    });

    return NextResponse.json({ success: true, exam: newExam });
  } catch (error: any) {
    console.error('API /exam POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('id');

    if (!examId) {
      return NextResponse.json({ success: false, error: 'examId required' }, { status: 400 });
    }

    await prisma.exam.delete({ where: { id: examId } });
    return NextResponse.json({ success: true, message: 'Exam deleted' });
  } catch (error: any) {
    console.error('API /exam DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
