import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

// TODO: Add ClassMarker secret verification once a secret phrase is configured
// in ClassMarker dashboard. See: https://www.classmarker.com/help/webhooks/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id: cmUserId,
      test_id: quizId,
      score,
      total,
      percentage,
      passed,
    } = body;

    if (!cmUserId || !quizId) {
      return NextResponse.json(
        { error: 'Missing user_id or test_id' },
        { status: 400 },
      );
    }

    const parts = String(cmUserId).split('-');
    const userId = parts[0];
    const courseId = parts.slice(1).join('-');

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'Invalid user_id format. Expected: userId-courseId' },
        { status: 400 },
      );
    }

    // Find the lesson that matches this quiz_id and course_id
    const lesson = await db.findCourseLessonByQuizId(quizId, courseId);
    if (!lesson) {
      return NextResponse.json(
        { error: 'No lesson found for this quiz and course' },
        { status: 404 },
      );
    }

    await db.createQuizResult({
      userId,
      courseId,
      lessonId: lesson.id,
      quizId,
      score: Number(score) || 0,
      total: Number(total) || 0,
      percentage: Number(percentage) || 0,
      passed: passed === true || passed === 'true',
      rawResult: body,
    });

    await db.markLessonComplete(userId, lesson.id, courseId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ClassMarker webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
