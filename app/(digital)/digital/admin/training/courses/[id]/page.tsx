import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { CourseForm } from '../../_components/CourseForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit Training Course | Admin',
  description: 'Edit a training course',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTrainingCoursePage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const course = await db.findCourseById(id);

  if (!course) notFound();

  const normalizedCourse = {
    ...course,
    what_you_learn: Array.isArray(course.what_you_learn)
      ? course.what_you_learn
      : [],
    requirements: Array.isArray(course.requirements) ? course.requirements : [],
  };

  return (
    <section className='bg-gradient-to-br from-mint to-white pt-12 pb-24 md:pb-28'>
      <div className='container'>
        <div className='mb-12'>
          <Link
            href='/digital/admin/training/courses'
            className='mb-6 inline-block text-sm text-leaf-700 hover:text-leaf-900'
          >
            ← Back to Courses
          </Link>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h1 className='font-display mb-4 text-2xl font-bold text-brand md:text-4xl'>
                Edit Course
              </h1>
              <p className='text-lg text-leaf-700'>{course.title}</p>
            </div>
            <div className='flex flex-wrap gap-3'>
              <Link
                href={`/digital/admin/training/courses/${course.id}/curriculum`}
                className='btn btn-ghost'
              >
                Curriculum
              </Link>
              <Link
                href={`/digital/training/${course.slug}`}
                className='btn btn-primary'
              >
                View Course
              </Link>
            </div>
          </div>
        </div>
        <CourseForm course={normalizedCourse} />
      </div>
    </section>
  );
}
