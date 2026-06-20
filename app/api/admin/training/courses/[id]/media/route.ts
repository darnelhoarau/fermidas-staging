import { createReadStream, createWriteStream } from 'fs';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import { spawn } from 'child_process';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import type { ReadableStream as NodeReadableStream } from 'stream/web';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import {
  isPrivateBlobReference,
  putPrivateTrainingBlob,
  serveTrainingMedia,
} from '@/lib/training-media-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const maxVideoSizeBytes = 1024 * 1024 * 1024;
const maxImageSizeBytes = 10 * 1024 * 1024;
const largeUploadThresholdBytes = 100 * 1024 * 1024;

function sanitizeFileBaseName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, '');
  const sanitized = withoutExtension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return sanitized || 'training-video';
}

function getImageExtension(file: File) {
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

function getImageContentType(extension: string, fileType: string) {
  if (fileType) return fileType;
  if (extension === 'jpg') return 'image/jpeg';
  return `image/${extension}`;
}

function runCommand(command: string, args: string[], timeoutMs = 120000) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`${command} timed out`));
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr || `${command} exited with code ${code}`));
    });
  });
}

async function getVideoDurationSeconds(videoPath: string) {
  const { stdout } = await runCommand('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    videoPath,
  ]);
  const duration = Number.parseFloat(stdout.trim());
  return Number.isFinite(duration) ? Math.max(0, Math.round(duration)) : 0;
}

async function generatePoster(videoPath: string, posterPath: string) {
  await runCommand('ffmpeg', [
    '-y',
    '-i',
    videoPath,
    '-frames:v',
    '1',
    '-q:v',
    '2',
    posterPath,
  ]);
}

function adminMediaErrorStatus(error: unknown) {
  return error instanceof Error &&
    error.message.includes('Admin access required')
    ? 403
    : 500;
}

function adminPreviewUrl(courseId: string, mediaReference?: string | null) {
  const params = new URLSearchParams({
    v: String(Date.now()),
  });

  if (mediaReference) {
    params.set('ref', mediaReference);
  }

  return `/api/admin/training/courses/${courseId}/media?${params.toString()}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const course = await db.findCourseById(id);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const explicitReference = request.nextUrl.searchParams.get('ref');
    const mediaReference = explicitReference || course.thumbnail_url;

    if (!mediaReference) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    if (explicitReference && !isPrivateBlobReference(explicitReference)) {
      return NextResponse.json(
        { error: 'Unsupported media reference' },
        { status: 400 },
      );
    }

    return serveTrainingMedia(mediaReference, request, 'image/jpeg');
  } catch (error) {
    console.error('Training media preview error:', error);
    const status = adminMediaErrorStatus(error);
    return NextResponse.json(
      {
        error: status === 403 ? 'Forbidden' : 'Internal server error',
      },
      { status },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let videoPath: string | null = null;
  let posterPath: string | null = null;
  let tempDir: string | null = null;

  try {
    const session = await requireAdmin();
    const { id } = await params;
    const course = await db.findCourseById(id);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const coverImage = formData.get('coverImage');

    if (coverImage instanceof File) {
      const imageExtension = getImageExtension(coverImage);

      if (!imageExtension) {
        return NextResponse.json(
          { error: 'Only JPG, PNG, or WebP images can be uploaded' },
          { status: 400 },
        );
      }

      if (coverImage.size <= 0 || coverImage.size > maxImageSizeBytes) {
        return NextResponse.json(
          { error: 'Image must be between 1 byte and 10 MB' },
          { status: 400 },
        );
      }

      const uploadToken = `${Date.now()}-${randomBytes(4).toString('hex')}`;
      const baseName = sanitizeFileBaseName(coverImage.name);
      const imagePathname = [
        'training',
        'courses',
        id,
        'covers',
        `${baseName}-${uploadToken}.${imageExtension}`,
      ].join('/');

      const imageBlob = await putPrivateTrainingBlob(
        imagePathname,
        coverImage,
        {
          contentType: getImageContentType(imageExtension, coverImage.type),
          maximumSizeInBytes: maxImageSizeBytes,
        },
      );
      await db.updateCourse(id, { thumbnailUrl: imageBlob.reference });

      await db.createAuditLog({
        actorUserId: session.user.id,
        action: 'training.cover.uploaded',
        metaJson: JSON.stringify({
          courseId: id,
          blobPathname: imageBlob.pathname,
        }),
      });

      return NextResponse.json({
        success: true,
        media: {
          imageUrl: imageBlob.reference,
          previewUrl: adminPreviewUrl(id, imageBlob.reference),
        },
      });
    }

    const file = formData.get('video');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'MP4 video file is required' },
        { status: 400 },
      );
    }

    const lowerName = file.name.toLowerCase();
    if (file.type !== 'video/mp4' && !lowerName.endsWith('.mp4')) {
      return NextResponse.json(
        { error: 'Only MP4 videos can be uploaded' },
        { status: 400 },
      );
    }

    if (file.size <= 0 || file.size > maxVideoSizeBytes) {
      return NextResponse.json(
        { error: 'Video must be between 1 byte and 1 GB' },
        { status: 400 },
      );
    }

    const useAsCourseCover = formData.get('useAsCourseCover') !== 'false';
    const uploadToken = `${Date.now()}-${randomBytes(4).toString('hex')}`;
    const baseName = sanitizeFileBaseName(file.name);
    const videoFileName = `${baseName}-${uploadToken}.mp4`;
    const posterFileName = `${baseName}-${uploadToken}-poster.jpg`;
    tempDir = join(tmpdir(), 'fermidas-training-uploads', id, uploadToken);

    await mkdir(tempDir, { recursive: true });

    videoPath = join(tempDir, videoFileName);
    posterPath = join(tempDir, posterFileName);

    await pipeline(
      Readable.fromWeb(
        file.stream() as unknown as NodeReadableStream<Uint8Array>,
      ),
      createWriteStream(videoPath),
    );

    const durationSeconds = await getVideoDurationSeconds(videoPath);
    await generatePoster(videoPath, posterPath);

    const videoBlob = await putPrivateTrainingBlob(
      ['training', 'courses', id, 'videos', videoFileName].join('/'),
      createReadStream(videoPath),
      {
        contentType: 'video/mp4',
        maximumSizeInBytes: maxVideoSizeBytes,
        multipart: file.size >= largeUploadThresholdBytes,
      },
    );
    const posterBlob = await putPrivateTrainingBlob(
      ['training', 'courses', id, 'posters', posterFileName].join('/'),
      createReadStream(posterPath),
      {
        contentType: 'image/jpeg',
        maximumSizeInBytes: maxImageSizeBytes,
      },
    );

    if (useAsCourseCover) {
      await db.updateCourse(id, { thumbnailUrl: posterBlob.reference });
    }

    await db.createAuditLog({
      actorUserId: session.user.id,
      action: 'training.media.uploaded',
      metaJson: JSON.stringify({
        courseId: id,
        videoBlobPathname: videoBlob.pathname,
        posterBlobPathname: posterBlob.pathname,
        durationSeconds,
        usedAsCourseCover: useAsCourseCover,
      }),
    });

    return NextResponse.json({
      success: true,
      media: {
        videoUrl: videoBlob.reference,
        posterUrl: posterBlob.reference,
        posterPreviewUrl: adminPreviewUrl(id, posterBlob.reference),
        durationSeconds,
      },
    });
  } catch (error) {
    console.error('Training media upload error:', error);
    const status = adminMediaErrorStatus(error);

    return NextResponse.json(
      {
        error:
          status === 403
            ? 'Forbidden'
            : error instanceof Error
              ? error.message
              : 'Could not upload training media',
      },
      { status },
    );
  } finally {
    if (videoPath) await rm(videoPath, { force: true }).catch(() => {});
    if (posterPath) await rm(posterPath, { force: true }).catch(() => {});
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
