import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { EnrollmentTable } from '../../../_components/EnrollmentTable';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Course Enrollments | Admin',
  description: 'Manage course enrollments',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseEnrollmentsPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const [course, courses, enrollments] = await Promise.all([
    db.findCourseById(id),
    db.findCoursesForAdmin(),
    db.findCourseEnrollments(id),
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
          <h1 className='font-display mb-4 text-2xl font-bold text-brand md:text-4xl'>
            Enrollments
          </h1>
          <p className='text-lg text-leaf-700'>{course.title}</p>
        </div>

        <EnrollmentTable
          enrollments={enrollments}
          courses={courses}
          defaultCourseId={course.id}
          csvHref={`/api/admin/training/enrollments?courseId=${course.id}&format=csv`}
        />
      </div>
    </section>
  );
}
