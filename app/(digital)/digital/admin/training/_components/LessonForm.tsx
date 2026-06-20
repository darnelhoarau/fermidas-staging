'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import { CheckmarkCircle01Icon, Upload01Icon } from 'hugeicons-react';
import {
  resourcesToText,
  textToResources,
  type TrainingResourceUrl,
} from '@/lib/training-utils';
import {
  createPosterFromVideo,
  largeUploadThresholdBytes,
  randomUploadToken,
  sanitizeUploadBaseName,
  trainingMediaPath,
} from '@/lib/training-client-upload';

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

export function LessonForm({
  courseId,
  moduleId,
  lesson,
  onSaved,
  onCancel,
}: {
  courseId: string;
  moduleId: string;
  lesson?: Lesson;
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url || '');
  const [durationSeconds, setDurationSeconds] = useState(
    lesson?.video_duration_seconds || 0,
  );
  const [generatedPosterUrl, setGeneratedPosterUrl] = useState('');
  const [useAsCourseCover, setUseAsCourseCover] = useState(true);

  async function handleVideoUpload() {
    if (!videoFile) {
      setError('Choose an MP4 video to upload');
      return;
    }

    setUploading(true);
    setError('');
    setUploadMessage('');

    try {
      const lowerName = videoFile.name.toLowerCase();
      if (videoFile.type !== 'video/mp4' && !lowerName.endsWith('.mp4')) {
        throw new Error('Only MP4 videos can be uploaded');
      }

      const uploadToken = randomUploadToken();
      const baseName = sanitizeUploadBaseName(videoFile.name, 'training-video');
      const videoPathname = trainingMediaPath(
        courseId,
        'videos',
        `${baseName}-${uploadToken}.mp4`,
      );
      const posterPathname = trainingMediaPath(
        courseId,
        'posters',
        `${baseName}-${uploadToken}-poster.jpg`,
      );
      const handleUploadUrl = `/api/admin/training/courses/${courseId}/media/blob-upload`;

      setUploadMessage('Creating video cover...');
      const poster = await createPosterFromVideo(
        videoFile,
        `${baseName}-${uploadToken}-poster.jpg`,
      );

      setUploadMessage('Uploading video...');
      const [videoBlob, posterBlob] = await Promise.all([
        upload(videoPathname, videoFile, {
          access: 'private',
          contentType: 'video/mp4',
          handleUploadUrl,
          multipart: videoFile.size >= largeUploadThresholdBytes,
          clientPayload: JSON.stringify({
            courseId,
            kind: 'video',
          }),
          onUploadProgress: (event) => {
            setUploadMessage(
              `Uploading video ${Math.round(event.percentage)}%`,
            );
          },
        }),
        upload(posterPathname, poster.posterFile, {
          access: 'private',
          contentType: 'image/jpeg',
          handleUploadUrl,
          clientPayload: JSON.stringify({
            courseId,
            kind: 'poster',
          }),
        }),
      ]);

      const response = await fetch(
        `/api/admin/training/courses/${courseId}/media/finalize`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'video',
            video: {
              pathname: videoBlob.pathname,
              contentType: videoBlob.contentType,
            },
            poster: {
              pathname: posterBlob.pathname,
              contentType: posterBlob.contentType,
            },
            durationSeconds: poster.durationSeconds,
            useAsCourseCover,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not upload video');
      }

      setVideoUrl(data.media.videoUrl);
      setDurationSeconds(data.media.durationSeconds || 0);
      setGeneratedPosterUrl(data.media.posterPreviewUrl || '');
      setUploadMessage('Video uploaded');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload video');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const payload = {
      moduleId,
      title: String(formData.get('title') || ''),
      description: String(formData.get('description') || ''),
      videoUrl,
      videoDurationSeconds: durationSeconds,
      resourceUrls: textToResources(String(formData.get('resourceUrls') || '')),
      isPreview: formData.get('isPreview') === 'on',
      sort: Number(formData.get('sort') || 0),
    };

    try {
      const response = await fetch(
        lesson
          ? `/api/admin/training/courses/${courseId}/lessons/${lesson.id}`
          : `/api/admin/training/courses/${courseId}/lessons`,
        {
          method: lesson ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not save lesson');
      }

      onSaved();
      if (!lesson) event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save lesson');
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-leaf-300 px-4 py-2 text-brand focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20';

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-4 rounded-2xl bg-leaf-50 p-4'
    >
      {error && (
        <div className='rounded-lg bg-error/10 p-3 text-sm text-error'>
          {error}
        </div>
      )}
      <div className='grid gap-4 md:grid-cols-2'>
        <input
          name='title'
          required
          placeholder='Lesson title'
          defaultValue={lesson?.title || ''}
          className={inputClass}
        />
        <input
          name='videoUrl'
          type='text'
          placeholder='Video URL'
          value={videoUrl}
          onChange={(event) => setVideoUrl(event.target.value)}
          className={inputClass}
        />
      </div>

      <div className='rounded-xl border border-leaf-200 bg-white p-4'>
        <div className='grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end'>
          <label className='block'>
            <span className='mb-2 block text-sm font-medium text-brand'>
              MP4 video
            </span>
            <input
              type='file'
              accept='video/mp4,.mp4'
              onChange={(event) => {
                setVideoFile(event.target.files?.[0] || null);
                setUploadMessage('');
              }}
              className='w-full rounded-lg border border-leaf-300 bg-white px-4 py-2 text-sm text-brand file:mr-4 file:rounded-lg file:border-0 file:bg-leaf-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand'
            />
          </label>
          <button
            type='button'
            onClick={handleVideoUpload}
            disabled={uploading || !videoFile}
            className='btn btn-primary rounded-xl disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Upload01Icon className='h-4 w-4' />
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </div>
        <div className='mt-3 flex flex-wrap items-center gap-4'>
          <label className='flex items-center gap-3 text-sm font-medium text-brand'>
            <input
              type='checkbox'
              checked={useAsCourseCover}
              onChange={(event) => setUseAsCourseCover(event.target.checked)}
              className='h-4 w-4 rounded border-leaf-300 text-leaf-600'
            />
            Use generated frame as course cover
          </label>
          {uploadMessage && (
            <span className='inline-flex items-center gap-2 text-sm font-medium text-success'>
              <CheckmarkCircle01Icon className='h-4 w-4' />
              {uploadMessage}
            </span>
          )}
        </div>
        {generatedPosterUrl && (
          <div className='mt-4 overflow-hidden rounded-xl border border-leaf-100 bg-leaf-50'>
            <div className='aspect-video bg-brand'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={generatedPosterUrl}
                alt=''
                className='h-full w-full object-cover'
              />
            </div>
            <div className='px-4 py-3 text-sm font-medium text-leaf-700'>
              Generated poster
            </div>
          </div>
        )}
      </div>

      <textarea
        name='description'
        rows={3}
        placeholder='Lesson description'
        defaultValue={lesson?.description || ''}
        className={inputClass}
      />
      <div className='grid gap-4 md:grid-cols-3'>
        <input
          name='durationMinutes'
          type='number'
          min='0'
          step='0.1'
          placeholder='Duration minutes'
          value={
            durationSeconds ? Number((durationSeconds / 60).toFixed(1)) : ''
          }
          onChange={(event) => {
            const minutes = Number(event.target.value || 0);
            setDurationSeconds(Math.max(0, Math.round(minutes * 60)));
          }}
          className={inputClass}
        />
        <input
          name='sort'
          type='number'
          min='0'
          placeholder='Sort'
          defaultValue={lesson?.sort || 0}
          className={inputClass}
        />
        <label className='flex items-center gap-3 rounded-lg border border-leaf-300 bg-white px-4 py-2 text-sm font-medium text-brand'>
          <input
            name='isPreview'
            type='checkbox'
            defaultChecked={lesson?.is_preview || false}
            className='h-4 w-4 rounded border-leaf-300 text-leaf-600'
          />
          Free preview
        </label>
      </div>
      <textarea
        name='resourceUrls'
        rows={3}
        placeholder='Resource label | https://example.com/file.pdf'
        defaultValue={resourcesToText(lesson?.resource_urls)}
        className={inputClass}
      />
      <div className='flex justify-end gap-3'>
        {onCancel && (
          <button type='button' onClick={onCancel} className='btn btn-ghost'>
            Cancel
          </button>
        )}
        <button
          type='submit'
          disabled={saving || uploading}
          className='btn btn-primary'
        >
          {saving ? 'Saving...' : lesson ? 'Save Lesson' : 'Add Lesson'}
        </button>
      </div>
    </form>
  );
}
