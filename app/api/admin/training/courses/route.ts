import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { normalizeSlug, TRAINING_PRODUCT_SLUG } from '@/lib/training-utils';

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

const courseSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  shortDescription: z.string().min(1).max(240),
  description: z.string().min(1),
  whatYouLearn: z.array(z.string().min(1)).default([]),
  requirements: z.array(z.string().min(1)).default([]),
  thumbnailUrl: mediaUrlSchema.nullable().optional(),
  trailerUrl: mediaUrlSchema.nullable().optional(),
  instructorName: z.string().min(1),
  instructorBio: z.string().nullable().optional(),
  instructorAvatarUrl: mediaUrlSchema.nullable().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  language: z.string().min(2).max(12).default('en'),
  priceMinor: z.number().int().min(0),
  currency: z.string().min(3).max(3).default('SCR'),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  sort: z.number().int().min(0).default(0),
});

export async function GET() {
  try {
    await requireAdmin();
    const courses = await db.findCoursesForAdmin();
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Training courses fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const data = courseSchema.parse(body);
    const product = await db.findProductBySlug(TRAINING_PRODUCT_SLUG);

    if (!product) {
      return NextResponse.json(
        { error: 'Training product is not configured' },
        { status: 400 },
      );
    }

    const course = await db.createCourse({
      ...data,
      productId: product.id,
      slug: normalizeSlug(data.slug),
      thumbnailUrl: data.thumbnailUrl || null,
      trailerUrl: data.trailerUrl || null,
      instructorBio: data.instructorBio || null,
      instructorAvatarUrl: data.instructorAvatarUrl || null,
    });

    await db.createAuditLog({
      actorUserId: session.user.id,
      action: 'training.course.created',
      metaJson: JSON.stringify({ courseId: course.id, title: course.title }),
    });

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error('Training course creation error:', error);

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
