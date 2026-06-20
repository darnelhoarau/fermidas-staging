import Link from 'next/link';
import {
  CheckmarkCircle01Icon,
  LockKeyIcon,
  PlayIcon,
  Time01Icon,
} from 'hugeicons-react';
import { formatDuration } from '@/lib/training-utils';

export interface CurriculumLesson {
  id: string;
  title: string;
  video_duration_seconds: number;
  is_preview: boolean;
}

export interface CurriculumModule {
  id: string;
  title: string;
  description?: string | null;
  lessons: CurriculumLesson[];
}

export function CourseCurriculum({
  courseSlug,
  modules,
  canAccessCourse,
  completedLessonIds = [],
  activeLessonId,
  linkLessons = false,
}: {
  courseSlug: string;
  modules: CurriculumModule[];
  canAccessCourse: boolean;
  completedLessonIds?: string[];
  activeLessonId?: string;
  linkLessons?: boolean;
}) {
  if (modules.length === 0) {
    return (
      <div className='rounded-2xl border border-leaf-100 bg-white p-6 text-leaf-700'>
        Curriculum is being prepared.
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-2xl border border-leaf-100 bg-white'>
      {modules.map((module, index) => (
        <details key={module.id} open={index === 0} className='group'>
          <summary className='flex cursor-pointer items-start justify-between gap-4 border-b border-leaf-100 px-5 py-4 marker:hidden hover:bg-leaf-50'>
            <div>
              <h3 className='font-semibold text-brand'>{module.title}</h3>
              {module.description && (
                <p className='mt-1 text-sm text-leaf-600'>
                  {module.description}
                </p>
              )}
            </div>
            <span className='shrink-0 text-sm text-leaf-600'>
              {module.lessons.length} lesson
              {module.lessons.length === 1 ? '' : 's'}
            </span>
          </summary>

          <div className='divide-y divide-leaf-100'>
            {module.lessons.map((lesson) => {
              const isCompleted = completedLessonIds.includes(lesson.id);
              const canOpen = canAccessCourse || lesson.is_preview;
              const content = (
                <div
                  className={`flex items-center gap-3 px-5 py-3 text-sm ${
                    activeLessonId === lesson.id ? 'bg-mint' : 'bg-white'
                  }`}
                >
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-leaf-50 text-leaf-700'>
                    {isCompleted ? (
                      <CheckmarkCircle01Icon className='h-4 w-4 text-success' />
                    ) : canOpen ? (
                      <PlayIcon className='h-4 w-4' />
                    ) : (
                      <LockKeyIcon className='h-4 w-4' />
                    )}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='font-medium text-brand'>{lesson.title}</div>
                    <div className='mt-1 flex items-center gap-3 text-xs text-leaf-600'>
                      <span className='inline-flex items-center gap-1'>
                        <Time01Icon className='h-3 w-3' />
                        {formatDuration(lesson.video_duration_seconds)}
                      </span>
                      {lesson.is_preview && <span>Preview</span>}
                    </div>
                  </div>
                </div>
              );

              if (linkLessons && canOpen) {
                return (
                  <Link
                    key={lesson.id}
                    href={`/digital/training/${courseSlug}/learn/${lesson.id}`}
                    className='block hover:bg-leaf-50'
                  >
                    {content}
                  </Link>
                );
              }

              return <div key={lesson.id}>{content}</div>;
            })}
          </div>
        </details>
      ))}
    </div>
  );
}
