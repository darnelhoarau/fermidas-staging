import { cn } from '@/lib/cn';
import { ImageSkeleton } from './ImageSkeleton';

interface SplitProps {
  children: React.ReactNode;
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  reverse?: boolean;
  className?: string;
}

export function Split({
  children,
  image,
  reverse = false,
  className = '',
}: SplitProps) {
  return (
    <div
      className={cn(
        'grid md:grid-cols-2 gap-12 md:gap-16 items-center',
        reverse && 'md:[&>*:first-child]:order-2',
        className
      )}
    >
      <div className='space-y-6'>{children}</div>

      {image && (
        <div className='relative'>
          <ImageSkeleton
            src={image.src}
            alt={image.alt}
            width={image.width || 600}
            height={image.height || 400}
            className='rounded-2xl w-full h-auto'
          />
        </div>
      )}
    </div>
  );
}
