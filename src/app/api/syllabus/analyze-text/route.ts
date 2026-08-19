import { NextRequest, NextResponse } from 'next/server';
import { analyzeSyllabusFromText } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text = '', subjectTitle = '' } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please paste your syllabus text into the input area before analyzing.',
        },
        { status: 400 }
      );
    }

    const analyzedData = await analyzeSyllabusFromText(text.trim(), subjectTitle.trim() || 'Subject');

    let totalTopics = 0;
    (analyzedData.courses || []).forEach((c) => {
      totalTopics += (c.todoItems || []).length;
    });

    if (totalTopics === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not detect any learning topics from the provided text. Please check the text and try again.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      subjectName: analyzedData.subjectName || subjectTitle,
      courses: analyzedData.courses || [],
      totalTopics,
    });
  } catch (error: any) {
    console.error('API /syllabus/analyze-text error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze syllabus text.',
      },
      { status: 500 }
    );
  }
}
