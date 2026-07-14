import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { QuizForm } from '../../../_components/QuizForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Course Quiz | Admin',
  description: 'Configure ClassMarker quiz for course',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseQuizAdminPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const [course, modules] = await Promise.all([
    db.findCourseById(id),
    db.findModulesForCourse(id),
  ]);

  if (!course) notFound();

  const lessons = modules.flatMap((m) => m.lessons);
  const quizLesson = lessons.find((l) => l.lesson_type === 'quiz') || null;

  return (
    <section className='bg-gradient-to-br from-mint to-white pt-12 pb-24 md:pb-28'>
      <div className='container'>
        <div className='mb-12'>
          <Link
            href={`/digital/admin/training/courses/${course.id}`}
            className='mb-6 inline-block text-sm text-leaf-700 hover:text-leaf-900'
          >
            ← Back to Course
          </Link>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h1 className='font-display mb-4 text-2xl font-bold text-brand md:text-4xl'>
                Quiz
              </h1>
              <p className='text-lg text-leaf-700'>{course.title}</p>
            </div>
            <Link
              href={`/digital/training/${course.slug}`}
              className='btn btn-primary'
            >
              View Course
            </Link>
          </div>
        </div>

        <div className='card mb-6 p-6'>
          <h2 className='mb-2 text-lg font-bold text-brand'>
            ClassMarker Quiz
          </h2>
          <p className='mb-6 text-sm text-leaf-600'>
            Connect a ClassMarker test to this course. The quiz opens on
            ClassMarker as the final assessment after all lessons are completed.
          </p>
          <QuizForm
            courseId={course.id}
            courseSlug={course.slug}
            quizLesson={quizLesson}
          />
        </div>

        {quizLesson && quizLesson.quiz_id && (
          <div className='card p-6'>
            <h2 className='mb-2 text-lg font-bold text-brand'>
              How it works
            </h2>
            <ol className='ml-5 list-decimal space-y-2 text-sm text-leaf-600'>
              <li>
                Students complete all video lessons in the course curriculum.
              </li>
              <li>
                A <strong>Take Assessment</strong> button appears on the course
                page.
              </li>
              <li>
                Students open the ClassMarker quiz in a new tab from a dedicated
                assessment page.
              </li>
              <li>
                Results are received via webhook and the lesson marks as
                complete.
              </li>
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
