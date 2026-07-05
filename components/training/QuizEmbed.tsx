'use client';

import { useEffect, useRef } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    const existing = document.querySelector(
      `script[src*="quiz=${quizId}"]`,
    );
    if (existing) return;

    const script = document.createElement('script');
    script.src = `https://www.classmarker.com/public/js/embed-classmarker-1.0.0.js?quiz=${quizId}&nocache=1`;
    script.setAttribute('data-quiz', quizId);
    script.setAttribute('data-width', String(width));
    script.setAttribute('data-height', String(height));
    script.setAttribute('data-cm-user-id', userId);
    script.async = true;

    containerRef.current?.appendChild(script);

    return () => {
      script.remove();
    };
  }, [quizId, userId, width, height]);

  return (
    <div className='flex justify-center'>
      <div
        ref={containerRef}
        className='w-full max-w-[700px] overflow-hidden rounded-2xl bg-white'
        style={{ minHeight: height }}
      />
    </div>
  );
}
