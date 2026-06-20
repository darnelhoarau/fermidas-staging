'use client';

import { useState } from 'react';
import { SidebarLeftIcon } from 'hugeicons-react';
import { CourseCurriculum, type CurriculumModule } from './CourseCurriculum';
import { CourseProgressBar } from './CourseProgressBar';

export function LessonSidebar({
  courseSlug,
  modules,
  completedLessonIds,
  activeLessonId,
  progressPercent,
}: {
  courseSlug: string;
  modules: CurriculumModule[];
  completedLessonIds: string[];
  activeLessonId: string;
  progressPercent: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen((value) => !value)}
        className='btn btn-ghost mb-4 lg:hidden'
      >
        <SidebarLeftIcon className='h-5 w-5' />
        Curriculum
      </button>

      <aside
        className={`${
          open ? 'block' : 'hidden'
        } lg:block lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto`}
      >
        <div className='card mb-4 p-5'>
          <CourseProgressBar
            percent={progressPercent}
            label='Course progress'
          />
        </div>
        <CourseCurriculum
          courseSlug={courseSlug}
          modules={modules}
          canAccessCourse
          completedLessonIds={completedLessonIds}
          activeLessonId={activeLessonId}
          linkLessons
        />
      </aside>
    </>
  );
}
