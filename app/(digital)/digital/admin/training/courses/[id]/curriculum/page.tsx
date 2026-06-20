import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { CurriculumEditor } from '../../../_components/CurriculumEditor';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Course Curriculum | Admin',
  description: 'Manage course modules and lessons',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseCurriculumAdminPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const [course, modules] = await Promise.all([
    db.findCourseById(id),
    db.findModulesForCourse(id),
  ]);

  if (!course) notFound();

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
                Curriculum
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

        <CurriculumEditor courseId={course.id} modules={modules} />
      </div>
    </section>
  );
}
