import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const maxVideoSizeBytes = 1024 * 1024 * 1024;
const maxImageSizeBytes = 10 * 1024 * 1024;

type UploadPayload = {
  courseId?: string;
  kind?: 'cover' | 'poster' | 'video';
};

function adminUploadErrorStatus(error: unknown) {
  if (
    error instanceof Error &&
    error.message.includes('Admin access required')
  ) {
    return 403;
  }

  return 400;
}

function parsePayload(value: string | null): UploadPayload {
  if (!value) return {};

  try {
    return JSON.parse(value) as UploadPayload;
  } catch {
    return {};
  }
}

function validatePathname(courseId: string, pathname: string, kind?: string) {
  if (!kind || !['cover', 'poster', 'video'].includes(kind)) return false;

  const expectedFolder = kind === 'video' ? 'videos' : `${kind}s`;
  return pathname.startsWith(`training/courses/${courseId}/${expectedFolder}/`);
}

export async function POST(
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

    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = parsePayload(clientPayload);

        if (
          payload.courseId !== id ||
          !validatePathname(id, pathname, payload.kind)
        ) {
          throw new Error('Invalid upload destination');
        }

        if (payload.kind === 'video') {
          return {
            allowedContentTypes: ['video/mp4'],
            maximumSizeInBytes: maxVideoSizeBytes,
            allowOverwrite: false,
            cacheControlMaxAge: 60,
            tokenPayload: clientPayload,
          };
        }

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          maximumSizeInBytes: maxImageSizeBytes,
          allowOverwrite: false,
          cacheControlMaxAge: 60,
          tokenPayload: clientPayload,
        };
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Training client upload token error:', error);
    const status = adminUploadErrorStatus(error);
    return NextResponse.json(
      {
        error:
          status === 403
            ? 'Forbidden'
            : error instanceof Error
              ? error.message
              : 'Could not authorise training media upload',
      },
      { status },
    );
  }
}
