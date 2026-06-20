import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import { canAccessCourse } from '@/lib/training-access';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseLearnRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();
  const course = await db.findCourseBySlug(slug);

  if (!course) notFound();

  const modules = await db.findModulesForCourse(course.id);
  const lessons = modules.flatMap((module) => module.lessons);

  if (lessons.length === 0) {
    redirect(`/digital/training/${course.slug}`);
  }

  const hasAccess = await canAccessCourse(session?.user ?? null, course.id);

  if (hasAccess && session?.user) {
    await db.createCourseEnrollment(session.user.id, course.id);
    const progress = await db.findCourseProgress(session.user.id, course.id);
    const completedIds = new Set(
      progress.lessons
        .filter((lesson) => lesson.completed_at)
        .map((lesson) => lesson.lesson_id),
    );
    const nextLesson =
      lessons.find((lesson) => !completedIds.has(lesson.id)) || lessons[0];
    redirect(`/digital/training/${course.slug}/learn/${nextLesson.id}`);
  }

  const previewLesson = lessons.find((lesson) => lesson.is_preview);
  if (previewLesson) {
    redirect(`/digital/training/${course.slug}/learn/${previewLesson.id}`);
  }

  redirect(`/digital/training/${course.slug}`);
}
