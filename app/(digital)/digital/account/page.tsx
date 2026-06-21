import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import { fromMinorUnits, isPaymentEnabled } from '@/lib/mpgs';
import { isPaymentExempt } from '@/lib/payment-config';
import { progressPercent } from '@/lib/training-utils';
import { CourseProgressBar } from '@/components/training/CourseProgressBar';
import { CancelSubscriptionButton } from './CancelSubscriptionButton';

// Always fetch fresh purchase/subscription data — never serve a cached version
// from before the webhook had a chance to process the payment.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Account | Fermidas Digital',
  description: 'Manage your subscriptions and purchases',
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/digital/auth/signin');
  }

  // Check if payment system is enabled
  const paymentEnabled = isPaymentEnabled();

  // Get user's subscriptions (only if payment enabled)
  const subscriptions = paymentEnabled
    ? await db.findUserSubscriptions(session.user.id)
    : [];

  // Get one-off purchases (only if payment enabled)
  const purchases = paymentEnabled
    ? await db.findUserPurchases(session.user.id)
    : [];

  const enrollments = await db.findUserEnrollments(session.user.id);

  return (
    <section className='bg-gradient-to-br from-mint to-white pt-12 pb-24 md:pb-28'>
      <div className='container'>
        <div className='mb-12'>
          <h1 className='font-display mb-4 text-2xl font-bold text-brand md:text-4xl'>
            My Account
          </h1>
          <p className='text-lg text-leaf-700'>
            {paymentEnabled
              ? 'Manage your subscriptions and view purchase history'
              : '🎉 Free testing mode - All features accessible'}
          </p>
        </div>

        {/* Free Mode Banner */}
        {!paymentEnabled && (
          <div className='mb-8 rounded-2xl border-2 border-leaf-200 bg-leaf-50 p-6'>
            <h2 className='mb-2 text-xl font-bold text-leaf-800'>
              🎉 Free Testing Mode Active
            </h2>
            <p className='text-leaf-700'>
              Payment system is not configured. You have full access to all
              Compliance Watch features for testing purposes. Configure MPGS
              environment variables to enable subscription billing.
            </p>
          </div>
        )}

        {/* Admin full access notice */}
        {paymentEnabled && isPaymentExempt(session.user) && (
          <div className='mb-8 rounded-2xl border-2 border-leaf-200 bg-leaf-50 p-6'>
            <h2 className='mb-2 text-xl font-bold text-leaf-800'>
              Full access (admin)
            </h2>
            <p className='text-leaf-700'>
              You have access to all Compliance Watch content without a
              subscription or purchase.
            </p>
          </div>
        )}

        <div className='grid gap-8 lg:grid-cols-[2fr,1fr]'>
          {/* Main Content */}
          <div className='space-y-8'>
            {/* Courses */}
            <section>
              <h2 className='mb-4 text-2xl font-bold text-brand'>My Courses</h2>
              {enrollments.length === 0 ? (
                <div className='card p-6'>
                  <p className='text-leaf-700'>
                    You are not enrolled in any courses yet.
                  </p>
                  <Link
                    href='/digital/training'
                    className='btn btn-primary mt-5 px-4 py-2 text-sm'
                  >
                    Browse Training
                  </Link>
                </div>
              ) : (
                <div className='grid gap-4 md:grid-cols-2'>
                  {enrollments.map((enrollment) => {
                    const percent = progressPercent(
                      enrollment.completed_lessons || 0,
                      enrollment.total_lessons || 0,
                    );
                    const expiryDate = enrollment.access_expires_at
                      ? new Date(enrollment.access_expires_at)
                      : null;
                    const now = new Date();
                    const isExpired = expiryDate ? expiryDate <= now : false;
                    const daysRemaining = expiryDate
                      ? Math.ceil(
                          (expiryDate.getTime() - now.getTime()) /
                            (1000 * 60 * 60 * 24),
                        )
                      : null;
                    const isExpiringSoon =
                      !isExpired && daysRemaining !== null && daysRemaining <= 7;
                    return (
                      <div key={enrollment.id} className='card p-5'>
                        <div className='mb-4 flex gap-4'>
                          <div className='h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-leaf-100'>
                            {enrollment.thumbnail_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`/api/training/courses/${enrollment.course_id}/cover`}
                                alt=''
                                className='h-full w-full object-cover'
                              />
                            )}
                          </div>
                          <div>
                            <h3 className='font-semibold text-brand'>
                              {enrollment.title}
                            </h3>
                            <p className='mt-1 text-sm text-leaf-600'>
                              {enrollment.instructor_name}
                            </p>
                          </div>
                        </div>
                        {expiryDate && (
                          <div
                            className={`mb-3 rounded-lg px-3 py-2 text-sm font-medium ${
                              isExpired
                                ? 'bg-error/10 text-error'
                                : isExpiringSoon
                                  ? 'bg-warn/10 text-warn'
                                  : 'bg-leaf-50 text-leaf-700'
                            }`}
                          >
                            {isExpired
                              ? 'Access expired'
                              : isExpiringSoon
                                ? `Expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`
                                : `Access expires ${expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                          </div>
                        )}
                        <CourseProgressBar
                          percent={percent}
                          label={`${enrollment.completed_lessons || 0} of ${
                            enrollment.total_lessons || 0
                          } lessons complete`}
                        />
                        <Link
                          href={`/digital/training/${enrollment.slug}/learn`}
                          className='btn btn-primary mt-5 w-full px-4 py-2 text-sm'
                        >
                          Continue
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Subscriptions - Only show if payment enabled */}
            {paymentEnabled && (
              <section>
                <h2 className='mb-4 text-2xl font-bold text-brand'>
                  Subscriptions
                </h2>
                {subscriptions.length === 0 ? (
                  <div className='card p-6'>
                    <p className='text-leaf-700'>
                      You don't have any active subscriptions.
                    </p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className='card p-6'>
                        <div className='mb-4 flex items-start justify-between'>
                          <div>
                            <h3 className='text-xl font-bold text-brand'>
                              {sub.product_name}
                            </h3>
                            <p className='text-sm text-leaf-600'>
                              {sub.plan_name}
                            </p>
                          </div>
                          <span
                            className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                              sub.status === 'ACTIVE'
                                ? 'bg-success/10 text-success'
                                : sub.status === 'PAST_DUE'
                                  ? 'bg-warn/10 text-warn'
                                  : 'bg-leaf-100 text-leaf-700'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>

                        <div className='mb-4 grid gap-4 text-sm sm:grid-cols-2'>
                          <div>
                            <div className='text-leaf-600'>Amount</div>
                            <div className='font-semibold'>
                              {sub.currency}{' '}
                              {fromMinorUnits(sub.price_minor).toLocaleString()}{' '}
                              / month
                            </div>
                          </div>
                          <div>
                            <div className='text-leaf-600'>Next Billing</div>
                            <div className='font-semibold'>
                              {new Date(
                                sub.current_period_end,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {sub.status === 'ACTIVE' && (
                          <CancelSubscriptionButton subscriptionId={sub.id} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* One-off Purchases - Only show if payment enabled */}
            {paymentEnabled && (
              <section>
                <h2 className='mb-4 text-2xl font-bold text-brand'>
                  Purchase History
                </h2>
                {purchases.length === 0 ? (
                  <div className='card p-6'>
                    <p className='text-leaf-700'>No purchases yet.</p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {purchases.map((purchase) => {
                      const isCoursePurchase = !!purchase.course_id;
                      const reportDateStr = purchase.report_date
                        ? new Date(purchase.report_date)
                            .toISOString()
                            .slice(0, 10)
                        : null;
                      return (
                        <div
                          key={purchase.id}
                          className='card flex items-center justify-between p-4'
                        >
                          <div>
                            <div className='font-semibold text-brand'>
                              {isCoursePurchase
                                ? purchase.course_title || purchase.plan_name
                                : `${purchase.product_name} - Report`}
                            </div>
                            <div className='text-sm text-leaf-600'>
                              {isCoursePurchase
                                ? 'Training course'
                                : reportDateStr
                                  ? new Date(
                                      purchase.report_date,
                                    ).toLocaleDateString()
                                  : 'One-off purchase'}
                            </div>
                          </div>
                          <div className='flex items-center gap-6'>
                            <div className='text-right'>
                              <div className='font-semibold text-leaf-600'>
                                {purchase.currency}{' '}
                                {fromMinorUnits(
                                  purchase.amount_minor,
                                ).toLocaleString()}
                              </div>
                              <div className='text-sm text-leaf-600'>
                                {new Date(
                                  purchase.created_at,
                                ).toLocaleDateString()}
                              </div>
                            </div>
                            {purchase.status === 'PAID' &&
                              isCoursePurchase &&
                              purchase.course_slug && (
                                <Link
                                  href={`/digital/training/${purchase.course_slug}/learn`}
                                  className='btn btn-primary shrink-0 px-4 py-2 text-sm'
                                >
                                  Continue
                                </Link>
                              )}
                            {purchase.status === 'PAID' &&
                              !isCoursePurchase &&
                              reportDateStr && (
                                <Link
                                  href={`/digital/compliance-watch/reports/${reportDateStr}`}
                                  className='btn btn-primary shrink-0 px-4 py-2 text-sm'
                                >
                                  View Report
                                </Link>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Profile */}
            <div className='card p-6'>
              <h3 className='mb-4 font-bold text-brand'>Profile</h3>
              <div className='space-y-3 text-sm'>
                <div>
                  <div className='text-leaf-600 font-medium'>Name</div>
                  <div className='font-semibold text-brand'>
                    {session.user.name || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className='text-leaf-600 font-medium'>Email</div>
                  <div className='font-semibold text-brand'>
                    {session.user.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className='card p-6'>
              <h3 className='mb-4 font-bold text-brand'>Quick Links</h3>
              <div className='space-y-2 text-sm'>
                <a
                  href='/digital'
                  className='block text-leaf-700 hover:text-leaf-900'
                >
                  Browse Products →
                </a>
                <a
                  href='/contact'
                  className='block text-leaf-700 hover:text-leaf-900'
                >
                  Contact Support →
                </a>
                <form action='/api/auth/signout' method='POST'>
                  <button type='submit' className='text-error hover:underline'>
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
