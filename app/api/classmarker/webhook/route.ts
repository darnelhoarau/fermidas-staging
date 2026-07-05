import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

const EXPECTED_SECRET = process.env.CLASSMARKER_SECRET;

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  try {
    if (EXPECTED_SECRET) {
      const secret = request.headers.get('x-classmarker-secret');
      if (secret !== EXPECTED_SECRET) {
        return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
      }
    }

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // ClassMarker may send non-JSON test payloads — respond 200 to activate
      return NextResponse.json({ success: true });
    }

    const cmUserId = body.user_id || body.cm_user_id;
    const quizId = body.test_id || body.quiz_id;
    const score = body.score;
    const total = body.total;
    const passed = body.passed;

    if (!cmUserId || !quizId) {
      // Test/verification payload without real user data — accept to activate
      return NextResponse.json({ success: true });
    }

    const parts = String(cmUserId).split('-');
    const userId = parts[0];
    const courseId = parts.slice(1).join('-');

    if (!userId || !courseId) {
      return NextResponse.json({ success: true });
    }

    try {
      const lesson = await db.findCourseLessonByQuizId(
        String(quizId),
        courseId,
      );

      if (lesson) {
        await db.createQuizResult({
          userId,
          courseId,
          lessonId: lesson.id,
          quizId: String(quizId),
          score: Number(score) || 0,
          total: Number(total) || 0,
          percentage:
            Number(score) && Number(total)
              ? Math.round((Number(score) / Number(total)) * 10000) / 100
              : 0,
          passed: passed === true || passed === 'true',
          rawResult: body,
        });

        await db.markLessonComplete(userId, lesson.id, courseId);
      }
    } catch {
      // Log but don't fail — ClassMarker needs 200 to activate
      console.error('ClassMarker webhook processing error:', body);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
