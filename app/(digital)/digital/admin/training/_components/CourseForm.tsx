'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { CheckmarkCircle01Icon, ImageUploadIcon } from 'hugeicons-react';
import {
  normalizeSlug,
  stringListToText,
  textToStringList,
} from '@/lib/training-utils';
import {
  getImageUploadExtension,
  imageContentType,
  randomUploadToken,
  sanitizeUploadBaseName,
  trainingMediaPath,
} from '@/lib/training-client-upload';

interface CourseFormCourse {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  what_you_learn: string[];
  requirements: string[];
  thumbnail_url?: string | null;
  trailer_url?: string | null;
  instructor_name: string;
  instructor_bio?: string | null;
  instructor_avatar_url?: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  price_minor?: number | null;
  currency?: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort: number;
}

function getAdminCoverPreviewUrl(
  courseId?: string,
  thumbnailUrl?: string | null,
) {
  if (!thumbnailUrl) return '';

  if (courseId && thumbnailUrl.startsWith('vercel-blob://')) {
    return `/api/admin/training/courses/${courseId}/media`;
  }

  return thumbnailUrl;
}

export function CourseForm({ course }: { course?: CourseFormCourse }) {
  const router = useRouter();
  const [title, setTitle] = useState(course?.title || '');
  const [slug, setSlug] = useState(course?.slug || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnail_url || '');
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(
    getAdminCoverPreviewUrl(course?.id, course?.thumbnail_url),
  );
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverUploadMessage, setCoverUploadMessage] = useState('');

  async function handleCoverUpload() {
    if (!course) {
      setError('Create the course before uploading a cover image');
      return;
    }

    if (!coverImageFile) {
      setError('Choose a cover image to upload');
      return;
    }

    setCoverUploading(true);
    setError('');
    setCoverUploadMessage('');

    try {
      const extension = getImageUploadExtension(coverImageFile);

      if (!extension) {
        throw new Error('Only JPG, PNG, or WebP images can be uploaded');
      }

      const uploadToken = randomUploadToken();
      const baseName = sanitizeUploadBaseName(
        coverImageFile.name,
        'training-cover',
      );
      const pathname = trainingMediaPath(
        course.id,
        'covers',
        `${baseName}-${uploadToken}.${extension}`,
      );
      const contentType = imageContentType(extension, coverImageFile.type);

      const blob = await upload(pathname, coverImageFile, {
        access: 'private',
        contentType,
        handleUploadUrl: `/api/admin/training/courses/${course.id}/media/blob-upload`,
        clientPayload: JSON.stringify({
          courseId: course.id,
          kind: 'cover',
        }),
      });

      const response = await fetch(
        `/api/admin/training/courses/${course.id}/media/finalize`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'cover',
            image: {
              pathname: blob.pathname,
              contentType: blob.contentType,
            },
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not upload cover image');
      }

      setThumbnailUrl(data.media.imageUrl);
      setCoverPreviewUrl(data.media.previewUrl || data.media.imageUrl);
      setCoverUploadMessage('Cover image uploaded');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload image');
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const priceMajor = Number(formData.get('priceMajor') || 0);
    const payload = {
      title,
      slug: normalizeSlug(slug || title),
      shortDescription: String(formData.get('shortDescription') || ''),
      description: String(formData.get('description') || ''),
      whatYouLearn: textToStringList(
        String(formData.get('whatYouLearn') || ''),
      ),
      requirements: textToStringList(
        String(formData.get('requirements') || ''),
      ),
      thumbnailUrl,
      trailerUrl: String(formData.get('trailerUrl') || ''),
      instructorName: String(formData.get('instructorName') || ''),
      instructorBio: String(formData.get('instructorBio') || ''),
      instructorAvatarUrl: String(formData.get('instructorAvatarUrl') || ''),
      level: formData.get('level') || 'beginner',
      language: String(formData.get('language') || 'en'),
      priceMinor: Math.round(priceMajor * 100),
      currency: String(formData.get('currency') || 'SCR').toUpperCase(),
      isPublished: formData.get('isPublished') === 'on',
      isFeatured: formData.get('isFeatured') === 'on',
      sort: Number(formData.get('sort') || 0),
    };

    try {
      const response = await fetch(
        course
          ? `/api/admin/training/courses/${course.id}`
          : '/api/admin/training/courses',
        {
          method: course ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not save course');
      }

      if (course) {
        router.refresh();
      } else {
        router.push(
          `/digital/admin/training/courses/${data.course.id}/curriculum`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save course');
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-leaf-300 px-4 py-2 text-brand focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20';
  const labelClass = 'mb-2 block text-sm font-medium text-brand';

  return (
    <form onSubmit={handleSubmit} className='card space-y-8 p-8'>
      {error && (
        <div className='rounded-xl bg-error/10 p-4 text-sm text-error'>
          {error}
        </div>
      )}

      <div className='grid gap-6 md:grid-cols-2'>
        <div>
          <label className={labelClass}>Title</label>
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (!course) setSlug(normalizeSlug(event.target.value));
            }}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input
            value={slug}
            onChange={(event) => setSlug(normalizeSlug(event.target.value))}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Short description</label>
        <input
          name='shortDescription'
          required
          maxLength={240}
          defaultValue={course?.short_description || ''}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          name='description'
          required
          rows={8}
          defaultValue={course?.description || ''}
          className={inputClass}
        />
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <div>
          <label className={labelClass}>What you learn</label>
          <textarea
            name='whatYouLearn'
            rows={6}
            defaultValue={stringListToText(course?.what_you_learn)}
            className={inputClass}
          />
          <p className='mt-2 text-xs text-leaf-600'>One item per line.</p>
        </div>
        <div>
          <label className={labelClass}>Requirements</label>
          <textarea
            name='requirements'
            rows={6}
            defaultValue={stringListToText(course?.requirements)}
            className={inputClass}
          />
          <p className='mt-2 text-xs text-leaf-600'>One item per line.</p>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <div>
          <label className={labelClass}>Price</label>
          <input
            name='priceMajor'
            type='number'
            min='0'
            step='0.01'
            required
            defaultValue={((course?.price_minor || 0) / 100).toFixed(2)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Currency</label>
          <input
            name='currency'
            defaultValue={course?.currency || 'SCR'}
            maxLength={3}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Sort order</label>
          <input
            name='sort'
            type='number'
            min='0'
            defaultValue={course?.sort || 0}
            className={inputClass}
          />
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <div>
          <label className={labelClass}>Thumbnail URL</label>
          <input
            name='thumbnailUrl'
            value={thumbnailUrl}
            onChange={(event) => {
              setThumbnailUrl(event.target.value);
              setCoverPreviewUrl(
                getAdminCoverPreviewUrl(course?.id, event.target.value),
              );
            }}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Trailer URL</label>
          <input
            name='trailerUrl'
            defaultValue={course?.trailer_url || ''}
            className={inputClass}
          />
        </div>
      </div>

      <div className='rounded-xl border border-leaf-200 bg-leaf-50 p-4'>
        <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,320px)] lg:items-start'>
          <div>
            <label className={labelClass}>Custom cover image</label>
            <div className='grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center'>
              <input
                type='file'
                accept='image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp'
                disabled={!course}
                onChange={(event) => {
                  setCoverImageFile(event.target.files?.[0] || null);
                  setCoverUploadMessage('');
                }}
                className='w-full rounded-lg border border-leaf-300 bg-white px-4 py-2 text-sm text-brand file:mr-4 file:rounded-lg file:border-0 file:bg-leaf-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand disabled:cursor-not-allowed disabled:opacity-50'
              />
              <button
                type='button'
                onClick={handleCoverUpload}
                disabled={!course || !coverImageFile || coverUploading}
                className='btn btn-primary rounded-xl disabled:cursor-not-allowed disabled:opacity-50'
              >
                <ImageUploadIcon className='h-4 w-4' />
                {coverUploading ? 'Uploading...' : 'Upload Cover'}
              </button>
            </div>
            <div className='mt-3 min-h-5'>
              {coverUploadMessage && (
                <span className='inline-flex items-center gap-2 text-sm font-medium text-success'>
                  <CheckmarkCircle01Icon className='h-4 w-4' />
                  {coverUploadMessage}
                </span>
              )}
              {!course && (
                <span className='text-sm text-leaf-600'>
                  Available after the course is created.
                </span>
              )}
            </div>
          </div>

          {coverPreviewUrl && (
            <div className='overflow-hidden rounded-xl border border-leaf-100 bg-white'>
              <div className='aspect-video bg-brand'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverPreviewUrl}
                  alt=''
                  className='h-full w-full object-cover'
                />
              </div>
              <div className='px-4 py-3 text-sm font-medium text-leaf-700'>
                Current cover image
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <div>
          <label className={labelClass}>Instructor name</label>
          <input
            name='instructorName'
            required
            defaultValue={course?.instructor_name || ''}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Instructor avatar URL</label>
          <input
            name='instructorAvatarUrl'
            defaultValue={course?.instructor_avatar_url || ''}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Instructor bio</label>
        <textarea
          name='instructorBio'
          rows={4}
          defaultValue={course?.instructor_bio || ''}
          className={inputClass}
        />
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <div>
          <label className={labelClass}>Level</label>
          <select
            name='level'
            defaultValue={course?.level || 'beginner'}
            className={inputClass}
          >
            <option value='beginner'>Beginner</option>
            <option value='intermediate'>Intermediate</option>
            <option value='advanced'>Advanced</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Language</label>
          <input
            name='language'
            defaultValue={course?.language || 'en'}
            className={inputClass}
          />
        </div>
        <div className='flex items-end gap-6 pb-2'>
          <label className='flex items-center gap-3 text-sm font-medium text-brand'>
            <input
              name='isPublished'
              type='checkbox'
              defaultChecked={course?.is_published || false}
              className='h-4 w-4 rounded border-leaf-300 text-leaf-600'
            />
            Published
          </label>
          <label className='flex items-center gap-3 text-sm font-medium text-brand'>
            <input
              name='isFeatured'
              type='checkbox'
              defaultChecked={course?.is_featured || false}
              className='h-4 w-4 rounded border-leaf-300 text-leaf-600'
            />
            Featured
          </label>
        </div>
      </div>

      <div className='flex justify-end border-t border-leaf-100 pt-6'>
        <button type='submit' disabled={saving} className='btn btn-primary'>
          {saving ? 'Saving...' : course ? 'Save Course' : 'Create Course'}
        </button>
      </div>
    </form>
  );
}
