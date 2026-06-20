import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import { canAccessCourse } from '@/lib/training-access';
import { serveTrainingMedia } from '@/lib/training-media-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const session = await auth();
    const { courseId } = await params;
    const course = await db.findCourseById(courseId);

    if (!course || !course.thumbnail_url) {
      return NextResponse.json({ error: 'Cover not found' }, { status: 404 });
    }

    if (!course.is_published && session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Cover not found' }, { status: 404 });
    }

    const hasAccess = await canAccessCourse(session?.user ?? null, course.id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return serveTrainingMedia(course.thumbnail_url, request, 'image/jpeg');
  } catch (error) {
    console.error('Course cover error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
