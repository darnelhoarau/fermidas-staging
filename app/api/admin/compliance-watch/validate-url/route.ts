import { NextRequest, NextResponse } from 'next/server';
import { canFetch } from '@/lib/scrape/robots';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({
        valid: false,
        accessible: false,
        crawlable: false,
        error: 'Invalid URL format',
      });
    }

    // Check if URL is accessible
    let accessible = false;
    let httpError: string | null = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ComplianceWatch/1.0)',
        },
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        accessible = true;
      } else {
        httpError = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          httpError = 'Request timeout';
        } else if (error.message.includes('ENOTFOUND')) {
          httpError = 'Domain not found';
        } else if (error.message.includes('ECONNREFUSED')) {
          httpError = 'Connection refused';
        } else if (error.message.includes('certificate')) {
          httpError = 'SSL certificate error';
        } else {
          httpError = error.message;
        }
      } else {
        httpError = 'Unknown error';
      }
    }

    // Check if URL is crawlable (robots.txt)
    let crawlable = false;
    let robotsError: string | null = null;

    if (accessible) {
      try {
        crawlable = await canFetch(
          url,
          'Mozilla/5.0 (compatible; ComplianceWatch/1.0)'
        );
        if (!crawlable) {
          robotsError = 'Crawling not allowed by robots.txt';
        }
      } catch (error) {
        // If robots.txt check fails, we'll still allow it but note the warning
        robotsError =
          error instanceof Error ? error.message : 'Could not check robots.txt';
        crawlable = true; // Default to allowing if we can't check
      }
    }

    return NextResponse.json({
      valid: true,
      accessible,
      crawlable: accessible && crawlable,
      error: httpError || robotsError || null,
    });
  } catch (error) {
    console.error('Error validating URL:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to validate URL',
      },
      { status: 500 }
    );
  }
}
