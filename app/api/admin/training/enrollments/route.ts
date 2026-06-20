import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';

const createEnrollmentSchema = z.object({
  email: z.string().email(),
  courseId: z.string().min(1),
});

function csvEscape(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') || undefined;
    const format = searchParams.get('format');
    const enrollments = await db.findCourseEnrollments(courseId);

    if (format === 'csv') {
      const header = [
        'email',
        'name',
        'course',
        'enrolled_at',
        'completed_at',
        'completed_lessons',
        'total_lessons',
      ];
      const rows = enrollments.map((enrollment) =>
        [
          enrollment.email,
          enrollment.user_name,
          enrollment.course_title,
          enrollment.enrolled_at,
          enrollment.completed_at,
          enrollment.completed_lessons,
          enrollment.total_lessons,
        ]
          .map(csvEscape)
          .join(','),
      );
      return new NextResponse([header.join(','), ...rows].join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition':
            'attachment; filename="training-enrollments.csv"',
        },
      });
    }

    return NextResponse.json({ enrollments });
  } catch (error) {
    console.error('Training enrollments fetch error:', error);
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
    const data = createEnrollmentSchema.parse(body);
    const [user, course] = await Promise.all([
      db.findUserByEmail(data.email),
      db.findCourseById(data.courseId),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const enrollment = await db.createCourseEnrollment(user.id, course.id);

    await db.createAuditLog({
      actorUserId: session.user.id,
      action: 'training.enrollment.created',
      metaJson: JSON.stringify({
        courseId: course.id,
        userId: user.id,
        source: 'admin',
      }),
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    console.error('Training enrollment creation error:', error);

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
