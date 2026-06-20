import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import { canAccessCourse } from '@/lib/training-access';
import type { TrainingResourceUrl } from '@/lib/training-utils';
import { CoursePlayer } from '@/components/training/CoursePlayer';
import { LessonSidebar } from '@/components/training/LessonSidebar';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string; lessonId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = await db.findCourseLessonById(lessonId);

  return {
    title: lesson
      ? `${lesson.title} | Fermidas Training`
      : 'Course Lesson | Fermidas Training',
  };
}

export default async function LessonPlayerPage({ params }: PageProps) {
  const { slug, lessonId } = await params;
  const session = await auth();
  const [course, lesson] = await Promise.all([
    db.findCourseBySlug(slug),
    db.findCourseLessonById(lessonId),
  ]);

  if (!course || !lesson || lesson.course_id !== course.id) {
    notFound();
  }

  const courseAccess = await canAccessCourse(session?.user ?? null, course.id);

  if (!courseAccess) {
    redirect(`/digital/training/${course.slug}`);
  }

  if (courseAccess && session?.user) {
    await db.createCourseEnrollment(session.user.id, course.id);
  }

  const [modules, progress] = await Promise.all([
    db.findModulesForCourse(course.id),
    session?.user
      ? db.findCourseProgress(session.user.id, course.id)
      : Promise.resolve(null),
  ]);

  const completedLessonIds =
    progress?.lessons
      .filter((progressLesson) => progressLesson.completed_at)
      .map((progressLesson) => progressLesson.lesson_id) || [];
  const currentProgress = progress?.lessons.find(
    (progressLesson) => progressLesson.lesson_id === lesson.id,
  );
  const lessons = modules.flatMap((module) => module.lessons);
  const currentIndex = lessons.findIndex(
    (courseLesson) => courseLesson.id === lesson.id,
  );
  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < lessons.length - 1
      ? lessons[currentIndex + 1]
      : null;
  const nextLessonHref = nextLesson
    ? `/digital/training/${course.slug}/learn/${nextLesson.id}`
    : null;
  const resources = Array.isArray(lesson.resource_urls)
    ? (lesson.resource_urls as TrainingResourceUrl[])
    : [];

  return (
    <section className='bg-gradient-to-br from-mint to-white pt-8 pb-24'>
      <div className='container'>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
          <Link
            href={`/digital/training/${course.slug}`}
            className='text-sm text-leaf-700 hover:text-leaf-900'
          >
            ← Course Overview
          </Link>
          {!courseAccess && lesson.is_preview && (
            <Link
              href={`/digital/checkout?course=${course.slug}`}
              className='btn btn-primary px-4 py-2 text-sm'
            >
              Enroll for Full Access
            </Link>
          )}
        </div>

        <div className='grid gap-8 lg:grid-cols-[360px,1fr]'>
          <LessonSidebar
            courseSlug={course.slug}
            modules={modules}
            completedLessonIds={completedLessonIds}
            activeLessonId={lesson.id}
            progressPercent={progress?.percent || 0}
          />

          <main className='min-w-0'>
            <CoursePlayer
              courseId={course.id}
              lessonId={lesson.id}
              title={lesson.title}
              description={lesson.description}
              videoSrc={
                lesson.video_url
                  ? `/api/training/lessons/${lesson.id}/video`
                  : null
              }
              resources={resources}
              canTrackProgress={!!courseAccess && !!session?.user}
              initiallyCompleted={!!currentProgress?.completed_at}
            />

            <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between'>
              {previousLesson ? (
                <Link
                  href={`/digital/training/${course.slug}/learn/${previousLesson.id}`}
                  className='btn btn-ghost'
                >
                  ← Previous Lesson
                </Link>
              ) : (
                <span />
              )}
              {nextLessonHref ? (
                <Link href={nextLessonHref} className='btn btn-primary'>
                  Next Lesson →
                </Link>
              ) : nextLesson ? (
                <Link
                  href={`/digital/checkout?course=${course.slug}`}
                  className='btn btn-primary'
                >
                  Enroll to Continue
                </Link>
              ) : (
                <Link
                  href={`/digital/training/${course.slug}`}
                  className='btn btn-primary'
                >
                  Finish Course
                </Link>
              )}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
