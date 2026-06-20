import { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { CourseForm } from '../../_components/CourseForm';

export const metadata: Metadata = {
  title: 'New Training Course | Admin',
  description: 'Create a training course',
};

export default async function NewTrainingCoursePage() {
  await requireAdmin();

  return (
    <section className='bg-gradient-to-br from-mint to-white pt-12 pb-24 md:pb-28'>
      <div className='container'>
        <div className='mb-12'>
          <Link
            href='/digital/admin/training/courses'
            className='mb-6 inline-block text-sm text-leaf-700 hover:text-leaf-900'
          >
            ← Back to Courses
          </Link>
          <h1 className='font-display mb-4 text-2xl font-bold text-brand md:text-4xl'>
            New Course
          </h1>
          <p className='text-lg text-leaf-700'>
            Create the landing page, price, and publishing state.
          </p>
        </div>
        <CourseForm />
      </div>
    </section>
  );
}
