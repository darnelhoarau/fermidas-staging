'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CourseProgressBar } from '@/components/training/CourseProgressBar';
import { progressPercent } from '@/lib/training-utils';

interface Enrollment {
  id: string;
  email: string;
  user_name?: string | null;
  course_title: string;
  course_slug: string;
  enrolled_at: string | Date;
  completed_at?: string | Date | null;
  completed_lessons: number;
  total_lessons: number;
}

interface CourseOption {
  id: string;
  title: string;
}

export function EnrollmentTable({
  enrollments,
  courses,
  defaultCourseId,
  csvHref,
}: {
  enrollments: Enrollment[];
  courses: CourseOption[];
  defaultCourseId?: string;
  csvHref: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [courseId, setCourseId] = useState(
    defaultCourseId || courses[0]?.id || '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function createEnrollment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/admin/training/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, courseId }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not create enrollment');
      }

      setEmail('');
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not create enrollment',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className='space-y-6'>
      <div className='card p-6'>
        <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <h2 className='text-xl font-bold text-brand'>Manual Enrollment</h2>
          <Link href={csvHref} className='btn btn-ghost px-4 py-2 text-sm'>
            Export CSV
          </Link>
        </div>

        {error && (
          <div className='mb-4 rounded-lg bg-error/10 p-3 text-sm text-error'>
            {error}
          </div>
        )}

        <form
          onSubmit={createEnrollment}
          className='grid gap-3 md:grid-cols-[1fr,1fr,auto]'
        >
          <input
            type='email'
            required
            placeholder='user@example.com'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className='rounded-lg border border-leaf-300 px-4 py-2 text-brand'
          />
          <select
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            className='rounded-lg border border-leaf-300 px-4 py-2 text-brand'
            disabled={!!defaultCourseId}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <button
            type='submit'
            disabled={saving || !courseId}
            className='btn btn-primary px-4 py-2 text-sm'
          >
            {saving ? 'Adding...' : 'Add Enrollment'}
          </button>
        </form>
      </div>

      <div className='card overflow-hidden'>
        {enrollments.length === 0 ? (
          <div className='p-6 text-leaf-700'>No enrollments yet.</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[760px] text-left text-sm'>
              <thead className='bg-leaf-50 text-leaf-700'>
                <tr>
                  <th className='px-5 py-3 font-semibold'>Learner</th>
                  <th className='px-5 py-3 font-semibold'>Course</th>
                  <th className='px-5 py-3 font-semibold'>Progress</th>
                  <th className='px-5 py-3 font-semibold'>Enrolled</th>
                  <th className='px-5 py-3 font-semibold'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-leaf-100'>
                {enrollments.map((enrollment) => {
                  const percent = progressPercent(
                    enrollment.completed_lessons || 0,
                    enrollment.total_lessons || 0,
                  );
                  return (
                    <tr key={enrollment.id}>
                      <td className='px-5 py-4'>
                        <div className='font-semibold text-brand'>
                          {enrollment.user_name || 'Learner'}
                        </div>
                        <div className='text-leaf-600'>{enrollment.email}</div>
                      </td>
                      <td className='px-5 py-4'>
                        <Link
                          href={`/digital/training/${enrollment.course_slug}`}
                          className='font-semibold text-brand hover:underline'
                        >
                          {enrollment.course_title}
                        </Link>
                      </td>
                      <td className='px-5 py-4'>
                        <CourseProgressBar
                          percent={percent}
                          label={`${enrollment.completed_lessons || 0} of ${
                            enrollment.total_lessons || 0
                          }`}
                        />
                      </td>
                      <td className='px-5 py-4 text-leaf-700'>
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </td>
                      <td className='px-5 py-4'>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            enrollment.completed_at
                              ? 'bg-success/10 text-success'
                              : 'bg-leaf-100 text-leaf-700'
                          }`}
                        >
                          {enrollment.completed_at
                            ? 'Completed'
                            : 'In progress'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
