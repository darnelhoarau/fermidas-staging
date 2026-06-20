import { cn } from '@/lib/cn';

interface KickerProps {
  children: React.ReactNode;
  className?: string;
}

export function Kicker({ children, className = '' }: KickerProps) {
  return <p className={cn('kicker', className)}>{children}</p>;
}
