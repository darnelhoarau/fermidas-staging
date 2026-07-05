'use client';

export function QuizEmbed({
  quizId,
  userId,
  width = 700,
  height = 800,
}: {
  quizId: string;
  userId: string;
  width?: number;
  height?: number;
}) {
  const src = `https://www.classmarker.com/testing/embed/${quizId}?iframe=true&cm_user_id=${encodeURIComponent(userId)}`;

  return (
    <div className='flex justify-center'>
      <iframe
        src={src}
        width={width}
        height={height}
        className='w-full max-w-[700px] rounded-2xl border-0'
        style={{ minHeight: height }}
        allowFullScreen
      />
    </div>
  );
}
