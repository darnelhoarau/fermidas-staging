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
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; background: #fff; }
      </style>
    </head>
    <body>
      <script src="https://www.classmarker.com/public/js/embed-classmarker-1.0.0.js?quiz=${quizId}&nocache=1"
        data-quiz="${quizId}"
        data-width="${width}"
        data-height="${height}"
        data-cm-user-id="${userId}">
      <\/script>
    </body>
    </html>
  `;

  return (
    <div className='flex justify-center'>
      <iframe
        srcDoc={html}
        width={width}
        height={height}
        className='w-full max-w-[700px] rounded-2xl border-0'
        style={{ minHeight: height }}
        title='Assessment'
      />
    </div>
  );
}
