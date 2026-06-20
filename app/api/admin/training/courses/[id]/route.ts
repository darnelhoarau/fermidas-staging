import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { normalizeSlug } from '@/lib/training-utils';

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

const updateCourseSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  shortDescription: z.string().min(1).max(240).optional(),
  description: z.string().min(1).optional(),
  whatYouLearn: z.array(z.string().min(1)).optional(),
  requirements: z.array(z.string().min(1)).optional(),
  thumbnailUrl: mediaUrlSchema.nullable().optional(),
  trailerUrl: mediaUrlSchema.nullable().optional(),
  instructorName: z.string().min(1).optional(),
  instructorBio: z.string().nullable().optional(),
  instructorAvatarUrl: mediaUrlSchema.nullable().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  language: z.string().min(2).max(12).optional(),
  priceMinor: z.number().int().min(0).optional(),
  currency: z.string().min(3).max(3).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sort: z.number().int().min(0).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const [course, modules] = await Promise.all([
      db.findCourseById(id),
      db.findModulesForCourse(id),
    ]);

    if (!course) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ course, modules });
  } catch (error) {
    console.error('Training course fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateCourseSchema.parse(body);
    const course = await db.updateCourse(id, {
      ...parsed,
      ...(parsed.slug && { slug: normalizeSlug(parsed.slug) }),
      ...(parsed.thumbnailUrl !== undefined && {
        thumbnailUrl: parsed.thumbnailUrl || null,
      }),
      ...(parsed.trailerUrl !== undefined && {
        trailerUrl: parsed.trailerUrl || null,
      }),
      ...(parsed.instructorAvatarUrl !== undefined && {
        instructorAvatarUrl: parsed.instructorAvatarUrl || null,
      }),
    });

    if (!course) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.createAuditLog({
      actorUserId: session.user.id,
      action: 'training.course.updated',
      metaJson: JSON.stringify({ courseId: id }),
    });

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error('Training course update error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 },
      );
    }

    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json(
        { error: 'A course with this slug already exists' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    await db.deleteCourse(id);
    await db.createAuditLog({
      actorUserId: session.user.id,
      action: 'training.course.deleted',
      metaJson: JSON.stringify({ courseId: id }),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Training course delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
