'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckmarkCircle01Icon,
  FileDownloadIcon,
  Video01Icon,
} from 'hugeicons-react';
import type { TrainingResourceUrl } from '@/lib/training-utils';

export function CoursePlayer({
  courseId,
  lessonId,
  title,
  description,
  videoSrc,
  resources = [],
  canTrackProgress,
  initiallyCompleted = false,
}: {
  courseId: string;
  lessonId: string;
  title: string;
  description?: string | null;
  videoSrc?: string | null;
  resources?: TrainingResourceUrl[];
  canTrackProgress: boolean;
  initiallyCompleted?: boolean;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function saveProgress(markComplete: boolean) {
    if (!canTrackProgress || saving || (markComplete && completed)) return;

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/training/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          lessonId,
          watchSeconds: Math.floor(videoRef.current?.currentTime || 0),
          completed: markComplete,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Could not update progress');
      }

      if (markComplete) setCompleted(true);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not update progress',
      );
    } finally {
      setSaving(false);
    }
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || completed || !video.duration || !canTrackProgress) return;

    if (video.currentTime / video.duration >= 0.9) {
      void saveProgress(true);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='overflow-hidden rounded-2xl bg-brand'>
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            controlsList='nodownload'
            className='aspect-video w-full bg-brand'
            onTimeUpdate={handleTimeUpdate}
          />
        ) : (
          <div className='flex aspect-video flex-col items-center justify-center gap-3 text-brand-foreground'>
            <Video01Icon className='h-12 w-12 text-leaf-300' />
            <p className='text-sm text-leaf-100'>Video source not configured</p>
          </div>
        )}
      </div>

      <div className='card p-6'>
        <div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <h1 className='font-display text-2xl font-bold text-brand'>
              {title}
            </h1>
            {description && (
              <p className='mt-3 leading-relaxed text-leaf-700'>
                {description}
              </p>
            )}
          </div>
          {canTrackProgress && (
            <button
              type='button'
              onClick={() => saveProgress(true)}
              disabled={saving || completed}
              className='btn btn-primary shrink-0 disabled:opacity-60'
            >
              <CheckmarkCircle01Icon className='h-5 w-5' />
              {completed ? 'Completed' : saving ? 'Saving...' : 'Mark Complete'}
            </button>
          )}
        </div>

        {error && (
          <div className='mb-4 rounded-xl bg-error/10 p-3 text-sm text-error'>
            {error}
          </div>
        )}

        {resources.length > 0 && (
          <div className='border-t border-leaf-100 pt-5'>
            <h2 className='mb-3 font-semibold text-brand'>Resources</h2>
            <div className='grid gap-3 sm:grid-cols-2'>
              {resources.map((resource) => (
                <a
                  key={`${resource.label}-${resource.url}`}
                  href={resource.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-3 rounded-xl border border-leaf-100 p-3 text-sm font-medium text-brand hover:bg-leaf-50'
                >
                  <FileDownloadIcon className='h-4 w-4 text-leaf-600' />
                  {resource.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
