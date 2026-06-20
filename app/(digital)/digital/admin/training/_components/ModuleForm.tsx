'use client';

import { useState } from 'react';

export function ModuleForm({
  courseId,
  onSaved,
}: {
  courseId: string;
  onSaved: () => void;
}) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(
        `/api/admin/training/courses/${courseId}/modules`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.get('title'),
            description: formData.get('description') || null,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Could not create module');
      }

      form.reset();
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create module');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {error && (
        <div className='mb-3 rounded-lg bg-error/10 p-3 text-sm text-error'>
          {error}
        </div>
      )}
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        className='grid gap-3 md:grid-cols-[1fr,1fr,auto]'
      >
        <input
          name='title'
          required
          placeholder='Module title'
          className='rounded-lg border border-leaf-300 px-4 py-2 text-brand'
        />
        <input
          name='description'
          placeholder='Optional description'
          className='rounded-lg border border-leaf-300 px-4 py-2 text-brand'
        />
        <button
          type='submit'
          disabled={saving}
          className='btn btn-primary px-4 py-2 text-sm'
        >
          {saving ? 'Adding...' : 'Add Module'}
        </button>
      </form>
    </div>
  );
}
