import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';

const mediaUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === '' ||
      value.startsWith('vercel-blob://') ||
      value.startsWith('/') ||
      z.string().url().safeParse(value).success,
    'Invalid media URL',
  );

const resourceSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
});

const updateLessonSchema = z.object({
  moduleId: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  videoUrl: mediaUrlSchema.nullable().optional(),
  videoDurationSeconds: z.number().int().min(0).optional(),
  resourceUrls: z.array(resourceSchema).optional(),
  isPreview: z.boolean().optional(),
  sort: z.number().int().min(0).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> },
) {
  try {
    await requireAdmin();
    const { id, lessonId } = await params;
    const lesson = await db.findCourseLessonById(lessonId);

    if (!lesson || lesson.course_id !== id) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateLessonSchema.parse(body);
    const updatedLesson = await db.updateCourseLesson(lessonId, {
      ...parsed,
      ...(parsed.videoUrl !== undefined && {
        videoUrl: parsed.videoUrl || null,
      }),
    });

    return NextResponse.json({ success: true, lesson: updatedLesson });
  } catch (error) {
    console.error('Training lesson update error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> },
) {
  try {
    await requireAdmin();
    const { id, lessonId } = await params;
    const lesson = await db.findCourseLessonById(lessonId);

    if (!lesson || lesson.course_id !== id) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    await db.deleteCourseLesson(lessonId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Training lesson delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
