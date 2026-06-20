export function CourseProgressBar({
  percent,
  label,
}: {
  percent: number;
  label?: string;
}) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div>
      <div className='mb-2 flex items-center justify-between text-xs font-semibold text-leaf-700'>
        <span>{label || 'Progress'}</span>
        <span>{clamped}%</span>
      </div>
      <div className='h-2 overflow-hidden rounded-full bg-leaf-100'>
        <div
          className='h-full rounded-full bg-leaf-600 transition-all'
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
