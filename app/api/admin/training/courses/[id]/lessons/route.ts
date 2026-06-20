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

const lessonSchema = z.object({
  moduleId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  videoUrl: mediaUrlSchema.nullable().optional(),
  videoDurationSeconds: z.number().int().min(0).default(0),
  resourceUrls: z.array(resourceSchema).default([]),
  isPreview: z.boolean().default(false),
  sort: z.number().int().min(0).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const course = await db.findCourseById(id);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const body = await request.json();
    const data = lessonSchema.parse(body);
    const lesson = await db.createCourseLesson({
      courseId: id,
      moduleId: data.moduleId,
      title: data.title,
      description: data.description || null,
      videoUrl: data.videoUrl || null,
      videoDurationSeconds: data.videoDurationSeconds,
      resourceUrls: data.resourceUrls,
      isPreview: data.isPreview,
      sort: data.sort,
    });

    await db.createAuditLog({
      actorUserId: session.user.id,
      action: 'training.lesson.created',
      metaJson: JSON.stringify({ courseId: id, lessonId: lesson.id }),
    });

    return NextResponse.json({ success: true, lesson });
  } catch (error) {
    console.error('Training lesson creation error:', error);

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
