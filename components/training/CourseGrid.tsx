import { CourseCard, type CourseCardData } from './CourseCard';

export function CourseGrid({
  courses,
  enrolledCourseSlugs = [],
}: {
  courses: CourseCardData[];
  enrolledCourseSlugs?: string[];
}) {
  return (
    <div className='grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3'>
      {courses.map((course) => (
        <CourseCard
          key={course.slug}
          course={course}
          hasAccess={enrolledCourseSlugs.includes(course.slug)}
        />
      ))}
    </div>
  );
}
