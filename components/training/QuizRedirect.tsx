'use client';

import { useRouter } from 'next/navigation';

export function QuizRedirect({
  quizId,
  userId,
  courseSlug,
  started,
  delivery,
}: {
  quizId: string;
  userId: string;
  courseSlug: string;
  started: boolean;
  delivery: 'embed' | 'redirect';
}) {
  const router = useRouter();

  if (delivery === 'embed') {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #fff; }
        </style>
      </head>
      <body>
        <script src="https://www.classmarker.com/public/js/embed-classmarker-1.0.0.js?quiz=${quizId}&nocache=1"
          data-quiz="${quizId}"
          data-width="100%"
          data-height="800"
          data-cm-user-id="${userId}">
        <\/script>
      </body>
      </html>
    `;

    return (
      <iframe
        srcDoc={html}
        className='w-full rounded-2xl border-0'
        style={{ height: 800, maxHeight: '90vh' }}
        title='Assessment'
      />
    );
  }

  const classMarkerUrl = `https://www.classmarker.com/online-test/start/?quiz=${quizId}`;

  function handleBegin() {
    window.open(classMarkerUrl, '_blank');
    router.replace(`/digital/training/${courseSlug}/quiz?started=1`);
  }

  if (started) {
    return (
      <div className='card p-8 text-center'>
        <h2 className='mb-2 text-lg font-semibold text-brand'>Assessment Started</h2>
        <p className='mb-6 text-sm text-leaf-600'>
          Complete the assessment in the new tab. When you&apos;re done, click the button below.
        </p>
        <button onClick={() => router.refresh()} className='btn btn-primary'>
          I&apos;ve Completed the Assessment
        </button>
      </div>
    );
  }

  return (
    <div className='card p-8 text-center'>
      <h2 className='mb-2 text-lg font-semibold text-brand'>Ready to Begin?</h2>
      <p className='mb-6 text-sm text-leaf-600'>
        You&apos;ll open the assessment on ClassMarker in a new tab.
        Results are recorded automatically.
      </p>
      <button onClick={handleBegin} className='btn btn-primary'>
        Begin Assessment
      </button>
    </div>
  );
}
