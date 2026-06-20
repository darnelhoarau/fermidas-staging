import { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import { fromMinorUnits, isPaymentEnabled } from '@/lib/mpgs';
import { isPaymentExempt } from '@/lib/payment-config';
import { Section } from '@/components/Section';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import {
  CheckmarkCircle01Icon,
  Mail01Icon,
  Globe02Icon,
  FileDownloadIcon,
  CalendarCheckOut01Icon,
  AiLearningIcon,
} from 'hugeicons-react';

export const metadata: Metadata = {
  title: 'Compliance Watch | Fermidas',
  description:
    'Daily monitoring of Seychelles regulatory and legal sources with AI-powered summaries.',
};

export default async function ComplianceWatchPage() {
  const session = await auth();

  const product = await db.findProductBySlug('compliance-watch');

  if (!product) {
    return <div>Product not found</div>;
  }

  const paymentEnabled = isPaymentEnabled();

  const plans = paymentEnabled ? await db.findPlansForProduct(product.id) : [];
  const monthlyPlan = plans.find(
    (p: { interval: string }) => p.interval === 'MONTH'
  );
  const oneOffPlan = plans.find(
    (p: { interval: string }) => p.interval === 'ONE_OFF'
  );

  let hasSubscription =
    !paymentEnabled || isPaymentExempt(session?.user ?? null);
  if (paymentEnabled && session?.user && !isPaymentExempt(session.user)) {
    const subscription = await db.findActiveSubscription(
      session.user.id,
      product.id
    );
    hasSubscription = !!subscription;
  }

  const features = [
    {
      title: 'Daily Automated Monitoring',
      description:
        'We scan 18+ Seychelles sources every day, including regulators, government agencies, and financial institutions.',
      icon: <CalendarCheckOut01Icon className='w-6 h-6 text-leaf-600' />,
    },
    {
      title: 'AI-Powered Summaries',
      description:
        'Advanced extraction and summarization pipeline that highlights key changes, entities, amounts, and deadlines—no hallucinations.',
      icon: <AiLearningIcon className='w-6 h-6 text-leaf-600' />,
    },
    {
      title: 'Categorized Reports',
      description:
        'Updates organized by Legal Watch, Regulatory & Enforcement, Finance Watch, and Financial Institutions.',
      icon: <FileDownloadIcon className='w-6 h-6 text-leaf-600' />,
    },
    {
      title: 'Email Notifications',
      description:
        'Receive a daily digest with direct links to new updates. Always stay informed.',
      icon: <Mail01Icon className='w-6 h-6 text-leaf-600' />,
    },
    {
      title: 'Full Report Archive',
      description:
        'Access historical reports and track compliance changes over time.',
      icon: <CheckmarkCircle01Icon className='w-6 h-6 text-leaf-600' />,
    },
    {
      title: 'Multilingual Support',
      description: 'Reports available in English and French (coming soon).',
      icon: <Globe02Icon className='w-6 h-6 text-leaf-600' />,
    },
  ];

  const faqs = [
    {
      question: 'What sources do you monitor?',
      answer:
        'We monitor Seychelles sources including Financial Services Authority, Central Bank, Financial Intelligence Unit, Ministry of Finance, Official Gazette, Judiciary, National Assembly, and major banks.',
    },
    {
      question: 'How often are reports generated?',
      answer:
        "Reports are generated daily at 06:00 UTC. You'll receive an email notification if there are new updates. You can also access them anytime in your account dashboard.",
    },
    {
      question: 'Can I cancel anytime?',
      answer:
        "Yes, you can cancel your subscription at any time from your account page. You'll retain access until the end of your billing period.",
    },
    {
      question: 'Is my payment secure?',
      answer:
        'Absolutely. We use Nouvobanq Payment Gateway (MPGS) with 3D Secure authentication. Your card details are never stored on our servers.',
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className='py-24 md:py-32 bg-gradient-to-br from-mint to-white'>
        <div className='mx-auto max-w-7xl px-6 md:px-8'>
          <div className='text-center max-w-4xl mx-auto'>
            <p className='text-sm font-medium uppercase tracking-wide text-leaf-700 mb-4'>
              DIGITAL PRODUCTS
            </p>
            <h1 className='font-display text-5xl md:text-6xl font-bold text-brand mb-8 leading-tight'>
              Compliance Watch
            </h1>
            <p className='text-xl text-leaf-700 leading-relaxed mb-8'>
              Daily monitoring of Seychelles regulatory and legal sources with
              AI-powered summaries. Never miss a compliance update.
            </p>

            {hasSubscription && (
              <div className='inline-flex items-center gap-3 rounded-2xl bg-leaf-50 px-6 py-4'>
                <CheckmarkCircle01Icon className='w-6 h-6 text-success' />
                <p className='font-semibold text-leaf-800'>
                  You have an active subscription
                </p>
                <Button
                  href='/digital/compliance-watch/reports'
                  variant='ghost'
                  size='sm'
                >
                  View Reports →
                </Button>
              </div>
            )}

            {!paymentEnabled && !hasSubscription && (
              <div className='inline-flex items-center gap-3 rounded-2xl bg-leaf-50 px-6 py-4'>
                <p className='font-semibold text-leaf-800'>
                  🎉 Free Testing Mode - Full Access Available
                </p>
                <Button
                  href='/digital/compliance-watch/reports'
                  variant='ghost'
                  size='sm'
                >
                  View Reports →
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <Section title='What You Get' eyebrow='Features' className='bg-white'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {features.map(
            (
              feature: {
                title: string;
                description: string;
                icon?: React.ReactNode;
              },
              index: number
            ) => (
              <Card key={index} className='p-6'>
                <div className='w-12 h-12 bg-leaf-100 rounded-xl flex items-center justify-center mb-4'>
                  {feature.icon}
                </div>
                <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                  {feature.title}
                </h3>
                <p className='text-leaf-700 text-sm leading-relaxed'>
                  {feature.description}
                </p>
              </Card>
            )
          )}
        </div>
      </Section>

      {/* Sample Report */}
      <Section
        title='Sample Report'
        eyebrow='See It In Action'
        className='bg-mint'
      >
        <div
          className={`${!hasSubscription && paymentEnabled ? 'blur-sm relative' : ''}`}
        >
          <Card className='p-8 max-w-4xl mx-auto'>
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-display text-2xl font-bold text-brand'>
                  Compliance Watch Daily Report
                </h3>
                <span className='rounded-lg bg-leaf-100 px-3 py-1 text-sm font-semibold text-leaf-800'>
                  20 July 2024
                </span>
              </div>
            </div>

            <div className='space-y-6'>
              <div className='border-b border-leaf-100 pb-6'>
                <h4 className='text-sm font-semibold uppercase tracking-wide text-leaf-600 mb-3'>
                  REGULATORY & ENFORCEMENT WATCH
                </h4>
                <h5 className='font-display text-xl font-semibold text-brand mb-2'>
                  Financial Intelligence Unit
                </h5>
                <h6 className='text-lg font-semibold text-brand mb-3'>
                  Updated AML/CFT Guidelines for Reporting Entities
                </h6>
                <p className='text-leaf-700 mb-4 leading-relaxed'>
                  New customer due diligence thresholds for high-risk
                  jurisdictions. Enhanced reporting requirements for suspicious
                  transactions above SCR 100,000. Deadline for compliance: March
                  31, 2025.
                </p>
                <div className='flex flex-wrap gap-4 text-sm text-leaf-600'>
                  <span>
                    <strong>Entities:</strong> FIU, Central Bank
                  </span>
                  <span>
                    <strong>Amount:</strong> SCR 100,000
                  </span>
                  <span>
                    <strong>Deadline:</strong> March 31, 2025
                  </span>
                </div>
              </div>
            </div>

            <p className='mt-6 text-center text-sm italic text-leaf-600'>
              This is an illustrative example. Actual reports are generated from
              live sources.
            </p>
          </Card>
        </div>

        {!hasSubscription && paymentEnabled && !session?.user && (
          <div className='text-center mt-8'>
            <Button href='/digital/auth/signin' size='lg'>
              Sign In to View Full Reports
            </Button>
          </div>
        )}
      </Section>

      {/* FAQ */}
      <Section title='Frequently Asked Questions' className='bg-white'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto'>
          {faqs.map(
            (faq: { question: string; answer: string }, index: number) => (
              <div key={index}>
                <h3 className='font-display text-lg font-semibold text-brand mb-3'>
                  {faq.question}
                </h3>
                <p className='text-leaf-700 leading-relaxed'>{faq.answer}</p>
              </div>
            )
          )}
        </div>
      </Section>

      {/* Pricing CTA */}
      {paymentEnabled && !hasSubscription && monthlyPlan && oneOffPlan && (
        <Section title='Get Started' eyebrow='Pricing' className='bg-mint'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
            <Card className='p-8 text-center'>
              <h3 className='font-display text-2xl font-bold text-brand mb-4'>
                Monthly Subscription
              </h3>
              <div className='mb-6'>
                <span className='text-4xl font-bold text-brand'>
                  SCR {fromMinorUnits(monthlyPlan.price_minor)}
                </span>
                <span className='text-leaf-600'>/month</span>
              </div>
              <p className='text-leaf-700 mb-8'>
                Unlimited access to daily reports, email alerts, and archive.
              </p>
              <Button
                href={
                  session?.user
                    ? '/digital/checkout?plan=monthly'
                    : '/digital/auth/signin?plan=monthly'
                }
                size='lg'
                className='w-full'
              >
                Subscribe Now
              </Button>
            </Card>

            <Card className='p-8 text-center'>
              <h3 className='font-display text-2xl font-bold text-brand mb-4'>
                Single Report
              </h3>
              <div className='mb-6'>
                <span className='text-4xl font-bold text-brand'>
                  SCR {fromMinorUnits(oneOffPlan.price_minor)}
                </span>
                <span className='text-leaf-600'>/report</span>
              </div>
              <p className='text-leaf-700 mb-8'>
                Instant access to today's Compliance Watch report.
              </p>
              <Button
                href={
                  session?.user
                    ? '/digital/checkout?plan=oneoff'
                    : '/digital/auth/signin?plan=oneoff'
                }
                variant='secondary'
                size='lg'
                className='w-full'
              >
                Buy Today's Report
              </Button>
            </Card>
          </div>

          <p className='text-center text-sm text-leaf-600 mt-8'>
            By subscribing, you agree to our{' '}
            <Link href='/terms' className='underline hover:text-brand'>
              Terms of Service
            </Link>
            .
          </p>
        </Section>
      )}
    </>
  );
}
