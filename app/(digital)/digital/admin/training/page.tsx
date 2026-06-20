import { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { formatPrice, TRAINING_PRODUCT_SLUG } from '@/lib/training-utils';
import { Container } from '@/components/Container';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Training Admin | Fermidas',
  description: 'Manage Fermidas Training courses and enrollments',
};

export default async function TrainingAdminDashboardPage() {
  await requireAdmin();
  const product = await db.findProductBySlug(TRAINING_PRODUCT_SLUG);

  if (!product) {
    return <div>Training product not found</div>;
  }

  const [
    courses,
    totalCourses,
    totalEnrollments,
    totalCompletions,
    activeSubscribers,
    revenueMinor,
    recentEnrollments,
  ] = await Promise.all([
    db.findCoursesForAdmin(),
    db.countCoursesForProduct(product.id),
    db.countCourseEnrollments(),
    db.countCourseCompletions(),
    db.countActiveSubscribers(product.id),
    db.sumTrainingRevenue(product.id),
    db.findRecentEnrollments(8),
  ]);

  const publishedCourses = courses.filter(
    (course) => course.is_published,
  ).length;

  return (
    <section className='bg-gradient-to-br from-mint to-white pt-12 pb-24 md:pb-28'>
      <Container>
        <div className='mb-12'>
          <h1 className='font-display mb-4 text-2xl font-bold text-brand md:text-4xl'>
            Training Admin
          </h1>
          <p className='text-lg text-leaf-700'>
            Manage courses, curriculum, enrollments, and training revenue.
          </p>
        </div>

        <div className='mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='card p-6'>
            <div className='mb-2 text-3xl font-bold text-brand'>
              {totalCourses}
            </div>
            <div className='text-sm text-leaf-700'>
              Courses ({publishedCourses} published)
            </div>
          </div>
          <div className='card p-6'>
            <div className='mb-2 text-3xl font-bold text-brand'>
              {totalEnrollments}
            </div>
            <div className='text-sm text-leaf-700'>Enrollments</div>
          </div>
          <div className='card p-6'>
            <div className='mb-2 text-3xl font-bold text-brand'>
              {totalCompletions}
            </div>
            <div className='text-sm text-leaf-700'>Completions</div>
          </div>
          <div className='card p-6'>
            <div className='mb-2 text-3xl font-bold text-brand'>
              {formatPrice('SCR', revenueMinor)}
            </div>
            <div className='text-sm text-leaf-700'>
              Course revenue · {activeSubscribers} pass subscribers
            </div>
          </div>
        </div>

        <div className='mb-8'>
          <h2 className='mb-4 text-2xl font-bold text-brand'>Quick Actions</h2>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Link
              href='/digital/admin/training/courses'
              className='card p-6 transition-shadow hover:shadow-lg'
            >
              <h3 className='mb-2 text-lg font-bold text-brand'>
                Manage Courses
              </h3>
              <p className='text-sm text-leaf-700'>
                Create, publish, price, and edit training courses.
              </p>
            </Link>
            <Link
              href='/digital/admin/training/courses/new'
              className='card p-6 transition-shadow hover:shadow-lg'
            >
              <h3 className='mb-2 text-lg font-bold text-brand'>New Course</h3>
              <p className='text-sm text-leaf-700'>
                Add a course landing page and purchase plan.
              </p>
            </Link>
            <Link
              href='/digital/admin/training/enrollments'
              className='card p-6 transition-shadow hover:shadow-lg'
            >
              <h3 className='mb-2 text-lg font-bold text-brand'>Enrollments</h3>
              <p className='text-sm text-leaf-700'>
                View learners, progress, and manual access grants.
              </p>
            </Link>
            <Link
              href='/digital/training'
              className='card p-6 transition-shadow hover:shadow-lg'
            >
              <h3 className='mb-2 text-lg font-bold text-brand'>
                View Catalog
              </h3>
              <p className='text-sm text-leaf-700'>
                Review the learner-facing training catalog.
              </p>
            </Link>
          </div>
        </div>

        <div>
          <h2 className='mb-4 text-2xl font-bold text-brand'>
            Recent Enrollments
          </h2>
          {recentEnrollments.length === 0 ? (
            <div className='card p-6 text-leaf-700'>No enrollments yet.</div>
          ) : (
            <div className='space-y-3'>
              {recentEnrollments.map((enrollment) => (
                <Link
                  key={enrollment.id}
                  href={`/digital/admin/training/courses/${enrollment.course_id}/enrollments`}
                  className='card flex items-center justify-between p-4 transition-shadow hover:shadow-lg'
                >
                  <div>
                    <div className='font-semibold text-brand'>
                      {enrollment.user_name || enrollment.email}
                    </div>
                    <div className='text-sm text-leaf-700'>
                      {enrollment.course_title}
                    </div>
                  </div>
                  <div className='text-sm text-leaf-600'>
                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
