import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import { canAccessCourse } from '@/lib/training-access';
import { serveTrainingMedia } from '@/lib/training-media-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const session = await auth();
    const { lessonId } = await params;
    const lesson = await db.findCourseLessonById(lessonId);

    if (!lesson || !lesson.video_url) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const hasAccess = await canAccessCourse(
      session?.user ?? null,
      lesson.course_id,
    );
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return serveTrainingMedia(lesson.video_url, request, 'video/mp4');
  } catch (error) {
    console.error('Lesson video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
