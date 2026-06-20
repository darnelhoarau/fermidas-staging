import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';

const updateModuleSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  sort: z.number().int().min(0).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> },
) {
  try {
    await requireAdmin();
    const { id, moduleId } = await params;
    const courseModule = await db.findCourseModuleById(moduleId);

    if (!courseModule || courseModule.course_id !== id) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const body = await request.json();
    const data = updateModuleSchema.parse(body);
    const updatedModule = await db.updateCourseModule(moduleId, data);

    return NextResponse.json({ success: true, module: updatedModule });
  } catch (error) {
    console.error('Training module update error:', error);

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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> },
) {
  try {
    await requireAdmin();
    const { id, moduleId } = await params;
    const courseModule = await db.findCourseModuleById(moduleId);

    if (!courseModule || courseModule.course_id !== id) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    await db.deleteCourseModule(moduleId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Training module delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
