'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Status = 'idle' | 'processing' | 'success' | 'exists' | 'error';

export function PaymentSuccessHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const processPayment = useCallback(async (orderId: string) => {
    setStatus('processing');
    setMessage('Enrolling you now...');

    try {
      const res = await fetch('/api/payments/mpgs/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Access granted! You can now start your course.');
      } else if (res.status === 403) {
        setStatus('error');
        setMessage('Payment confirmation is currently disabled. Contact support.');
        return;
      } else if (res.status === 409 || data.error?.includes('already')) {
        setStatus('exists');
        setMessage('You already have access to this course.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Refresh the page to try again.');
        return;
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
    const payment = searchParams.get('payment');
    const result = searchParams.get('result');
    const orderId = searchParams.get('order.id');

    if (payment === 'success' && orderId && result === 'success') {
      processPayment(orderId);
    }
  }, [searchParams, processPayment]);

  if (status === 'idle') return null;

  const colors = {
    processing: 'border-leaf-200 bg-leaf-50 text-leaf-800',
    success: 'border-green-300 bg-green-50 text-green-800',
    exists: 'border-amber-300 bg-amber-50 text-amber-800',
    error: 'border-red-300 bg-red-50 text-red-800',
  } as const;

  const icons = {
    processing: '⏳',
    success: '✅',
    exists: 'ℹ️',
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
