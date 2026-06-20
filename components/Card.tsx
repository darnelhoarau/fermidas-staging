import { cn } from '@/lib/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function Card({
  children,
  className = '',
  as: Component = 'div',
}: CardProps) {
  return (
    <Component
      className={cn(
        'rounded-2xl shadow-sm ring-1 ring-black/5 bg-white',
        className
      )}
    >
      {children}
    </Component>
  );
}
