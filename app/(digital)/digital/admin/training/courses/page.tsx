import { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { formatDuration, formatPrice } from '@/lib/training-utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Training Courses | Admin',
  description: 'Manage training courses',
};

export default async function TrainingCoursesPage() {
  await requireAdmin();
  const courses = await db.findCoursesForAdmin();

  return (
    <section className='bg-gradient-to-br from-mint to-white pt-12 pb-24 md:pb-28'>
      <div className='container'>
        <div className='mb-12'>
          <Link
            href='/digital/admin/training'
            className='mb-6 inline-block text-sm text-leaf-700 hover:text-leaf-900'
          >
            ← Back to Dashboard
          </Link>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h1 className='font-display mb-4 text-2xl font-bold text-brand md:text-4xl'>
                Courses
              </h1>
              <p className='text-lg text-leaf-700'>
                Create and manage the training catalog.
              </p>
            </div>
            <Link
              href='/digital/admin/training/courses/new'
              className='btn btn-primary'
            >
              New Course
            </Link>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className='card p-8 text-center'>
            <h2 className='font-display mb-3 text-2xl font-bold text-brand'>
              No courses yet
            </h2>
            <p className='mb-6 text-leaf-700'>
              Create your first course to start building the catalog.
            </p>
            <Link
              href='/digital/admin/training/courses/new'
              className='btn btn-primary'
            >
              Create Course
            </Link>
          </div>
        ) : (
          <div className='card overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[900px] text-left text-sm'>
                <thead className='bg-leaf-50 text-leaf-700'>
                  <tr>
                    <th className='px-5 py-3 font-semibold'>Course</th>
                    <th className='px-5 py-3 font-semibold'>Status</th>
                    <th className='px-5 py-3 font-semibold'>Price</th>
                    <th className='px-5 py-3 font-semibold'>Curriculum</th>
                    <th className='px-5 py-3 font-semibold'>Enrollments</th>
                    <th className='px-5 py-3 font-semibold'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-leaf-100'>
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td className='px-5 py-4'>
                        <div className='font-semibold text-brand'>
                          {course.title}
                        </div>
                        <div className='text-leaf-600'>{course.slug}</div>
                      </td>
                      <td className='px-5 py-4'>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            course.is_published
                              ? 'bg-success/10 text-success'
                              : 'bg-leaf-100 text-leaf-700'
                          }`}
                        >
                          {course.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className='px-5 py-4 text-leaf-700'>
                        {formatPrice(
                          course.currency || 'SCR',
                          course.price_minor,
                        )}
                      </td>
                      <td className='px-5 py-4 text-leaf-700'>
                        {course.module_count} modules · {course.total_lessons}{' '}
                        lessons ·{' '}
                        {formatDuration(course.total_duration_seconds)}
                      </td>
                      <td className='px-5 py-4 text-leaf-700'>
                        {course.enrollment_count}
                      </td>
                      <td className='px-5 py-4'>
                        <div className='flex flex-wrap gap-2'>
                          <Link
                            href={`/digital/admin/training/courses/${course.id}`}
                            className='rounded-lg border border-leaf-200 px-3 py-2 font-medium text-brand hover:bg-leaf-50'
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/digital/admin/training/courses/${course.id}/curriculum`}
                            className='rounded-lg border border-leaf-200 px-3 py-2 font-medium text-brand hover:bg-leaf-50'
                          >
                            Curriculum
                          </Link>
                          <Link
                            href={`/digital/admin/training/courses/${course.id}/enrollments`}
                            className='rounded-lg border border-leaf-200 px-3 py-2 font-medium text-brand hover:bg-leaf-50'
                          >
                            Enrollments
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
