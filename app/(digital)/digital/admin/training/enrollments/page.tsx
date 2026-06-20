import { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { EnrollmentTable } from '../_components/EnrollmentTable';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Training Enrollments | Admin',
  description: 'Manage all training enrollments',
};

export default async function TrainingEnrollmentsPage() {
  await requireAdmin();
  const [courses, enrollments] = await Promise.all([
    db.findCoursesForAdmin(),
    db.findCourseEnrollments(),
  ]);

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
          <h1 className='font-display mb-4 text-2xl font-bold text-brand md:text-4xl'>
            Training Enrollments
          </h1>
          <p className='text-lg text-leaf-700'>
            Track learner progress and grant manual course access.
          </p>
        </div>

        <EnrollmentTable
          enrollments={enrollments}
          courses={courses}
          csvHref='/api/admin/training/enrollments?format=csv'
        />
      </div>
    </section>
  );
}
