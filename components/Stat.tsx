import { cn } from '@/lib/cn';

interface StatProps {
  value: string | number;
  label: string;
  className?: string;
}

export function Stat({ value, label, className = '' }: StatProps) {
  return (
    <div className={cn('text-center', className)}>
      <div className='font-display text-4xl md:text-5xl font-bold text-brand mb-2'>
        {value}
      </div>
      <p className='text-sm text-leaf-600 font-medium'>{label}</p>
    </div>
  );
}
