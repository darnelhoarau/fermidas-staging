/**
 * Change detection for Compliance Watch sources
 * Fetches sources, detects new items, and stores changes
 */

import * as db from '../db';
import { fetchPage, parseRss, type ScrapedItem } from './fetcher';
import { intelligentScrape } from './intelligent-scraper';

// Source interface matching database structure
interface SourceUrl {
  url: string;
  type: 'RSS' | 'HTML' | 'JSON';
  css_list_selector?: string | null;
  css_item_selector?: string | null;
  css_content_selector?: string | null;
  xpath_item?: string | null;
  xpath_content?: string | null;
}

interface Source {
  id: string;
  category_id: string;
  name: string;
  url?: string; // Legacy - for backward compatibility
  type?: 'RSS' | 'HTML'; // Legacy
  urls?: SourceUrl[]; // New format - array of URLs
  css_list_selector?: string | null; // Legacy
  css_item_selector?: string | null; // Legacy
  css_content_selector?: string | null; // Legacy
  xpath_item?: string | null; // Legacy
  xpath_content?: string | null; // Legacy
  js_heavy: boolean;
  page_encoding: string;
  is_active: boolean;
  last_checked_at?: Date | null;
  last_hash?: string | null;
}

export interface ChangeDetectionResult {
  sourceId: string;
  sourceName: string;
  newChanges: number;
  errors?: string[];
}

/**
 * Run change detection for all active sources
 */
export async function detectAllChanges(
  productId: string
): Promise<ChangeDetectionResult[]> {
  // Get all active sources for the product
  const categories = await db.findCategoriesWithSources(productId);

  const results: ChangeDetectionResult[] = [];

  for (const category of categories) {
    for (const source of category.sources) {
      if (!source.is_active) continue;

      try {
        const result = await detectChangesForSource(source as Source);
        results.push(result);
      } catch (error) {
        console.error(
          `Error detecting changes for source ${source.id}:`,
          error
        );
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          newChanges: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        });
      }
    }
  }

  return results;
}

/**
 * Get URLs to process for a source (supports both legacy and new format)
 */
function getSourceUrls(source: Source): SourceUrl[] {
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
        type: source.type,
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

/**
 * Detect changes for a single source (processes all URLs)
 */
export async function detectChangesForSource(
  source: Source
): Promise<ChangeDetectionResult> {
  const errors: string[] = [];
  let allItems: ScrapedItem[] = [];
  const sourceUrls = getSourceUrls(source);

  if (sourceUrls.length === 0) {
    return {
      sourceId: source.id,
      sourceName: source.name,
      newChanges: 0,
      errors: ['No URLs configured for this source'],
    };
  }

  // Process each URL in the source
  for (const urlConfig of sourceUrls) {
    try {
      // Fetch the page
      const html = await fetchPage({
        url: urlConfig.url,
        encoding: source.page_encoding,
        respectRobots: true,
      });

      let items: ScrapedItem[] = [];

      // Parse based on URL type
      if (urlConfig.type === 'RSS') {
        items = await parseRss(html);
      } else if (urlConfig.type === 'HTML') {
        // Use intelligent scraping with URL-specific selectors
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

        const scrapeResult = await intelligentScrape(
          html,
          urlConfig.url,
          customSelectors
        );
        items = scrapeResult.items;
      } else if (urlConfig.type === 'JSON') {
        // JSON sources not yet supported in change detection
        errors.push(`JSON type not yet supported for URL: ${urlConfig.url}`);
        continue;
      }

      // Add items from this URL to the collection
      allItems = allItems.concat(items);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(
        `Error processing URL ${urlConfig.url} for source ${source.name}:`,
        error
      );
      errors.push(`Failed to process ${urlConfig.url}: ${errorMsg}`);
    }
  }

  // Deduplicate items by hash first (to avoid checking the same hash multiple times)
  const uniqueItemsByHash = new Map<string, ScrapedItem>();
  for (const item of allItems) {
    if (!uniqueItemsByHash.has(item.hash)) {
      uniqueItemsByHash.set(item.hash, item);
    }
  }

  // Filter out items we've already seen (check database for each unique hash)
  const newItems: ScrapedItem[] = [];
  for (const item of uniqueItemsByHash.values()) {
    const exists = await db.findSourceChangeByHash(item.hash);

    if (!exists) {
      newItems.push(item);
    }
  }

  // Store new changes (ON CONFLICT will handle any race conditions gracefully)
  let newChangesCount = 0;
  for (const item of newItems) {
    const result = await db.createSourceChange({
      sourceId: source.id,
      changeHash: item.hash,
      url: item.url,
      title: item.title,
      publishedAt: item.publishedAt,
      rawHtml: item.rawHtml,
      rawText: item.rawText,
    });

    // Only count if actually inserted (not a conflict)
    if (result) {
      newChangesCount++;
    }
  }

  // Update source's last checked timestamp
  await db.updateSourceLastChecked(source.id, allItems[0]?.hash);

  return {
    sourceId: source.id,
    sourceName: source.name,
    newChanges: newChangesCount,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Get unprocessed changes since a given date
 */
export async function getUnprocessedChanges(since: Date, productId: string) {
  return await db.findUnprocessedChanges(productId, since);
}
