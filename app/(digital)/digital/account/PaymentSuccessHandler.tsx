'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

type Status = 'idle' | 'processing' | 'success' | 'already_enrolled' | 'error';

export function PaymentSuccessHandler() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const processPayment = useCallback(async () => {
    setStatus('processing');

    try {
      const res = await fetch('/api/payments/mpgs/confirm', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Access granted!');

        // Clean URL then redirect after 2s
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        url.searchParams.delete('result');
        url.searchParams.delete('order.id');
        window.history.replaceState(null, '', url.pathname + url.search);

        const redirectUrl = data.redirectUrl || '/digital/account';
        setTimeout(() => { window.location.href = redirectUrl; }, 2000);
      } else if (res.status === 403) {
        setStatus('error');
        setMessage('Payment confirmation is currently disabled.');
      } else if (res.status === 404) {
        setStatus('already_enrolled');
        setMessage(data.error || 'Already enrolled.');
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        url.searchParams.delete('result');
        url.searchParams.delete('order.id');
        window.history.replaceState(null, '', url.pathname + url.search);
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Refresh to retry.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Refresh the page to try again.');
    }
  }, []);

  useEffect(() => {
    if (searchParams.get('payment') === 'success' && status === 'idle') {
      processPayment();
    }
  }, [searchParams, processPayment, status]);

  if (status === 'idle') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-md px-6 text-center">
        {status === 'processing' && (
          <>
            <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-leaf-200 border-t-leaf-600" />
            <p className="text-xl font-semibold text-leaf-700">
              Processing your payment...
            </p>
            <p className="mt-2 text-sm text-leaf-500">
              Please wait while we confirm your enrollment.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xl font-bold text-green-700">{message}</p>
            <p className="mt-2 text-sm text-green-600">
              Redirecting you...
            </p>
          </>
        )}

        {status === 'already_enrolled' && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-10 w-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-amber-700">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-red-700">{message}</p>
            <button
              onClick={() => { setStatus('idle'); processPayment(); }}
              className="mt-6 rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </>
        )}
      </div>
    </div>
  );
}
