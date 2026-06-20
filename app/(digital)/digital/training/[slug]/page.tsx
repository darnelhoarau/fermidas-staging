import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import { canAccessCourse } from '@/lib/training-access';
import {
  formatDuration,
  formatPrice,
  progressPercent,
} from '@/lib/training-utils';
import { CourseCurriculum } from '@/components/training/CourseCurriculum';
import { CourseProgressBar } from '@/components/training/CourseProgressBar';
import { EnrollButton } from '@/components/training/EnrollButton';
import { LevelBadge } from '@/components/training/LevelBadge';
import {
  BookOpen01Icon,
  Calendar03Icon,
  CheckmarkCircle01Icon,
  Globe02Icon,
  PlayIcon,
  Target01Icon,
  Time01Icon,
  UserGroupIcon,
  Video01Icon,
} from 'hugeicons-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await db.findCourseBySlug(slug);

  if (!course) {
    return {
      title: 'Training Course | Fermidas',
    };
  }

  return {
    title: `${course.title} | Fermidas Training`,
    description: course.short_description,
  };
}

export default async function CourseLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(
      `/digital/auth/signin?callbackUrl=${encodeURIComponent(
        `/digital/training/${slug}`,
      )}`,
    );
  }

  const course = await db.findCourseBySlug(slug);

  if (!course) notFound();

  const [modules, access, progress] = await Promise.all([
    db.findModulesForCourse(course.id),
    canAccessCourse(session?.user ?? null, course.id),
    session?.user
      ? db.findCourseProgress(session.user.id, course.id)
      : Promise.resolve(null),
  ]);
  const enrollmentCount = await db.countCourseEnrollments(course.id);

  const whatYouLearn = Array.isArray(course.what_you_learn)
    ? course.what_you_learn
    : [];
  const requirements = Array.isArray(course.requirements)
    ? course.requirements
    : [];
  const completedLessonIds =
    progress?.lessons
      .filter((lesson) => lesson.completed_at)
      .map((lesson) => lesson.lesson_id) || [];
  const percent = progress
    ? progress.percent
    : progressPercent(0, course.total_lessons || 0);
  const trailerUrl =
    access &&
    course.trailer_url &&
    !String(course.trailer_url).startsWith('vercel-blob://')
      ? course.trailer_url
      : null;
  const updatedLabel = new Date(course.updated_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <>
      <section className='relative isolate overflow-hidden bg-brand py-12 text-brand-foreground md:py-20'>
        <span className='course-hero-lava' aria-hidden='true'>
          <span className='course-hero-lava__blob course-hero-lava__blob-a' />
          <span className='course-hero-lava__blob course-hero-lava__blob-b' />
          <span className='course-hero-lava__blob course-hero-lava__blob-c' />
        </span>

        <div className='container relative z-10'>
          <div className='grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start xl:grid-cols-[minmax(0,820px)_380px]'>
            <div>
              <Link
                href='/digital/training'
                className='mb-8 inline-block text-sm text-leaf-200 hover:text-white'
              >
                ← Training Catalog
              </Link>

              <div className='mb-5 flex flex-wrap items-center gap-3'>
                <LevelBadge level={course.level} />
                {course.is_featured && (
                  <span className='rounded-full bg-gold px-3 py-1 text-xs font-semibold text-brand shadow-sm ring-1 ring-gold'>
                    Featured
                  </span>
                )}
              </div>
              <h1 className='font-display mb-5 text-4xl font-bold leading-tight text-white md:text-6xl'>
                {course.title}
              </h1>
              <p className='max-w-4xl text-lg leading-relaxed text-leaf-100 md:text-xl'>
                {course.short_description}
              </p>

              <div className='mt-8 flex flex-wrap gap-5 text-sm font-medium text-leaf-100'>
                <span className='inline-flex items-center gap-2'>
                  <CheckmarkCircle01Icon className='h-4 w-4' />
                  Last updated {updatedLabel}
                </span>
                <span className='inline-flex items-center gap-2'>
                  <UserGroupIcon className='h-4 w-4' />
                  {course.instructor_name}
                </span>
                <span className='inline-flex items-center gap-2'>
                  <Time01Icon className='h-4 w-4' />
                  {formatDuration(course.total_duration_seconds)}
                </span>
                <span className='inline-flex items-center gap-2'>
                  <Video01Icon className='h-4 w-4' />
                  Language: {course.language.toUpperCase()}
                </span>
              </div>
            </div>
            <div className='hidden lg:block' aria-hidden='true' />
          </div>
        </div>
      </section>

      <section className='bg-white pb-16 lg:pb-20'>
        <div className='container grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start xl:grid-cols-[minmax(0,820px)_380px]'>
          <div className='order-2 space-y-12 pt-10 lg:order-1 lg:pt-12'>
            <div className='overflow-hidden rounded-2xl border border-leaf-500 bg-white text-brand shadow-lg'>
              <div className='grid gap-px bg-leaf-100 md:grid-cols-3'>
                <div className='flex flex-col items-center bg-white p-6 text-center'>
                  <Target01Icon className='mb-4 h-10 w-10 text-leaf-600' />
                  <div className='text-sm font-medium text-leaf-600'>
                    Specialist tailored
                  </div>
                  <div className='mt-1 text-xl font-bold text-brand'>
                    Options
                  </div>
                </div>
                <div className='flex flex-col items-center bg-white p-6 text-center'>
                  <Time01Icon className='mb-4 h-10 w-10 text-leaf-600' />
                  <div className='text-sm font-medium text-leaf-600'>
                    Course length
                  </div>
                  <div className='mt-1 text-xl font-bold text-brand'>
                    {formatDuration(course.total_duration_seconds)}
                  </div>
                </div>
                <div className='flex flex-col items-center bg-white p-6 text-center'>
                  <UserGroupIcon className='mb-4 h-10 w-10 text-leaf-600' />
                  <div className='text-sm font-medium text-leaf-600'>
                    Learners
                  </div>
                  <div className='mt-1 text-xl font-bold text-brand'>
                    {enrollmentCount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-leaf-200 bg-mint p-6'>
              <h2 className='mb-4 inline-flex rounded-2xl bg-leaf-600 px-5 py-2 font-display text-xl font-bold text-white'>
                The Fermidas Training Methodology
              </h2>
              <div className='space-y-4 leading-relaxed text-brand'>
                {course.description
                  .split('\n')
                  .filter(Boolean)
                  .map((paragraph: string) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
              </div>
            </div>

            <div>
              <h2 className='font-display mb-5 text-3xl font-bold text-brand'>
                Learning Outcomes
              </h2>
              {whatYouLearn.length > 0 ? (
                <div className='space-y-3 rounded-2xl border border-leaf-100 bg-leaf-50 p-5'>
                  {whatYouLearn.map((item: string) => (
                    <div
                      key={item}
                      className='flex gap-3 rounded-xl bg-white p-4'
                    >
                      <CheckmarkCircle01Icon className='mt-0.5 h-5 w-5 shrink-0 text-success' />
                      <span className='text-leaf-700'>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-leaf-700'>
                  Learning outcomes will be added by the training team.
                </p>
              )}
            </div>

            <div>
              <h2 className='font-display mb-5 text-3xl font-bold text-brand'>
                Curriculum
              </h2>
              <CourseCurriculum
                courseSlug={course.slug}
                modules={modules}
                canAccessCourse={access}
                completedLessonIds={completedLessonIds}
                linkLessons
              />
            </div>

            {requirements.length > 0 && (
              <div className='rounded-2xl border border-leaf-100 bg-leaf-50 p-6'>
                <h2 className='mb-5 inline-flex rounded-2xl bg-leaf-600 px-5 py-2 font-display text-xl font-bold text-white'>
                  Target Audience
                </h2>
                <ul className='space-y-4 text-leaf-700'>
                  {requirements.map((item: string) => (
                    <li key={item} className='flex gap-3'>
                      <span className='mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand' />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className='rounded-2xl border border-leaf-100 bg-leaf-50 p-6'>
              <h2 className='mb-5 inline-flex rounded-2xl bg-leaf-600 px-5 py-2 font-display text-xl font-bold text-white'>
                Course Includes
              </h2>
              <div className='grid gap-4 sm:grid-cols-2'>
                {[
                  `${formatDuration(course.total_duration_seconds)} presentation`,
                  'Access on mobile and desktop',
                  'Current agentic AI threat examples',
                  'Progress tracking',
                  'Practical defence habits',
                  'Secure access after enrollment',
                ].map((item) => (
                  <div
                    key={item}
                    className='flex items-center gap-3 text-brand'
                  >
                    <Video01Icon className='h-5 w-5 shrink-0 text-leaf-700' />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className='card p-6'>
              <h2 className='font-display mb-4 text-xl font-bold text-brand'>
                Instructor
              </h2>
              <div className='flex items-center gap-4'>
                {course.instructor_avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.instructor_avatar_url}
                    alt=''
                    className='h-14 w-14 rounded-full object-cover'
                  />
                ) : (
                  <div className='flex h-14 w-14 items-center justify-center rounded-full bg-leaf-100 text-lg font-bold text-brand'>
                    {course.instructor_name.slice(0, 1)}
                  </div>
                )}
                <div>
                  <h3 className='font-semibold text-brand'>
                    {course.instructor_name}
                  </h3>
                  <p className='text-sm text-leaf-600'>Course instructor</p>
                </div>
              </div>
              {course.instructor_bio && (
                <p className='mt-4 text-sm leading-relaxed text-leaf-700'>
                  {course.instructor_bio}
                </p>
              )}
            </div>

            <div className='card p-6'>
              <h2 className='font-display mb-4 text-xl font-bold text-brand'>
                Course Details
              </h2>
              <div className='grid gap-px overflow-hidden rounded-xl bg-leaf-100 text-sm text-leaf-700 sm:grid-cols-3'>
                <div className='flex flex-col items-center bg-white p-5 text-center'>
                  <Calendar03Icon className='mb-3 h-9 w-9 text-leaf-600' />
                  <span className='block font-medium text-leaf-600'>
                    Updated
                  </span>
                  <strong className='mt-1 text-brand'>{updatedLabel}</strong>
                </div>
                <div className='flex flex-col items-center bg-white p-5 text-center'>
                  <Globe02Icon className='mb-3 h-9 w-9 text-leaf-600' />
                  <span className='block font-medium text-leaf-600'>
                    Language
                  </span>
                  <strong className='mt-1 text-brand'>
                    {course.language.toUpperCase()}
                  </strong>
                </div>
                <div className='flex flex-col items-center bg-white p-5 text-center'>
                  <BookOpen01Icon className='mb-3 h-9 w-9 text-leaf-600' />
                  <span className='block font-medium text-leaf-600'>
                    Lessons
                  </span>
                  <strong className='mt-1 text-brand'>
                    {course.total_lessons}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <aside className='order-1 pt-8 lg:sticky lg:top-24 lg:order-2 lg:-mt-[414px] lg:self-start lg:pt-0'>
            <div className='overflow-hidden rounded-2xl bg-white text-brand shadow-xl ring-1 ring-leaf-100'>
              <div className='aspect-video bg-brand'>
                {trailerUrl ? (
                  <video
                    src={trailerUrl}
                    controls
                    muted
                    className='h-full w-full bg-brand object-cover'
                  />
                ) : access && course.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/training/courses/${course.id}/cover`}
                    alt=''
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <div className='flex h-full items-center justify-center text-brand-foreground'>
                    <PlayIcon className='h-12 w-12 text-leaf-200' />
                  </div>
                )}
              </div>
              <div className='bg-gradient-to-b from-leaf-500 to-brand px-6 py-4'>
                <h2 className='font-display text-lg font-bold text-white'>
                  Preview this course
                </h2>
              </div>
              <div className='p-6'>
                {access && progress && (
                  <div className='mb-5'>
                    <CourseProgressBar
                      percent={percent}
                      label={`${progress.completedLessons} of ${progress.totalLessons} lessons complete`}
                    />
                  </div>
                )}

                <div className='mb-5 text-3xl font-bold text-brand'>
                  {access
                    ? 'Included'
                    : formatPrice(course.currency || 'SCR', course.price_minor)}
                </div>

                <EnrollButton
                  hasAccess={access}
                  courseSlug={course.slug}
                  checkoutHref={`/digital/checkout?course=${course.slug}`}
                  label={`Enroll Now - ${formatPrice(
                    course.currency || 'SCR',
                    course.price_minor,
                  )}`}
                />

                <div className='mt-5 space-y-3 border-t border-leaf-100 pt-5 text-sm text-leaf-700'>
                  <div className='flex items-center justify-between'>
                    <span>Duration</span>
                    <strong>
                      {formatDuration(course.total_duration_seconds)}
                    </strong>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>Lessons</span>
                    <strong>{course.total_lessons}</strong>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span>Language</span>
                    <strong>{course.language.toUpperCase()}</strong>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
