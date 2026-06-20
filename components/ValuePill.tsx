import { cn } from '@/lib/cn';

interface ValuePillProps {
  title: string;
  description: string;
  className?: string;
}

export function ValuePill({
  title,
  description,
  className = '',
}: ValuePillProps) {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-mint border border-leaf-200',
        className
      )}
    >
      <h3 className='font-display text-lg font-semibold text-brand mb-2'>
        {title}
      </h3>
      <p className='text-sm text-leaf-700 leading-relaxed'>{description}</p>
    </div>
  );
}
