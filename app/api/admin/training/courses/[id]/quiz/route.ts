import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';

const quizSchema = z.object({
  quizId: z.string().min(1),
  title: z.string().min(1).default('Assessment'),
  delivery: z.enum(['embed', 'redirect']).default('redirect'),
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
    const data = quizSchema.parse(body);

    const modules = await db.findModulesForCourse(id);
    const allLessons = modules.flatMap((m) => m.lessons);
    const existing = allLessons.find((l) => l.lesson_type === 'quiz');

    const quizConfig = { delivery: data.delivery };

    if (existing) {
      await db.updateCourseLesson(existing.id, {
        quizId: data.quizId,
        title: data.title,
        lessonType: 'quiz',
        quizConfig,
      });
    } else {
      const targetModuleId = modules[0]?.id;
      if (targetModuleId) {
        const lastLesson = allLessons[allLessons.length - 1];
        const sort = lastLesson ? lastLesson.sort + 1 : allLessons.length;

        await db.createCourseLesson({
          courseId: id,
          moduleId: targetModuleId,
          title: data.title,
          lessonType: 'quiz',
          quizId: data.quizId,
          quizConfig,
          sort,
        });
      }
    }

    await db.createAuditLog({
      actorUserId: session.user.id,
      action: 'training.quiz.configured',
      metaJson: JSON.stringify({
        courseId: id,
        quizId: data.quizId,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quiz configuration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const course = await db.findCourseById(id);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const modules = await db.findModulesForCourse(id);
    const allLessons = modules.flatMap((m) => m.lessons);
    const existing = allLessons.find((l) => l.lesson_type === 'quiz');

    if (existing) {
      await db.deleteCourseLesson(existing.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quiz removal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
