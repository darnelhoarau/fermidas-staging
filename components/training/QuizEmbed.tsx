'use client';

import { useRef, useEffect } from 'react';

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const existing = container.querySelector('iframe');
    if (existing) return;

    const origWrite = document.write.bind(document);
    let buf = '';

    document.write = (...texts: string[]) => {
      buf += texts.join('');
    };

    const script = document.createElement('script');
    script.src = `https://www.classmarker.com/public/js/embed-classmarker-1.0.0.js?quiz=${quizId}&nocache=1`;
    script.setAttribute('data-quiz', quizId);
    script.setAttribute('data-width', String(width));
    script.setAttribute('data-height', String(height));
    script.setAttribute('data-cm-user-id', userId);

    script.onload = () => {
      document.write = origWrite;
      if (buf && container) {
        container.innerHTML = buf;
      }
    };

    script.onerror = () => {
      document.write = origWrite;
      if (container) {
        container.innerHTML =
          '<p class="p-6 text-center text-error">Failed to load quiz. Please refresh and try again.</p>';
      }
    };

    container.appendChild(script);

    return () => {
      document.write = origWrite;
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
