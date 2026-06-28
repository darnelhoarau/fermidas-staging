'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  email: string;
  user_name: string;
  course_title: string;
  access_expires_at: string | null;
  enrolled_at: string;
  completed_at: string | null;
}

interface Course {
  id: string;
  title: string;
  slug: string;
}

export function EnrollmentManager({ embedded }: { embedded?: boolean }) {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New enrollment form
  const [showForm, setShowForm] = useState(false);
  const [formEmail, setFormEmail] = useState('');
  const [formCourse, setFormCourse] = useState('');
  const [formExpiry, setFormExpiry] = useState('');

  useEffect(() => {
    fetchEnrollments();
    fetch('/api/admin/courses').then(r => r.json()).then(d => setCourses(d.courses || [])).catch(() => {});
  }, [filter]);

  async function fetchEnrollments() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/enrollments?filter=${filter}`);
      const data = await res.json();
      setEnrollments(data.enrollments || []);
    } catch {
      setError('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm('Remove enrollment? Progress is preserved.')) return;
    await fetch(`/api/admin/enrollments/${id}`, { method: 'DELETE' });
    fetchEnrollments();
  }

  async function handleHardDelete(id: string) {
    if (!confirm('Hard delete enrollment AND all progress? Cannot be undone.')) return;
    await fetch(`/api/admin/enrollments/${id}?hard=true`, { method: 'DELETE' });
    fetchEnrollments();
  }

  async function handleCreateEnrollment(e: React.FormEvent) {
    e.preventDefault();
    if (!formEmail || !formCourse) return;
    try {
      const userRes = await fetch('/api/admin/users');
      const userData = await userRes.json();
      const user = (userData.users || []).find((u: { email: string }) => u.email === formEmail);
      if (!user) { setError('User not found'); return; }
      const res = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, courseId: formCourse, accessExpiresAt: formExpiry || null }),
      });
      if (!res.ok) throw new Error('Enrollment failed');
      setShowForm(false);
      setFormEmail('');
      setFormCourse('');
      setFormExpiry('');
      fetchEnrollments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrollment failed');
    }
  }

  const tabs = ['all', 'active', 'expired', 'unlimited'];

  return (
    <div className={embedded ? '' : 'space-y-6'}>
      <div className='flex items-center justify-between'>
        {embedded ? (
          <h2 className='text-lg font-bold text-brand'>Enrollments</h2>
        ) : (
          <h1 className='text-2xl font-bold text-brand'>Enrollments</h1>
        )}
        <button onClick={() => setShowForm(!showForm)} className='btn btn-primary px-4 py-2 text-sm'>
          + Enroll User
        </button>
      </div>

      {error && (
        <div className='rounded-lg bg-red-50 p-4 text-sm text-red-700'>{error}</div>
      )}

      <div className='flex gap-1'>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 text-sm rounded-t-lg ${filter === t ? 'bg-white text-brand font-semibold border-b-2 border-brand' : 'bg-leaf-50 text-leaf-600 hover:bg-leaf-100'}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleCreateEnrollment} className='card p-6'>
          <div className='flex flex-wrap gap-4'>
            <div>
              <label className='mb-1 block text-sm font-semibold text-leaf-700'>User Email</label>
              <input
                type='email'
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                className='rounded-lg border border-leaf-200 p-3 text-sm'
                required
                placeholder='user@example.com'
              />
            </div>
            <div>
              <label className='mb-1 block text-sm font-semibold text-leaf-700'>Course</label>
              <select
                value={formCourse}
                onChange={e => setFormCourse(e.target.value)}
                className='rounded-lg border border-leaf-200 p-3 text-sm'
                required
              >
                <option value=''>Select course...</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className='mb-1 block text-sm font-semibold text-leaf-700'>Expiry (optional)</label>
              <input
                type='datetime-local'
                value={formExpiry}
                onChange={e => setFormExpiry(e.target.value)}
                className='rounded-lg border border-leaf-200 p-3 text-sm'
              />
            </div>
            <div className='flex items-end gap-2'>
              <button type='submit' className='btn btn-primary px-4 py-3 text-sm'>Enroll</button>
              <button type='button' onClick={() => setShowForm(false)} className='btn btn-ghost px-4 py-3 text-sm'>Cancel</button>
            </div>
          </div>
        </form>
      )}

      <div className='card overflow-hidden'>
        {loading ? (
          <div className='p-8 text-center text-leaf-600'>Loading...</div>
        ) : enrollments.length === 0 ? (
          <div className='p-8 text-center text-leaf-600'>No enrollments found.</div>
        ) : (
          <table className='w-full text-left'>
            <thead>
              <tr className='border-b border-leaf-100 bg-leaf-50'>
                <th className='p-4 text-sm font-semibold text-leaf-700'>User</th>
                <th className='p-4 text-sm font-semibold text-leaf-700'>Course</th>
                <th className='p-4 text-sm font-semibold text-leaf-700'>Status</th>
                <th className='p-4 text-sm font-semibold text-leaf-700'>Expiry</th>
                <th className='p-4 text-sm font-semibold text-leaf-700'>Enrolled</th>
                <th className='p-4 text-sm font-semibold text-leaf-700' />
              </tr>
            </thead>
            <tbody>
              {enrollments.map(e => {
                const expired = e.access_expires_at && new Date(e.access_expires_at) < new Date();
                const unlimited = !e.access_expires_at;
                return (
                  <tr key={e.id} className='border-b border-leaf-100 last:border-0 hover:bg-leaf-50/50'>
                    <td className='p-4 text-sm font-medium text-brand'>{e.email}</td>
                    <td className='p-4 text-sm text-leaf-700'>{e.course_title}</td>
                    <td className='p-4'>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${expired ? 'bg-red-100 text-red-700' : unlimited ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {expired ? 'Expired' : unlimited ? 'Unlimited' : 'Active'}
                      </span>
                    </td>
                    <td className='p-4 text-sm text-leaf-700'>
                      {e.access_expires_at ? new Date(e.access_expires_at).toLocaleDateString('en-US') : 'Unlimited'}
                    </td>
                    <td className='p-4 text-sm text-leaf-600'>
                      {new Date(e.enrolled_at).toLocaleDateString('en-US')}
                    </td>
                    <td className='p-4'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleRemove(e.id)}
                          className='text-xs text-leaf-600 underline hover:text-leaf-900'
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => handleHardDelete(e.id)}
                          className='text-xs text-red-600 underline hover:text-red-800'
                        >
                          Hard Del
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
