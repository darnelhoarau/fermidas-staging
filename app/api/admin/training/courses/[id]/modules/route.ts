import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';

const moduleSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
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
    const data = moduleSchema.parse(body);
    const courseModule = await db.createCourseModule({
      courseId: id,
      title: data.title,
      description: data.description || null,
      sort: data.sort,
    });

    await db.createAuditLog({
      actorUserId: session.user.id,
      action: 'training.module.created',
      metaJson: JSON.stringify({ courseId: id, moduleId: courseModule.id }),
    });

    return NextResponse.json({ success: true, module: courseModule });
  } catch (error) {
    console.error('Training module creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
