import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import { canAccessCourse } from '@/lib/training-access';

const progressSchema = z.object({
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  watchSeconds: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = progressSchema.parse(body);
    const lesson = await db.findCourseLessonById(data.lessonId);

    if (!lesson || lesson.course_id !== data.courseId) {
      return NextResponse.json({ error: 'Invalid lesson' }, { status: 400 });
    }

    const hasAccess = await canAccessCourse(session.user, data.courseId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (data.completed) {
      await db.markLessonComplete(
        session.user.id,
        data.lessonId,
        data.courseId,
      );
    } else {
      await db.upsertLessonProgress({
        userId: session.user.id,
        lessonId: data.lessonId,
        courseId: data.courseId,
        watchSeconds: data.watchSeconds || 0,
      });
    }

    await db.updateCourseEnrollmentLastAccessed(session.user.id, data.courseId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Progress update error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
