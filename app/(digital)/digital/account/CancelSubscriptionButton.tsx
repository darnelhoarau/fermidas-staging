'use client';

import { useState, useTransition } from 'react';
import { cancelSubscription } from './actions';

interface CancelSubscriptionButtonProps {
  subscriptionId: string;
}

export function CancelSubscriptionButton({
  subscriptionId,
}: CancelSubscriptionButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError('');
    startTransition(async () => {
      const result = await cancelSubscription(subscriptionId);
      if (result.error) {
        setError(result.error);
        setConfirming(false);
      }
    });
  };

  if (isPending) {
    return (
      <span className='text-sm text-leaf-500'>Cancelling subscription…</span>
    );
  }

  if (confirming) {
    return (
      <div className='flex items-center gap-3'>
        <span className='text-sm text-leaf-700'>Are you sure?</span>
        <button
          onClick={handleConfirm}
          className='text-sm font-semibold text-error hover:underline'
        >
          Yes, cancel
        </button>
        <button
          onClick={() => setConfirming(false)}
          className='text-sm text-leaf-600 hover:underline'
        >
          Keep subscription
        </button>
        {error && <span className='text-sm text-error'>{error}</span>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className='text-sm text-error hover:underline'
    >
      Cancel Subscription
    </button>
  );
}
