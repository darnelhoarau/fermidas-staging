import 'server-only';

import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { join, normalize, sep } from 'path';
import { Readable } from 'stream';
import { get, put } from '@vercel/blob';

const privateBlobReferencePrefix = 'vercel-blob://';

type PutBody = Parameters<typeof put>[1];

const contentTypesByExtension: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
};

export function toPrivateBlobReference(pathname: string) {
  return `${privateBlobReferencePrefix}${pathname.replace(/^\/+/, '')}`;
}

export function isPrivateBlobReference(value?: string | null) {
  return !!value?.startsWith(privateBlobReferencePrefix);
}

export function getPrivateBlobPathname(value: string) {
  if (isPrivateBlobReference(value)) {
    return value.slice(privateBlobReferencePrefix.length).replace(/^\/+/, '');
  }

  try {
    const url = new URL(value);
    if (url.hostname.endsWith('.blob.vercel-storage.com')) {
      return decodeURIComponent(url.pathname.replace(/^\/+/, ''));
    }
  } catch {
    return null;
  }

  return null;
}

export async function putPrivateTrainingBlob(
  pathname: string,
  body: PutBody,
  options: {
    contentType: string;
    maximumSizeInBytes?: number;
    multipart?: boolean;
  },
) {
  const blob = await put(pathname.replace(/^\/+/, ''), body, {
    access: 'private',
    allowOverwrite: false,
    cacheControlMaxAge: 60,
    contentType: options.contentType,
    maximumSizeInBytes: options.maximumSizeInBytes,
    multipart: options.multipart,
  });

  return {
    ...blob,
    reference: toPrivateBlobReference(blob.pathname),
  };
}

function getContentType(pathname: string, fallback: string) {
  const extension = pathname.slice(pathname.lastIndexOf('.')).toLowerCase();

  return contentTypesByExtension[extension] || fallback;
}

function parseByteRange(rangeHeader: string | null, size: number) {
  if (!rangeHeader) return null;

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match) return null;

  const [, startValue, endValue] = match;
  let start = startValue ? Number.parseInt(startValue, 10) : 0;
  let end = endValue ? Number.parseInt(endValue, 10) : size - 1;

  if (!startValue && endValue) {
    const suffixLength = Number.parseInt(endValue, 10);
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  }

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start < 0 ||
    end < start ||
    start >= size
  ) {
    return null;
  }

  return {
    start,
    end: Math.min(end, size - 1),
  };
}

function secureMediaHeaders(contentType: string) {
  const headers = new Headers();
  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', 'private, no-store, max-age=0');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Content-Disposition', 'inline');
  headers.set('Accept-Ranges', 'bytes');
  return headers;
}

function localPublicTrainingPath(mediaReference: string) {
  if (
    !mediaReference.startsWith('/training/') &&
    !mediaReference.startsWith('training/')
  ) {
    return null;
  }

  const publicRoot = normalize(join(process.cwd(), 'public'));
  const relativePath = mediaReference.replace(/^\/+/, '');
  const absolutePath = normalize(join(publicRoot, relativePath));
  const requiredPrefix = `${publicRoot}${sep}`;

  if (!absolutePath.startsWith(requiredPrefix)) return null;
  return absolutePath;
}

async function servePrivateBlob(
  mediaReference: string,
  request: Request,
  fallbackContentType: string,
) {
  const pathname = getPrivateBlobPathname(mediaReference);
  if (!pathname) {
    return new Response('Unsupported media reference', { status: 500 });
  }

  const range = request.headers.get('range');
  const blobResult = await get(pathname, {
    access: 'private',
    useCache: false,
    headers: range ? { Range: range } : undefined,
  });

  if (!blobResult) return new Response('Media not found', { status: 404 });

  if (blobResult.statusCode === 304) {
    return new Response(null, {
      status: 304,
      headers: secureMediaHeaders(fallbackContentType),
    });
  }

  const upstreamHeaders = blobResult.headers;
  const headers = secureMediaHeaders(
    upstreamHeaders.get('content-type') ||
      blobResult.blob.contentType ||
      fallbackContentType,
  );
  const upstreamLength = upstreamHeaders.get('content-length');
  const upstreamRange = upstreamHeaders.get('content-range');
  const upstreamEtag = upstreamHeaders.get('etag') || blobResult.blob.etag;
  const upstreamLastModified = upstreamHeaders.get('last-modified');

  if (upstreamLength) headers.set('Content-Length', upstreamLength);
  if (upstreamRange) headers.set('Content-Range', upstreamRange);
  if (upstreamEtag) headers.set('ETag', upstreamEtag);
  if (upstreamLastModified) {
    headers.set('Last-Modified', upstreamLastModified);
  }

  return new Response(blobResult.stream, {
    status: upstreamRange ? 206 : 200,
    headers,
  });
}

async function serveLocalTrainingFile(
  mediaReference: string,
  request: Request,
  fallbackContentType: string,
) {
  const filePath = localPublicTrainingPath(mediaReference);
  if (!filePath) {
    return new Response('Unsupported media reference', { status: 500 });
  }

  const fileStat = await stat(filePath).catch(() => null);
  if (!fileStat?.isFile())
    return new Response('Media not found', { status: 404 });

  const contentType = getContentType(filePath, fallbackContentType);
  const range = parseByteRange(request.headers.get('range'), fileStat.size);
  const headers = secureMediaHeaders(contentType);

  if (request.headers.get('range') && !range) {
    headers.set('Content-Range', `bytes */${fileStat.size}`);
    return new Response(null, { status: 416, headers });
  }

  if (range) {
    headers.set('Content-Length', String(range.end - range.start + 1));
    headers.set(
      'Content-Range',
      `bytes ${range.start}-${range.end}/${fileStat.size}`,
    );
    return new Response(
      Readable.toWeb(createReadStream(filePath, range)) as ReadableStream,
      { status: 206, headers },
    );
  }

  headers.set('Content-Length', String(fileStat.size));
  return new Response(
    Readable.toWeb(createReadStream(filePath)) as ReadableStream,
    { status: 200, headers },
  );
}

export async function serveTrainingMedia(
  mediaReference: string,
  request: Request,
  fallbackContentType = 'application/octet-stream',
) {
  if (getPrivateBlobPathname(mediaReference)) {
    return servePrivateBlob(mediaReference, request, fallbackContentType);
  }

  if (localPublicTrainingPath(mediaReference)) {
    return serveLocalTrainingFile(mediaReference, request, fallbackContentType);
  }

  return new Response('Unsupported media reference', { status: 500 });
}
