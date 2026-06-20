import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import { isPaymentEnabled } from '@/lib/mpgs';
import { isPaymentExempt } from '@/lib/payment-config';
import { CheckoutForm } from './CheckoutForm';

export const metadata: Metadata = {
  title: 'Checkout | Fermidas Digital',
  description: 'Complete your Fermidas Digital payment',
};

interface CheckoutPageProps {
  searchParams: Promise<{ plan?: string; product?: string; course?: string }>;
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/digital/auth/signin?callbackUrl=/digital/checkout');
  }

  const { plan, product: productSlug, course: courseSlug } = await searchParams;
  const paymentEnabled = isPaymentEnabled();

  if (courseSlug) {
    const course = await db.findCourseBySlug(courseSlug);
    if (!course || !course.plan_id || course.price_minor === null) {
      redirect('/digital/training');
    }

    if (isPaymentExempt(session.user) || !paymentEnabled) {
      redirect(`/digital/training/${course.slug}/learn`);
    }

    return (
      <CheckoutForm
        planId={course.plan_id}
        planName={course.plan_name || course.title}
        productName='Fermidas Training'
        priceMinor={course.price_minor}
        currency={course.currency || 'SCR'}
        interval='ONE_OFF'
        courseId={course.id}
        courseTitle={course.title}
        backHref={`/digital/training/${course.slug}`}
      />
    );
  }

  const targetProductSlug =
    productSlug === 'training' ? 'training' : 'compliance-watch';
  const fallbackHref =
    targetProductSlug === 'training'
      ? '/digital/training'
      : '/digital/compliance-watch';

  // Admins and free-mode users already have access.
  if (isPaymentExempt(session.user) || !paymentEnabled) {
    redirect(fallbackHref);
  }

  if (
    !plan ||
    !(
      plan === 'monthly' ||
      plan === 'oneoff' ||
      (targetProductSlug === 'training' && plan === 'pass')
    )
  ) {
    redirect(fallbackHref);
  }

  const product = await db.findProductBySlug(targetProductSlug);
  if (!product) {
    redirect(fallbackHref);
  }

  const plans = await db.findPlansForProduct(product.id);
  const monthlyPlan = plans.find(
    (p: { interval: string; course_id?: string | null }) =>
      p.interval === 'MONTH' && !p.course_id,
  );
  const oneOffPlan = plans.find(
    (p: { interval: string; course_id?: string | null }) =>
      p.interval === 'ONE_OFF' && !p.course_id,
  );

  const selectedPlan =
    plan === 'monthly' || plan === 'pass' ? monthlyPlan : oneOffPlan;

  if (!selectedPlan) {
    redirect(fallbackHref);
  }

  const reportDate =
    targetProductSlug === 'compliance-watch' && plan === 'oneoff'
      ? new Date().toISOString().slice(0, 10)
      : undefined;

  return (
    <CheckoutForm
      planId={selectedPlan.id}
      planName={selectedPlan.name}
      productName={product.name}
      priceMinor={selectedPlan.price_minor}
      currency={selectedPlan.currency}
      interval={selectedPlan.interval}
      reportDate={reportDate}
      backHref={fallbackHref}
    />
  );
}
