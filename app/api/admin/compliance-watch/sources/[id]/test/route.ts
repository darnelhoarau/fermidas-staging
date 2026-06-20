import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { fetchPage, parseRss, type ScrapedItem } from '@/lib/scrape/fetcher';
import {
  intelligentScrape,
  type IntelligentScrapeResult,
} from '@/lib/scrape/intelligent-scraper';

interface SourceUrl {
  url: string;
  type: 'RSS' | 'HTML' | 'JSON';
  css_list_selector?: string | null;
  css_item_selector?: string | null;
  css_content_selector?: string | null;
  xpath_item?: string | null;
  xpath_content?: string | null;
}

interface SourceFromDb {
  id: string;
  name: string;
  url?: string;
  type?: string;
  urls?: string | SourceUrl[];
  css_list_selector?: string | null;
  css_item_selector?: string | null;
  css_content_selector?: string | null;
  xpath_item?: string | null;
  xpath_content?: string | null;
}

/**
 * Get URLs to process for a source (supports both legacy and new format)
 */
function getSourceUrls(source: SourceFromDb): SourceUrl[] {
  // Handle new format - urls array
  if (source.urls) {
    // Parse if it's a string (from database JSONB)
    let urlsArray: SourceUrl[] = [];
    if (typeof source.urls === 'string') {
      try {
        urlsArray = JSON.parse(source.urls);
      } catch (e) {
        console.error('Failed to parse urls JSON:', e);
        urlsArray = [];
      }
    } else if (Array.isArray(source.urls)) {
      urlsArray = source.urls;
    }

    if (urlsArray.length > 0) {
      return urlsArray;
    }
  }

  // Fallback to legacy format
  if (source.url && source.type) {
    return [
      {
        url: source.url,
        type:
          source.type === 'RSS' ||
          source.type === 'HTML' ||
          source.type === 'JSON'
            ? source.type
            : ('HTML' as 'RSS' | 'HTML' | 'JSON'),
        css_list_selector: source.css_list_selector,
        css_item_selector: source.css_item_selector,
        css_content_selector: source.css_content_selector,
        xpath_item: source.xpath_item,
        xpath_content: source.xpath_content,
      },
    ];
  }
  return [];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const source = await db.findSourceById(id);

    console.log('Testing source:', { id, source });

    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    const sourceUrls = getSourceUrls(source);

    if (sourceUrls.length === 0) {
      return NextResponse.json(
        {
          error: 'Source has no URLs configured',
          source: { id: source.id, name: source.name },
        },
        { status: 400 }
      );
    }

    // Process all URLs for this source
    const allItems: ScrapedItem[] = [];
    const allScrapeResults: Array<IntelligentScrapeResult & { url: string }> =
      [];
    const urlErrors: string[] = [];

    for (const urlConfig of sourceUrls) {
      try {
        // Fetch and parse the source (without storing changes)
        const html = await fetchPage({ url: urlConfig.url });

        let items: ScrapedItem[] = [];
        let scrapeResult: IntelligentScrapeResult | undefined = undefined;

        if (urlConfig.type === 'RSS') {
          items = await parseRss(html);
        } else if (urlConfig.type === 'HTML') {
          // Try intelligent scraping first
          const customSelectors =
            urlConfig.css_item_selector || urlConfig.css_list_selector
              ? {
                  listSelector: urlConfig.css_list_selector || undefined,
                  itemSelector:
                    urlConfig.css_item_selector ||
                    urlConfig.css_list_selector ||
                    undefined,
                  titleSelector: undefined,
                  linkSelector: undefined,
                  dateSelector: undefined,
                  contentSelector: urlConfig.css_content_selector || undefined,
                }
              : undefined;

          scrapeResult = await intelligentScrape(
            html,
            urlConfig.url,
            customSelectors
          );
          items = scrapeResult.items;
        } else {
          urlErrors.push(
            `JSON type not yet supported for URL: ${urlConfig.url}`
          );
          continue;
        }

        allItems.push(...items);
        if (scrapeResult) {
          allScrapeResults.push({ url: urlConfig.url, ...scrapeResult });
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error testing URL ${urlConfig.url}:`, error);
        urlErrors.push(`Failed to test ${urlConfig.url}: ${errorMsg}`);
      }
    }

    // Check which items would be NEW (not previously seen)
    const newItems = [];
    const existingItems = [];

    for (const item of allItems) {
      const exists = await db.findSourceChangeByHash(item.hash);
      if (!exists) {
        newItems.push(item);
      } else {
        existingItems.push(item);
      }
    }

    // Get recent changes for this source to show what was found before
    const recentChanges = await db.findSourceChangesBySourceId(id, 10);

    // Combine scrape info from all URLs
    const combinedScrapeInfo =
      allScrapeResults.length > 0
        ? {
            strategy: allScrapeResults[0].strategy,
            confidence:
              allScrapeResults.length > 0
                ? Math.round(
                    allScrapeResults.reduce(
                      (sum, r) => sum + (r.confidence || 0),
                      0
                    ) / allScrapeResults.length
                  )
                : 0,
            errors: [
              ...allScrapeResults.flatMap((r) => r.errors || []),
              ...urlErrors,
            ],
            urlsProcessed: sourceUrls.length,
            itemsPerUrl: allScrapeResults.map((r) => ({
              url: r.url,
              itemCount: r.items?.length || 0,
            })),
          }
        : undefined;

    return NextResponse.json({
      success: true,
      sourceName: source.name,
      newChangesFound: newItems.length,
      totalItemsOnPage: allItems.length,
      existingItemsFound: existingItems.length,
      newItems: newItems.map((item) => ({
        title: item.title,
        url: item.url,
        publishedAt: item.publishedAt,
        hash: item.hash,
        content:
          item.content?.substring(0, 200) +
          (item.content && item.content.length > 200 ? '...' : ''),
      })),
      recentChanges: recentChanges.map((change) => ({
        title: change.title,
        url: change.url,
        publishedAt: change.published_at,
        createdAt: change.created_at,
      })),
      scrapeInfo: combinedScrapeInfo,
    });
  } catch (error) {
    console.error('Error testing source:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to test source',
      },
      { status: 500 }
    );
  }
}
