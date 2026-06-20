export const largeUploadThresholdBytes = 100 * 1024 * 1024;

export function sanitizeUploadBaseName(
  fileName: string,
  fallback = 'training-media',
) {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, '');
  const sanitized = withoutExtension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return sanitized || fallback;
}

export function randomUploadToken() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');

  return `${Date.now()}-${token}`;
}

export function trainingMediaPath(
  courseId: string,
  folder: 'covers' | 'posters' | 'videos',
  fileName: string,
) {
  return ['training', 'courses', courseId, folder, fileName].join('/');
}

export function getImageUploadExtension(file: File) {
  const lowerName = file.name.toLowerCase();

  if (file.type === 'image/png' || lowerName.endsWith('.png')) return 'png';
  if (file.type === 'image/webp' || lowerName.endsWith('.webp')) return 'webp';
  if (
    file.type === 'image/jpeg' ||
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg')
  ) {
    return 'jpg';
  }

  return null;
}

export function imageContentType(extension: string, fileType?: string) {
  if (fileType) return fileType;
  if (extension === 'jpg') return 'image/jpeg';
  return `image/${extension}`;
}

function waitForVideoEvent(video: HTMLVideoElement, eventName: string) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Could not read the selected video'));
    }, 20000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      video.removeEventListener(eventName, handleEvent);
      video.removeEventListener('error', handleError);
    };
    const handleEvent = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error('Could not read the selected video'));
    };

    video.addEventListener(eventName, handleEvent, { once: true });
    video.addEventListener('error', handleError, { once: true });
  });
}

export async function createPosterFromVideo(file: File, posterName: string) {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.muted = true;
  video.playsInline = true;
  video.src = objectUrl;

  try {
    await waitForVideoEvent(video, 'loadedmetadata');

    const durationSeconds = Number.isFinite(video.duration)
      ? Math.max(0, Math.round(video.duration))
      : 0;
    const seekTime = Math.min(0.1, Math.max((video.duration || 0) - 0.1, 0));

    if (seekTime > 0) {
      const seeked = waitForVideoEvent(video, 'seeked');
      video.currentTime = seekTime;
      await seeked;
    } else if (video.readyState < 2) {
      await waitForVideoEvent(video, 'loadeddata');
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Could not create the video poster');
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const posterBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not create the video poster'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.9,
      );
    });

    return {
      durationSeconds,
      posterFile: new File([posterBlob], posterName, { type: 'image/jpeg' }),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
