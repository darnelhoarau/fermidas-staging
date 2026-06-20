'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function ImageSkeleton({
  src,
  alt,
  className = '',
  width,
  height,
}: ImageSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div
      className={`relative overflow-hidden w-full ${className}`}
      style={width || height ? { height } : undefined}
    >
      {/* Skeleton loader */}
      {isLoading && (
        <div className='absolute inset-0 bg-leaf-200 animate-pulse' />
      )}

      {/* Error state */}
      {hasError && (
        <div className='absolute inset-0 bg-leaf-100 flex items-center justify-center'>
          <div className='text-leaf-400 text-sm'>Image unavailable</div>
        </div>
      )}

      {/* Actual image */}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover w-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
      />
    </div>
  );
}
