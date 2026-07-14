import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import { canAccessCourse } from '@/lib/training-access';
import { QuizRedirect } from '@/components/training/QuizRedirect';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await db.findCourseBySlug(slug);
  return {
    title: course
      ? `Assessment: ${course.title} | Fermidas Training`
      : 'Assessment | Fermidas Training',
  };
}

export default async function QuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ started?: string }>;
}) {
  const { slug } = await params;
  const { started } = await searchParams;
  const session = await auth();
  const course = await db.findCourseBySlug(slug);

  if (!course) notFound();

  const courseAccess = await canAccessCourse(session?.user ?? null, course.id);

  if (!courseAccess) {
    redirect(`/digital/training/${course.slug}`);
  }

  if (!session?.user) {
    redirect(`/digital/training/${course.slug}`);
  }

  const modules = await db.findModulesForCourse(course.id);
  const lessons = modules.flatMap((m) => m.lessons);
  const quizLesson = lessons.find((l) => l.lesson_type === 'quiz');
  const progress = await db.findCourseProgress(session.user.id, course.id);

  if (!quizLesson) {
    notFound();
  }

  const allVideoDone = await db.hasCompletedAllVideoLessons(
    session.user.id,
    course.id,
  );
  if (!allVideoDone) {
    redirect(`/digital/training/${course.slug}`);
  }

  const quizResult = await db.findQuizResultByUserAndLesson(
    session.user.id,
    quizLesson.id,
  );

  const delivery = (quizLesson.quiz_config as { delivery?: 'embed' | 'redirect' })?.delivery || 'redirect';

  const completedCount =
    progress?.lessons.filter((l) => l.completed_at).length || 0;
  const totalLessons = progress?.totalLessons || lessons.length;

  return (
    <section className='bg-gradient-to-br from-mint to-white pt-8 pb-24'>
      <div className='container max-w-4xl'>
        <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <Link
              href={`/digital/training/${course.slug}`}
              className='text-sm text-leaf-700 hover:text-leaf-900'
            >
              ← Course Overview
            </Link>
            <div className='mt-4 flex items-center gap-4'>
              <div>
                <h1 className='font-display text-2xl font-bold text-brand'>
                  {quizLesson.title}
                </h1>
                <p className='mt-1 text-sm text-leaf-600'>{course.title}</p>
              </div>
            </div>
          </div>
          <div className='rounded-xl bg-white px-5 py-3 shadow-sm'>
            <div className='text-xs text-leaf-500'>Progress</div>
            <div className='text-lg font-bold text-brand'>
              {completedCount}/{totalLessons} lessons
            </div>
          </div>
        </div>

        {quizResult ? (
          <div className='card mb-8 border-2 border-success/30 bg-success/5 p-8 text-center'>
            <div className='mb-2 text-5xl font-bold text-brand'>
              {quizResult.percentage}%
            </div>
            <div className='mb-1 text-lg text-leaf-600'>
              Score: {quizResult.score}/{quizResult.total}
            </div>
            <div className='text-sm font-medium'>
              {quizResult.passed ? (
                <span className='text-success'>Passed</span>
              ) : (
                <span className='text-amber-600'>Attempted</span>
              )}
            </div>
            <div className='mt-6'>
              <Link
                href={`/digital/training/${course.slug}`}
                className='btn btn-primary'
              >
                Back to Course
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className='mb-6'>
              <div className='rounded-2xl border border-leaf-100 bg-white p-6'>
                <h2 className='font-semibold text-brand'>Instructions</h2>
                <p className='mt-2 text-sm leading-relaxed text-leaf-600'>
                  Open the assessment on ClassMarker to finish this course. Your
                  results will be recorded automatically.
                </p>
              </div>
            </div>

            <div className='flex justify-center'>
              <QuizRedirect
                quizId={quizLesson.quiz_id!}
                userId={`${session.user.id}-${course.id}`}
                courseSlug={course.slug}
                started={started === '1'}
                delivery={delivery}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
