import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import * as db from '@/lib/db';

const EXPECTED_SECRET = process.env.CLASSMARKER_SECRET;

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  try {
    let rawBody: string;
    try {
      rawBody = await request.text();
    } catch {
      return NextResponse.json({ error: 'Could not read body' }, { status: 400 });
    }

    if (EXPECTED_SECRET) {
      const sig = request.headers.get('x-classmarker-hmac-sha256');
      if (!sig) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }
      const calculated = createHmac('sha256', EXPECTED_SECRET)
        .update(rawBody)
        .digest('base64');
      if (sig !== calculated) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: true });
    }

    if (body.payload_status === 'verify') {
      return NextResponse.json({ success: true });
    }

    const testId = (body.test as Record<string, unknown> | undefined)?.test_id;
    const result = body.result as Record<string, unknown> | undefined;
    const cmUserId = result?.cm_user_id;
    const percentage = result?.percentage;
    const pointsScored = result?.points_scored;
    const pointsAvailable = result?.points_available;
    const passed = result?.passed;

    if (!cmUserId || !testId) {
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
        String(testId),
        courseId,
      );

      if (lesson) {
        await db.createQuizResult({
          userId,
          courseId,
          lessonId: lesson.id,
          quizId: String(testId),
          score: Number(pointsScored) || 0,
          total: Number(pointsAvailable) || 0,
          percentage: Number(percentage) || 0,
          passed: passed === true || passed === 'true',
          rawResult: body,
        });

        await db.markLessonComplete(userId, lesson.id, courseId);
      }
    } catch {
      console.error('ClassMarker webhook processing error:', body);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
