'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Status = 'idle' | 'processing' | 'success' | 'already_enrolled' | 'error';

export function PaymentSuccessHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const processPayment = useCallback(async () => {
    setStatus('processing');
    setMessage('Enrolling you now...');

    try {
      const res = await fetch('/api/payments/mpgs/confirm', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Access granted! You can now start your course.');
      } else if (res.status === 403) {
        setStatus('error');
        setMessage('Payment confirmation is currently disabled. Contact support.');
        return; // don't clean URL — retry on refresh
      } else if (res.status === 404) {
        setStatus('already_enrolled');
        setMessage(data.error || 'Already enrolled — you have access.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Refresh the page to try again.');
        return; // don't clean URL — retry on refresh
      }

      // Clean URL params so refresh doesn't re-process
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      url.searchParams.delete('result');
      url.searchParams.delete('order.id');
      router.replace(url.pathname + url.search);
    } catch {
      setStatus('error');
      setMessage('Network error. Refresh the page to try again.');
    }
  }, [router]);

  useEffect(() => {
    if (searchParams.get('payment') === 'success' && status === 'idle') {
      processPayment();
    }
  }, [searchParams, processPayment, status]);

  if (status === 'idle') return null;

  const colors = {
    processing: 'border-leaf-200 bg-leaf-50 text-leaf-800',
    success: 'border-green-300 bg-green-50 text-green-800',
    already_enrolled: 'border-amber-300 bg-amber-50 text-amber-800',
    error: 'border-red-300 bg-red-50 text-red-800',
  } as const;

  const icons = {
    processing: '⏳',
    success: '✅',
    already_enrolled: 'ℹ️',
    error: '❌',
  };

  return (
    <div className={`mb-8 rounded-2xl border-2 p-6 ${colors[status]}`}>
      <p className="text-base font-semibold">
        <span className="mr-2">{icons[status]}</span>
        {message}
      </p>
    </div>
  );
}
