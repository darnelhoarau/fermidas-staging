import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import { canAccessCourse } from '@/lib/training-access';
import type { TrainingResourceUrl } from '@/lib/training-utils';
import { CoursePlayer } from '@/components/training/CoursePlayer';
import { QuizEmbed } from '@/components/training/QuizEmbed';
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

  const isQuizLesson = lesson.lesson_type === 'quiz';

  if (isQuizLesson && session?.user) {
    const allVideoDone = await db.hasCompletedAllVideoLessons(
      session.user.id,
      course.id,
    );
    if (!allVideoDone) {
      redirect(`/digital/training/${course.slug}`);
    }
  }

  const completedLessonIds =
    progress?.lessons
      .filter((progressLesson) => progressLesson.completed_at)
      .map((progressLesson) => progressLesson.lesson_id) || [];
  const videoLessonIds = progress?.lessons
    .filter((pl) => pl.lesson_type !== 'quiz')
    .map((pl) => pl.lesson_id) || [];
  const allVideoDone = videoLessonIds.every((id) =>
    completedLessonIds.includes(id),
  );
  const lockedLessonIds = progress?.lessons
    .filter(
      (pl) =>
        pl.lesson_type === 'quiz' &&
        !completedLessonIds.includes(pl.lesson_id) &&
        !allVideoDone,
    )
    .map((pl) => pl.lesson_id) || [];
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

  async function renderQuizResult() {
    if (!session?.user || !isQuizLesson || !lesson.quiz_id) return null;
    try {
      const result = await db.findQuizResultByUserAndLesson(
        session.user.id,
        lesson.id,
      );
      if (!result) return null;
      return (
        <div className={`rounded-2xl p-6 text-center ${
          result.passed ? 'bg-success/10' : 'bg-amber-50'
        }`}>
          <div className='text-3xl font-bold text-brand'>
            {result.percentage}%
          </div>
          <div className='mt-1 text-sm text-leaf-600'>
            Score: {result.score}/{result.total}
          </div>
          <div className='mt-3 text-sm font-medium'>
            {result.passed ? (
              <span className='text-success'>Passed</span>
            ) : (
              <span className='text-amber-600'>Attempted</span>
            )}
          </div>
        </div>
      );
    } catch {
      return null;
    }
  }

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
            lockedLessonIds={lockedLessonIds}
          />

          <main className='min-w-0'>
            {isQuizLesson ? (
              <div className='space-y-6'>
                <div className='card p-6'>
                  <h1 className='font-display text-2xl font-bold text-brand'>
                    {lesson.title}
                  </h1>
                  {lesson.description && (
                    <p className='mt-3 leading-relaxed text-leaf-700'>
                      {lesson.description}
                    </p>
                  )}
                </div>

                {session?.user && lesson.quiz_id && (
                  <QuizEmbed
                    quizId={lesson.quiz_id}
                    userId={`${session.user.id}-${course.id}`}
                  />
                )}

                {await renderQuizResult()}
              </div>
            ) : (
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
            )}

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
