'use client';

import { useRouter } from 'next/navigation';
import { PlayIcon, ShoppingCart01Icon } from 'hugeicons-react';

export function EnrollButton({
  hasAccess,
  courseSlug,
  checkoutHref,
  label,
  className = '',
}: {
  hasAccess: boolean;
  courseSlug: string;
  checkoutHref: string;
  label: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type='button'
      onClick={() =>
        router.push(
          hasAccess ? `/digital/training/${courseSlug}/learn` : checkoutHref,
        )
      }
      className={`btn btn-primary w-full ${className}`}
    >
      {hasAccess ? (
        <PlayIcon className='h-5 w-5' />
      ) : (
        <ShoppingCart01Icon className='h-5 w-5' />
      )}
      {hasAccess ? 'Continue Learning' : label}
    </button>
  );
}
