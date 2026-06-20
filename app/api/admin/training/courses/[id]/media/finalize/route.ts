import { NextRequest, NextResponse } from 'next/server';
import { head } from '@vercel/blob';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { toPrivateBlobReference } from '@/lib/training-media-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const uploadedBlobSchema = z.object({
  pathname: z.string().min(1),
  contentType: z.string().min(1).optional(),
});

const finalizeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('cover'),
    image: uploadedBlobSchema,
  }),
  z.object({
    type: z.literal('video'),
    video: uploadedBlobSchema,
    poster: uploadedBlobSchema,
    durationSeconds: z.number().int().min(0),
    useAsCourseCover: z.boolean().default(true),
  }),
]);

function assertCourseBlobPath(
  courseId: string,
  pathname: string,
  folder: 'covers' | 'posters' | 'videos',
) {
  const normalized = pathname.replace(/^\/+/, '');
  if (!normalized.startsWith(`training/courses/${courseId}/${folder}/`)) {
    throw new Error('Invalid uploaded media path');
  }
  return normalized;
}

async function assertBlobExists(
  pathname: string,
  allowedContentTypes: string[],
) {
  const blob = await head(pathname);
  if (!allowedContentTypes.includes(blob.contentType)) {
    throw new Error('Uploaded media has an invalid content type');
  }
  return blob;
}

function adminPreviewUrl(courseId: string, mediaReference: string) {
  const params = new URLSearchParams({
    ref: mediaReference,
    v: String(Date.now()),
  });
  return `/api/admin/training/courses/${courseId}/media?${params.toString()}`;
}

function finalizeErrorStatus(error: unknown) {
  if (
    error instanceof Error &&
    error.message.includes('Admin access required')
  ) {
    return 403;
  }

  return 400;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const course = await db.findCourseById(id);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const payload = finalizeSchema.parse(await request.json());

    if (payload.type === 'cover') {
      const imagePathname = assertCourseBlobPath(
        id,
        payload.image.pathname,
        'covers',
      );
      await assertBlobExists(imagePathname, [
        'image/jpeg',
        'image/png',
        'image/webp',
      ]);

      const imageUrl = toPrivateBlobReference(imagePathname);
      await db.updateCourse(id, { thumbnailUrl: imageUrl });
      await db.createAuditLog({
        actorUserId: session.user.id,
        action: 'training.cover.uploaded',
        metaJson: JSON.stringify({
          courseId: id,
          blobPathname: imagePathname,
          uploadMode: 'client-direct',
        }),
      });

      return NextResponse.json({
        success: true,
        media: {
          imageUrl,
          previewUrl: adminPreviewUrl(id, imageUrl),
        },
      });
    }

    const videoPathname = assertCourseBlobPath(
      id,
      payload.video.pathname,
      'videos',
    );
    const posterPathname = assertCourseBlobPath(
      id,
      payload.poster.pathname,
      'posters',
    );
    await Promise.all([
      assertBlobExists(videoPathname, ['video/mp4']),
      assertBlobExists(posterPathname, ['image/jpeg']),
    ]);

    const videoUrl = toPrivateBlobReference(videoPathname);
    const posterUrl = toPrivateBlobReference(posterPathname);

    if (payload.useAsCourseCover) {
      await db.updateCourse(id, { thumbnailUrl: posterUrl });
    }

    await db.createAuditLog({
      actorUserId: session.user.id,
      action: 'training.media.uploaded',
      metaJson: JSON.stringify({
        courseId: id,
        videoBlobPathname: videoPathname,
        posterBlobPathname: posterPathname,
        durationSeconds: payload.durationSeconds,
        usedAsCourseCover: payload.useAsCourseCover,
        uploadMode: 'client-direct',
      }),
    });

    return NextResponse.json({
      success: true,
      media: {
        videoUrl,
        posterUrl,
        posterPreviewUrl: adminPreviewUrl(id, posterUrl),
        durationSeconds: payload.durationSeconds,
      },
    });
  } catch (error) {
    console.error('Training media finalize error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 },
      );
    }

    const status = finalizeErrorStatus(error);
    return NextResponse.json(
      {
        error:
          status === 403
            ? 'Forbidden'
            : error instanceof Error
              ? error.message
              : 'Could not finalise training media',
      },
      { status },
    );
  }
}
