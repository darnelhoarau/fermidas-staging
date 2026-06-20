import Link from 'next/link';
import {
  ArrowRight01Icon,
  Time01Icon,
  Video01Icon,
  UserGroupIcon,
} from 'hugeicons-react';
import { LevelBadge } from './LevelBadge';
import { formatDuration, formatPrice } from '@/lib/training-utils';

export interface CourseCardData {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  thumbnail_url?: string | null;
  instructor_name: string;
  level: string;
  total_lessons: number;
  total_duration_seconds: number;
  enrollment_count?: number;
  price_minor?: number | null;
  currency?: string | null;
  is_featured?: boolean | null;
}

export function CourseCard({
  course,
  hasAccess = false,
}: {
  course: CourseCardData;
  hasAccess?: boolean;
}) {
  const href = hasAccess
    ? `/digital/training/${course.slug}/learn`
    : `/digital/training/${course.slug}`;
  const coverSrc =
    hasAccess && course.thumbnail_url
      ? `/api/training/courses/${course.id}/cover`
      : null;

  return (
    <Link
      href={href}
      className='card group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg'
    >
      <div className='relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-leaf-100 to-mint'>
        {coverSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverSrc}
            alt=''
            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            <Video01Icon className='h-12 w-12 text-leaf-500' />
          </div>
        )}
        {(course.is_featured || hasAccess) && (
          <div className='absolute left-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap gap-2'>
            {course.is_featured && (
              <span className='rounded-full bg-gold px-3 py-1 text-xs font-semibold text-brand shadow-sm ring-1 ring-gold'>
                Featured
              </span>
            )}
            {hasAccess && (
              <span className='rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-foreground'>
                Enrolled
              </span>
            )}
          </div>
        )}
      </div>

      <div className='flex flex-1 flex-col p-6'>
        <div className='mb-3 flex items-center justify-between gap-3'>
          <LevelBadge level={course.level} />
          <span className='text-sm font-semibold text-brand'>
            {formatPrice(course.currency || 'SCR', course.price_minor)}
          </span>
        </div>

        <h3 className='font-display mb-2 text-xl font-bold leading-snug text-brand'>
          {course.title}
        </h3>
        <p className='mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-leaf-700'>
          {course.short_description}
        </p>

        <div className='mb-5 space-y-2 text-sm text-leaf-600'>
          <div className='flex items-center gap-2'>
            <UserGroupIcon className='h-4 w-4' />
            <span>{course.instructor_name}</span>
          </div>
          <div className='flex items-center gap-2'>
            <Time01Icon className='h-4 w-4' />
            <span>{formatDuration(course.total_duration_seconds)}</span>
          </div>
          <div className='flex items-center gap-2'>
            <Video01Icon className='h-4 w-4' />
            <span>
              {course.total_lessons} lesson
              {course.total_lessons === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div className='mt-auto flex items-center justify-between border-t border-leaf-100 pt-4 text-sm font-semibold text-brand'>
          <span>{hasAccess ? 'Continue course' : 'View course'}</span>
          <ArrowRight01Icon className='h-4 w-4 transition-transform group-hover:translate-x-1' />
        </div>
      </div>
    </Link>
  );
}
