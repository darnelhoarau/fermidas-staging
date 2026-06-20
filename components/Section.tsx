import { cn } from '@/lib/cn';
import { Container } from './Container';

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
  className?: string;
  as?: React.ElementType;
}

export function Section({
  children,
  title,
  eyebrow,
  className = '',
  as: Component = 'section',
}: SectionProps) {
  return (
    <Component className={cn('py-24 md:py-28', className)}>
      <Container>
        {(title || eyebrow) && (
          <div className='mb-16 text-center'>
            {eyebrow && <p className='kicker mb-4'>{eyebrow}</p>}
            {title && (
              <h2 className='font-display text-4xl md:text-5xl font-bold text-brand'>
                {title}
              </h2>
            )}
          </div>
        )}
        {children}
      </Container>
    </Component>
  );
}
