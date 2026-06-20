'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/Container';
import { fromMinorUnits } from '@/lib/mpgs-utils';

const TERMS_VERSION = '1.0';

interface CheckoutFormProps {
  planId: string;
  planName: string;
  productName: string;
  priceMinor: number;
  currency: string;
  interval: 'MONTH' | 'ONE_OFF';
  reportDate?: string; // YYYY-MM-DD for one-off
  courseId?: string;
  courseTitle?: string;
  backHref?: string;
}

declare global {
  interface Window {
    Checkout: {
      configure: (config: Record<string, unknown>) => void;
      showPaymentPage: () => void;
    };
  }
}

export function CheckoutForm({
  planId,
  planName,
  productName,
  priceMinor,
  currency,
  interval,
  reportDate,
  courseId,
  courseTitle,
  backHref = '/digital/compliance-watch',
}: CheckoutFormProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/mpgs/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          termsAccepted: true,
          termsVersion: TERMS_VERSION,
          ...(interval === 'ONE_OFF' && reportDate && { reportDate }),
          ...(interval === 'ONE_OFF' && courseId && { courseId }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Checkout failed');
        setLoading(false);
        return;
      }

      // All order + interaction details (including returnUrl/cancelUrl) are already
      // baked into the session server-side. configure() only needs the session ID.
      const script = document.createElement('script');
      script.src = data.checkoutJsUrl as string;
      script.onload = () => {
        window.Checkout.configure({ session: { id: data.sessionId } });
        window.Checkout.showPaymentPage();
      };
      script.onerror = () => {
        setError('Failed to load payment gateway. Please try again.');
        setLoading(false);
      };
      document.head.appendChild(script);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setLoading(false);
    }
  };

  const priceLabel =
    interval === 'MONTH'
      ? `${currency} ${fromMinorUnits(priceMinor)}/month`
      : `${currency} ${fromMinorUnits(priceMinor)} (one-time)`;

  return (
    <section className='section no-top bg-gradient-to-br from-mint to-white'>
      <Container>
        <div className='mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center py-12'>
          <Link
            href={backHref}
            className='mb-6 self-start text-sm text-leaf-700 hover:text-leaf-900'
          >
            ← Back
          </Link>
          <div className='card w-full p-8'>
            <div className='mb-8 text-center'>
              <h1 className='font-display mb-2 text-3xl font-bold text-brand'>
                Checkout
              </h1>
              <p className='text-sm text-leaf-700'>
                {productName} — {planName}
              </p>
              <p className='mt-2 text-xl font-semibold text-brand'>
                {priceLabel}
              </p>
              {interval === 'ONE_OFF' && reportDate && (
                <p className='mt-1 text-sm text-leaf-600'>
                  Report date: {new Date(reportDate).toLocaleDateString()}
                </p>
              )}
              {interval === 'ONE_OFF' && courseTitle && (
                <p className='mt-1 text-sm text-leaf-600'>
                  Course: {courseTitle}
                </p>
              )}
            </div>

            {error && (
              <div className='mb-6 rounded-xl bg-error/10 p-4 text-sm text-error'>
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className='space-y-6'
              aria-label='Checkout form'
            >
              <label className='flex cursor-pointer items-start gap-3'>
                <input
                  type='checkbox'
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className='mt-1 h-4 w-4 rounded border-leaf-300 text-brand focus:ring-brand'
                  aria-describedby='terms-desc'
                />
                <span id='terms-desc' className='text-sm text-leaf-700'>
                  I agree to the{' '}
                  <Link
                    href='/terms'
                    className='font-semibold text-brand underline hover:no-underline'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Terms of Service
                  </Link>{' '}
                  and authorize this payment.
                </span>
              </label>

              <button
                type='submit'
                disabled={loading || !termsAccepted}
                className='btn btn-primary w-full disabled:opacity-50'
              >
                {loading ? 'Redirecting to payment…' : 'Proceed to payment'}
              </button>
            </form>

            <p className='mt-6 text-center text-xs text-leaf-600'>
              You will be redirected to the secure payment page. Your card
              details are never stored on our servers.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
