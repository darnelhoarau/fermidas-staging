'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function QuizForm({
  courseId,
  courseSlug,
  quizLesson: initial,
}: {
  courseId: string;
  courseSlug: string;
  quizLesson: {
    id: string;
    title: string;
    quiz_id?: string | null;
    quiz_config?: Record<string, unknown>;
  } | null;
}) {
  const router = useRouter();
  const [quizId, setQuizId] = useState(initial?.quiz_id || '');
  const [title, setTitle] = useState(initial?.title || 'Assessment');
  const [delivery, setDelivery] = useState<'embed' | 'redirect'>(
    (initial?.quiz_config as { delivery?: 'embed' | 'redirect' })?.delivery || 'redirect',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'idle' | 'success' | 'removed'>('idle');

  async function handleSave() {
    setSaving(true);
    setError('');
    setMode('idle');

    try {
      const res = await fetch(
        `/api/admin/training/courses/${courseId}/quiz`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizId, title, delivery }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setMode('success');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!confirm('Remove the quiz from this course?')) return;
    setSaving(true);
    setError('');

    try {
      const res = await fetch(
        `/api/admin/training/courses/${courseId}/quiz`,
        {
          method: 'DELETE',
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Remove failed');
      setQuizId('');
      setMode('removed');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed');
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-leaf-300 px-4 py-2.5 text-sm text-leaf-800 bg-white focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20';

  return (
    <div className='space-y-5'>
      {error && (
        <div className='rounded-lg bg-error/10 p-3 text-sm text-error'>
          {error}
        </div>
      )}

      {mode === 'success' && (
        <div className='rounded-lg bg-success/10 p-3 text-sm text-success'>
          Quiz saved successfully.
        </div>
      )}

      {mode === 'removed' && (
        <div className='rounded-lg bg-leaf-100 p-3 text-sm text-leaf-700'>
          Quiz removed from this course.
        </div>
      )}

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-4'>
          <div>
            <label className='mb-1.5 block text-sm font-semibold text-leaf-700'>
              Quiz URL or ID
            </label>
            <input
              type='text'
              value={quizId}
              onChange={(e) => {
                const val = e.target.value;
                const match = val.match(/[?&]quiz=([a-zA-Z0-9_-]+)/);
                setQuizId(match ? match[1] : val);
              }}
              placeholder='Paste URL or just the ID (e.g. 7a66a49e272400f3)'
              className={inputClass}
            />
            <p className='mt-1.5 text-xs text-leaf-500'>
              Paste the full ClassMarker quiz URL and the ID will be extracted
              automatically. You can also type the ID directly.
            </p>
          </div>
          <div>
            <label className='mb-1.5 block text-sm font-semibold text-leaf-700'>
              Delivery
            </label>
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={() => setDelivery('redirect')}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  delivery === 'redirect'
                    ? 'border-leaf-600 bg-leaf-600 text-white'
                    : 'border-leaf-300 bg-white text-leaf-700 hover:bg-leaf-50'
                }`}
              >
                Redirect
              </button>
              <button
                type='button'
                onClick={() => setDelivery('embed')}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  delivery === 'embed'
                    ? 'border-leaf-600 bg-leaf-600 text-white'
                    : 'border-leaf-300 bg-white text-leaf-700 hover:bg-leaf-50'
                }`}
              >
                Embed
              </button>
            </div>
            <p className='mt-1.5 text-xs text-leaf-500'>
              Redirect opens ClassMarker in a new tab. Embed shows it directly
              on the page (may have scroll issues).
            </p>
          </div>
        </div>
        <div>
          <label className='mb-1.5 block text-sm font-semibold text-leaf-700'>
            Lesson Title
          </label>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Assessment'
            className={inputClass}
          />
          <p className='mt-1.5 text-xs text-leaf-500'>
            Displayed in the course curriculum sidebar.
          </p>
        </div>
      </div>

      <div className='flex items-center gap-3'>
        <button
          type='button'
          onClick={handleSave}
          disabled={saving || !quizId.trim()}
          className='btn btn-primary'
        >
          {saving ? 'Saving...' : initial ? 'Update Quiz' : 'Add Quiz'}
        </button>
        {initial && (
          <button
            type='button'
            onClick={handleRemove}
            disabled={saving}
            className='btn btn-ghost text-error'
          >
            Remove Quiz
          </button>
        )}
        <a
          href={`https://www.classmarker.com/`}
          target='_blank'
          rel='noopener noreferrer'
          className='ml-auto text-sm text-leaf-500 hover:text-leaf-700'
        >
          Open ClassMarker →
        </a>
      </div>
    </div>
  );
}
