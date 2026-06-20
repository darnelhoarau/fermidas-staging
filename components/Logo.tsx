import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <Link href='/' className={`inline-flex items-center gap-3 ${className}`}>
      <Image
        src='/fermidas-logo.svg'
        alt='Fermidas'
        width={48}
        height={48}
        className='h-12 w-12'
        priority
      />
      {showText && (
        <span className='font-display text-xl font-bold text-brand'>
          FERMIDAS
        </span>
      )}
    </Link>
  );
}
