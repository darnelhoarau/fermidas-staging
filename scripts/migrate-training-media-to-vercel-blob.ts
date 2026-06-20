import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { put } from '@vercel/blob';
import { Pool } from 'pg';

config({ path: '.env.local' });
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

const courseId = 'course-cybersecurity-awareness-series-1-2026';
const lessonId = 'lesson-cybersecurity-awareness-series-1-2026';

function toPrivateBlobReference(pathname: string) {
  return `vercel-blob://${pathname.replace(/^\/+/, '')}`;
}

async function uploadPrivateBlob(
  pathname: string,
  filePath: string,
  contentType: string,
) {
  if (!existsSync(filePath)) {
    throw new Error(`Local media file does not exist: ${filePath}`);
  }

  const blob = await put(pathname, createReadStream(filePath), {
    access: 'private',
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType,
    multipart: contentType === 'video/mp4',
  });

  return toPrivateBlobReference(blob.pathname);
}

async function main() {
  const videoPath = join(
    process.cwd(),
    'public',
    'training',
    'cybersecurity-awareness-series-1-2026.mp4',
  );
  const posterPath = join(
    process.cwd(),
    'public',
    'training',
    'cybersecurity-awareness-series-1-2026-poster.jpg',
  );

  const [videoReference, posterReference] = await Promise.all([
    uploadPrivateBlob(
      `training/courses/${courseId}/videos/cybersecurity-awareness-series-1-2026.mp4`,
      videoPath,
      'video/mp4',
    ),
    uploadPrivateBlob(
      `training/courses/${courseId}/covers/cybersecurity-awareness-series-1-2026-poster.jpg`,
      posterPath,
      'image/jpeg',
    ),
  ]);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(
      `
        UPDATE courses
        SET thumbnail_url = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `,
      [posterReference, courseId],
    );
    await client.query(
      `
        UPDATE course_lessons
        SET video_url = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `,
      [videoReference, lessonId],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }

  console.log('Training media migrated to private Vercel Blob.');
  console.log(`Video: ${videoReference}`);
  console.log(`Poster: ${posterReference}`);
}

main().catch(async (error) => {
  await pool.end().catch(() => {});
  console.error(error);
  process.exit(1);
});
