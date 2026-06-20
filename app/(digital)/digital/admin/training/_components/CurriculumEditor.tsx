'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Add01Icon, Delete02Icon, Edit02Icon } from 'hugeicons-react';
import { ModuleForm } from './ModuleForm';
import { LessonForm } from './LessonForm';
import type { TrainingResourceUrl } from '@/lib/training-utils';

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description?: string | null;
  video_url?: string | null;
  video_duration_seconds: number;
  resource_urls: TrainingResourceUrl[];
  is_preview: boolean;
  sort: number;
}

interface Module {
  id: string;
  title: string;
  description?: string | null;
  sort: number;
  lessons: Lesson[];
}

export function CurriculumEditor({
  courseId,
  modules,
}: {
  courseId: string;
  modules: Module[];
}) {
  const router = useRouter();
  const [addingLessonToModule, setAddingLessonToModule] = useState<
    string | null
  >(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState('');

  function refresh() {
    setAddingLessonToModule(null);
    setEditingLesson(null);
    router.refresh();
  }

  async function updateModule(
    moduleId: string,
    payload: Record<string, unknown>,
  ) {
    const response = await fetch(
      `/api/admin/training/courses/${courseId}/modules/${moduleId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) throw new Error('Could not update module');
  }

  async function updateLesson(
    lessonId: string,
    payload: Record<string, unknown>,
  ) {
    const response = await fetch(
      `/api/admin/training/courses/${courseId}/lessons/${lessonId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) throw new Error('Could not update lesson');
  }

  async function deleteModule(moduleId: string) {
    if (!confirm('Delete this module and all lessons inside it?')) return;
    setError('');
    const response = await fetch(
      `/api/admin/training/courses/${courseId}/modules/${moduleId}`,
      { method: 'DELETE' },
    );
    if (!response.ok) {
      setError('Could not delete module');
      return;
    }
    refresh();
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm('Delete this lesson?')) return;
    setError('');
    const response = await fetch(
      `/api/admin/training/courses/${courseId}/lessons/${lessonId}`,
      { method: 'DELETE' },
    );
    if (!response.ok) {
      setError('Could not delete lesson');
      return;
    }
    refresh();
  }

  async function renameModule(module: Module) {
    const title = prompt('Module title', module.title);
    if (!title || title === module.title) return;
    try {
      await updateModule(module.id, { title });
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not rename module');
    }
  }

  async function moveModule(moduleId: string, direction: 'up' | 'down') {
    const currentIndex = modules.findIndex((module) => module.id === moduleId);
    const targetIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= modules.length) return;

    const ordered = [...modules];
    [ordered[currentIndex], ordered[targetIndex]] = [
      ordered[targetIndex],
      ordered[currentIndex],
    ];

    try {
      await Promise.all(
        ordered.map((module, index) =>
          updateModule(module.id, { sort: index }),
        ),
      );
      refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not reorder modules',
      );
    }
  }

  async function moveLesson(
    module: Module,
    lessonId: string,
    direction: 'up' | 'down',
  ) {
    const currentIndex = module.lessons.findIndex(
      (lesson) => lesson.id === lessonId,
    );
    const targetIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= module.lessons.length) return;

    const ordered = [...module.lessons];
    [ordered[currentIndex], ordered[targetIndex]] = [
      ordered[targetIndex],
      ordered[currentIndex],
    ];

    try {
      await Promise.all(
        ordered.map((lesson, index) =>
          updateLesson(lesson.id, { sort: index }),
        ),
      );
      refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not reorder lessons',
      );
    }
  }

  return (
    <div className='space-y-8'>
      <div className='card p-6'>
        <h2 className='mb-4 text-xl font-bold text-brand'>Add Module</h2>
        <ModuleForm courseId={courseId} onSaved={refresh} />
      </div>

      {error && (
        <div className='rounded-xl bg-error/10 p-4 text-sm text-error'>
          {error}
        </div>
      )}

      <div className='space-y-6'>
        {modules.map((module, moduleIndex) => (
          <div key={module.id} className='card overflow-hidden'>
            <div className='flex flex-col gap-4 border-b border-leaf-100 p-5 md:flex-row md:items-center md:justify-between'>
              <div>
                <h3 className='text-lg font-bold text-brand'>{module.title}</h3>
                {module.description && (
                  <p className='mt-1 text-sm text-leaf-600'>
                    {module.description}
                  </p>
                )}
              </div>
              <div className='flex flex-wrap gap-2'>
                <button
                  type='button'
                  onClick={() => moveModule(module.id, 'up')}
                  disabled={moduleIndex === 0}
                  className='rounded-lg border border-leaf-200 px-3 py-2 text-sm text-brand disabled:opacity-40'
                >
                  Up
                </button>
                <button
                  type='button'
                  onClick={() => moveModule(module.id, 'down')}
                  disabled={moduleIndex === modules.length - 1}
                  className='rounded-lg border border-leaf-200 px-3 py-2 text-sm text-brand disabled:opacity-40'
                >
                  Down
                </button>
                <button
                  type='button'
                  onClick={() => renameModule(module)}
                  className='rounded-lg border border-leaf-200 px-3 py-2 text-sm text-brand'
                >
                  <Edit02Icon className='h-4 w-4' />
                </button>
                <button
                  type='button'
                  onClick={() => deleteModule(module.id)}
                  className='rounded-lg border border-error/30 px-3 py-2 text-sm text-error'
                >
                  <Delete02Icon className='h-4 w-4' />
                </button>
              </div>
            </div>

            <div className='divide-y divide-leaf-100'>
              {module.lessons.map((lesson, lessonIndex) => (
                <div key={lesson.id} className='p-5'>
                  {editingLesson?.id === lesson.id ? (
                    <LessonForm
                      courseId={courseId}
                      moduleId={module.id}
                      lesson={editingLesson}
                      onSaved={refresh}
                      onCancel={() => setEditingLesson(null)}
                    />
                  ) : (
                    <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                      <div>
                        <div className='font-semibold text-brand'>
                          {lesson.title}
                        </div>
                        <div className='mt-1 text-sm text-leaf-600'>
                          {lesson.is_preview ? 'Preview lesson' : 'Paid lesson'}{' '}
                          · {Math.round(lesson.video_duration_seconds / 60)} min
                        </div>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        <button
                          type='button'
                          onClick={() => moveLesson(module, lesson.id, 'up')}
                          disabled={lessonIndex === 0}
                          className='rounded-lg border border-leaf-200 px-3 py-2 text-sm text-brand disabled:opacity-40'
                        >
                          Up
                        </button>
                        <button
                          type='button'
                          onClick={() => moveLesson(module, lesson.id, 'down')}
                          disabled={lessonIndex === module.lessons.length - 1}
                          className='rounded-lg border border-leaf-200 px-3 py-2 text-sm text-brand disabled:opacity-40'
                        >
                          Down
                        </button>
                        <button
                          type='button'
                          onClick={() => setEditingLesson(lesson)}
                          className='rounded-lg border border-leaf-200 px-3 py-2 text-sm text-brand'
                        >
                          <Edit02Icon className='h-4 w-4' />
                        </button>
                        <button
                          type='button'
                          onClick={() => deleteLesson(lesson.id)}
                          className='rounded-lg border border-error/30 px-3 py-2 text-sm text-error'
                        >
                          <Delete02Icon className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className='bg-leaf-50 p-5'>
              {addingLessonToModule === module.id ? (
                <LessonForm
                  courseId={courseId}
                  moduleId={module.id}
                  onSaved={refresh}
                  onCancel={() => setAddingLessonToModule(null)}
                />
              ) : (
                <button
                  type='button'
                  onClick={() => setAddingLessonToModule(module.id)}
                  className='btn btn-ghost px-4 py-2 text-sm'
                >
                  <Add01Icon className='h-4 w-4' />
                  Add Lesson
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
