import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import { isPaymentEnabled, isPaymentExempt } from '@/lib/payment-config';
import { formatPrice, TRAINING_PRODUCT_SLUG } from '@/lib/training-utils';
import { Section } from '@/components/Section';
import { Button } from '@/components/Button';
import { CourseCatalog } from '@/components/training/CourseCatalog';
import {
  Certificate01Icon,
  CheckmarkCircle01Icon,
  GraduateMaleIcon,
  Video01Icon,
} from 'hugeicons-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Fermidas Training | Digital Courses',
  description:
    'Self-paced compliance, governance and regulatory training courses.',
};

export default async function TrainingCatalogPage() {
  const session = await auth();
  const product = await db.findProductBySlug(TRAINING_PRODUCT_SLUG);

  if (!product) {
    return (
      <section className='bg-gradient-to-br from-mint to-white py-24'>
        <div className='container'>
          <div className='card p-8 text-center text-leaf-700'>
            Training product is not configured. Run the training schema
            migration to enable the catalog.
          </div>
        </div>
      </section>
    );
  }

  const paymentEnabled = isPaymentEnabled();
  const [courses, plans, enrollments, subscription] = await Promise.all([
    db.findAllPublishedCourses(),
    paymentEnabled ? db.findPlansForProduct(product.id) : Promise.resolve([]),
    session?.user
      ? db.findUserEnrollments(session.user.id)
      : Promise.resolve([]),
    session?.user && paymentEnabled
      ? db.findActiveTrainingSubscription(session.user.id)
      : Promise.resolve(null),
  ]);

  const passPlan = plans.find(
    (plan: { interval: string; course_id?: string | null }) =>
      plan.interval === 'MONTH' && !plan.course_id,
  );
  const hasTrainingPass =
    !paymentEnabled || isPaymentExempt(session?.user ?? null) || !!subscription;
  const enrolledCourseSlugs = hasTrainingPass
    ? courses.map((course) => course.slug)
    : enrollments.map((enrollment) => enrollment.slug);

  return (
    <>
      <section className='bg-gradient-to-br from-mint to-white py-20 md:py-28'>
        <div className='container'>
          <div className='grid gap-12 lg:grid-cols-[1.2fr,0.8fr] lg:items-center'>
            <div>
              <p className='kicker mb-4'>Digital Training</p>
              <h1 className='font-display mb-6 text-4xl font-bold leading-tight text-brand md:text-6xl'>
                Fermidas Training
              </h1>
              <p className='max-w-3xl text-lg leading-relaxed text-leaf-700 md:text-xl'>
                Practical self-paced courses for compliance, governance and
                regulatory professionals working in Seychelles and cross-border
                financial services.
              </p>
              <div className='mt-8 flex flex-wrap gap-3 text-sm font-semibold text-leaf-700'>
                <span className='inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-leaf-100'>
                  <Video01Icon className='h-4 w-4' />
                  Video lessons
                </span>
                <span className='inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-leaf-100'>
                  <GraduateMaleIcon className='h-4 w-4' />
                  Expert-led
                </span>
                <span className='inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-leaf-100'>
                  <Certificate01Icon className='h-4 w-4' />
                  Completion tracking
                </span>
              </div>
            </div>

            <div className='card p-6'>
              {hasTrainingPass ? (
                <div className='flex items-start gap-4'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10'>
                    <CheckmarkCircle01Icon className='h-6 w-6 text-success' />
                  </div>
                  <div>
                    <h2 className='font-display text-xl font-bold text-brand'>
                      Full training access
                    </h2>
                    <p className='mt-2 text-sm leading-relaxed text-leaf-700'>
                      You can access every published course in the training
                      catalog.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className='font-display text-xl font-bold text-brand'>
                    Training Pass
                  </h2>
                  <p className='mt-2 text-sm leading-relaxed text-leaf-700'>
                    One subscription for every published training course.
                  </p>
                  {passPlan && (
                    <div className='mt-5'>
                      <div className='text-3xl font-bold text-brand'>
                        {formatPrice(passPlan.currency, passPlan.price_minor)}
                        <span className='text-base font-medium text-leaf-600'>
                          /month
                        </span>
                      </div>
                      <Button
                        href='/digital/checkout?product=training&plan=pass'
                        className='mt-5 w-full'
                      >
                        Get Training Pass
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Section title='Course Catalog' className='bg-white'>
        {courses.length > 0 ? (
          <CourseCatalog
            courses={courses}
            enrolledCourseSlugs={enrolledCourseSlugs}
          />
        ) : (
          <div className='card mx-auto max-w-2xl p-8 text-center'>
            <h2 className='font-display mb-3 text-2xl font-bold text-brand'>
              Courses are coming soon
            </h2>
            <p className='text-leaf-700'>
              Published courses will appear here as soon as they are available.
            </p>
            {session?.user?.role === 'ADMIN' && (
              <Link
                href='/digital/admin/training/courses/new'
                className='btn btn-primary mt-6'
              >
                Create First Course
              </Link>
            )}
          </div>
        )}
      </Section>
    </>
  );
}
