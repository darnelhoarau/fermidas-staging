import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { fetchPage } from '@/lib/scrape/fetcher';
import { getSuggestedSelectors } from '@/lib/scrape/intelligent-scraper';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    await params; // Ensure params is awaited
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the webpage
    const html = await fetchPage({ url });

    // Analyze the page structure and suggest selectors
    const suggestions = getSuggestedSelectors(html, url);

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error('Error suggesting selectors:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to analyze website',
      },
      { status: 500 }
    );
  }
}
