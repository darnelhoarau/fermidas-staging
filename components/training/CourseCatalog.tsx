'use client';

import { useMemo, useState } from 'react';
import { Cancel01Icon, FilterIcon, Search01Icon } from 'hugeicons-react';
import { CourseGrid } from './CourseGrid';
import type { CourseCardData } from './CourseCard';

type CourseStatusFilter = 'all' | 'featured' | 'enrolled' | 'available';

function formatLevel(level: string) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function CourseCatalog({
  courses,
  enrolledCourseSlugs = [],
}: {
  courses: CourseCardData[];
  enrolledCourseSlugs?: string[];
}) {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');
  const [status, setStatus] = useState<CourseStatusFilter>('all');

  const levels = useMemo(
    () =>
      Array.from(
        new Set(courses.map((course) => course.level).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b)),
    [courses],
  );

  const enrolledSet = useMemo(
    () => new Set(enrolledCourseSlugs),
    [enrolledCourseSlugs],
  );

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return courses.filter((course) => {
      const hasAccess = enrolledSet.has(course.slug);
      const searchableText = [
        course.title,
        course.short_description,
        course.instructor_name,
        course.level,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !normalizedQuery || searchableText.includes(normalizedQuery);
      const matchesLevel = level === 'all' || course.level === level;
      const matchesStatus =
        status === 'all' ||
        (status === 'featured' && course.is_featured) ||
        (status === 'enrolled' && hasAccess) ||
        (status === 'available' && !hasAccess);

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [courses, enrolledSet, level, query, status]);

  const hasActiveFilters = query.trim() || level !== 'all' || status !== 'all';

  return (
    <div>
      <div className='mb-8 rounded-2xl border border-leaf-100 bg-leaf-50 p-4'>
        <div className='grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_190px_auto]'>
          <label className='relative block'>
            <span className='sr-only'>Search courses</span>
            <Search01Icon className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-leaf-600' />
            <input
              type='search'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search courses'
              className='w-full rounded-2xl border border-leaf-100 bg-white py-3 pl-12 pr-4 text-brand outline-none transition-colors placeholder:text-leaf-500 focus:border-leaf-500'
            />
          </label>

          <label className='relative block'>
            <span className='sr-only'>Level</span>
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              className='w-full appearance-none rounded-2xl border border-leaf-100 bg-white px-4 py-3 text-brand outline-none transition-colors focus:border-leaf-500'
            >
              <option value='all'>All levels</option>
              {levels.map((courseLevel) => (
                <option key={courseLevel} value={courseLevel}>
                  {formatLevel(courseLevel)}
                </option>
              ))}
            </select>
          </label>

          <label className='relative block'>
            <span className='sr-only'>Course status</span>
            <FilterIcon className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-leaf-600' />
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as CourseStatusFilter)
              }
              className='w-full appearance-none rounded-2xl border border-leaf-100 bg-white py-3 pl-12 pr-4 text-brand outline-none transition-colors focus:border-leaf-500'
            >
              <option value='all'>All courses</option>
              <option value='featured'>Featured</option>
              <option value='enrolled'>Enrolled</option>
              <option value='available'>Available</option>
            </select>
          </label>

          <button
            type='button'
            onClick={() => {
              setQuery('');
              setLevel('all');
              setStatus('all');
            }}
            disabled={!hasActiveFilters}
            className='btn btn-ghost rounded-2xl md:self-stretch disabled:cursor-not-allowed disabled:opacity-40'
          >
            <Cancel01Icon className='h-4 w-4' />
            Clear
          </button>
        </div>

        <div className='mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-leaf-700'>
          <span className='font-medium text-brand'>
            {filteredCourses.length} course
            {filteredCourses.length === 1 ? '' : 's'}
          </span>
          {hasActiveFilters && (
            <button
              type='button'
              onClick={() => {
                setQuery('');
                setLevel('all');
                setStatus('all');
              }}
              className='font-semibold text-leaf-700 hover:text-brand'
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <CourseGrid
          courses={filteredCourses}
          enrolledCourseSlugs={enrolledCourseSlugs}
        />
      ) : (
        <div className='card p-8 text-center'>
          <h2 className='font-display mb-3 text-2xl font-bold text-brand'>
            No courses found
          </h2>
          <p className='text-leaf-700'>
            Try a different search term or filter combination.
          </p>
          <button
            type='button'
            onClick={() => {
              setQuery('');
              setLevel('all');
              setStatus('all');
            }}
            className='btn btn-primary mt-6'
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
