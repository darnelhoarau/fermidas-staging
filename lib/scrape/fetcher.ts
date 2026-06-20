/**
 * Web scraping utilities for Compliance Watch
 * Supports HTML parsing and RSS feeds
 */

import { load as loadCheerio } from 'cheerio';
import { canFetch, getCrawlDelay } from './robots';
import crypto from 'crypto';

export interface FetchOptions {
  url: string;
  userAgent?: string;
  encoding?: string;
  timeout?: number;
  respectRobots?: boolean;
}

export interface ScrapedItem {
  url: string;
  title: string;
  content?: string;
  publishedAt?: Date;
  rawHtml?: string;
  rawText?: string;
  hash: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch a webpage with proper headers and rate limiting
 */
export async function fetchPage(options: FetchOptions): Promise<string> {
  const {
    url,
    userAgent = 'FermidasBot/1.0 (+https://www.fermidas.com)',
    timeout = 10000,
    respectRobots = true,
  } = options;

  // Check robots.txt
  if (respectRobots) {
    const allowed = await canFetch(url, userAgent);
    if (!allowed) {
      throw new Error(`Crawling not allowed by robots.txt: ${url}`);
    }

    // Respect crawl delay
    const crawlDelay = await getCrawlDelay(url, userAgent);
    await delay(crawlDelay);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`Fetch timeout after ${timeout}ms: ${url}`);
    }
    throw error;
  }
}

/**
 * Parse HTML and extract items based on CSS selectors
 */
export async function parseHtml(
  html: string,
  selectors: {
    listSelector?: string;
    itemSelector?: string;
    titleSelector?: string;
    linkSelector?: string;
    dateSelector?: string;
    contentSelector?: string;
  }
): Promise<ScrapedItem[]> {
  const $ = loadCheerio(html);
  const items: ScrapedItem[] = [];

  try {
    // If listSelector is provided, get the container
    const container = selectors.listSelector
      ? $(selectors.listSelector)
      : $('body');

    // Find all items
    const itemElements = selectors.itemSelector
      ? container.find(selectors.itemSelector)
      : container.children();

    itemElements.each((_, element) => {
      const $el = $(element);

      // Extract title
      let title = '';
      if (selectors.titleSelector) {
        title = $el.find(selectors.titleSelector).text().trim();
      } else {
        title = $el.find('h1, h2, h3, h4, a').first().text().trim();
      }

      // Extract link
      let url = '';
      if (selectors.linkSelector) {
        url = $el.find(selectors.linkSelector).attr('href') || '';
      } else {
        url = $el.find('a').first().attr('href') || '';
      }

      // Extract date
      let publishedAt: Date | undefined;
      if (selectors.dateSelector) {
        const dateText = $el.find(selectors.dateSelector).text().trim();
        publishedAt = parseDate(dateText);
      }

      // Extract content
      let content = '';
      let rawHtml = '';
      if (selectors.contentSelector) {
        const contentEl = $el.find(selectors.contentSelector);
        content = contentEl.text().trim();
        rawHtml = contentEl.html() || '';
      } else {
        content = $el.text().trim();
        rawHtml = $el.html() || '';
      }

      if (title && url) {
        // Normalize relative URLs
        // (In production, you'd pass the base URL)

        const hash = generateHash({ url, title, content, publishedAt });

        items.push({
          url,
          title,
          content,
          publishedAt,
          rawHtml,
          rawText: content,
          hash,
        });
      }
    });

    return items;
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return [];
  }
}

/**
 * Parse RSS/Atom feed
 */
export async function parseRss(xml: string): Promise<ScrapedItem[]> {
  const $ = loadCheerio(xml, { xmlMode: true });
  const items: ScrapedItem[] = [];

  try {
    // Check if it's RSS or Atom
    const isAtom = $('feed').length > 0;

    if (isAtom) {
      // Parse Atom feed
      $('entry').each((_, element) => {
        const $entry = $(element);
        const title = $entry.find('title').text().trim();
        const link = $entry.find('link').attr('href') || '';
        const publishedText =
          $entry.find('published').text() || $entry.find('updated').text();
        const content =
          $entry.find('content').text() || $entry.find('summary').text().trim();

        let publishedAt: Date | undefined;
        if (publishedText) {
          try {
            const date = new Date(publishedText);
            // Validate the date is actually valid and reasonable
            if (
              !isNaN(date.getTime()) &&
              date.getFullYear() >= 1900 &&
              date.getFullYear() <= 2100
            ) {
              publishedAt = date;
            }
          } catch {
            // Invalid date, leave as undefined
          }
        }

        if (title && link) {
          const hash = generateHash({ url: link, title, content, publishedAt });
          items.push({
            url: link,
            title,
            content,
            publishedAt,
            rawText: content,
            hash,
          });
        }
      });
    } else {
      // Parse RSS feed
      $('item').each((_, element) => {
        const $item = $(element);
        const title = $item.find('title').text().trim();
        const link = $item.find('link').text().trim();
        const publishedText = $item.find('pubDate').text();
        const content =
          $item.find('description').text() ||
          $item.find('content\\:encoded').text().trim();

        let publishedAt: Date | undefined;
        if (publishedText) {
          try {
            const date = new Date(publishedText);
            // Validate the date is actually valid and reasonable
            if (
              !isNaN(date.getTime()) &&
              date.getFullYear() >= 1900 &&
              date.getFullYear() <= 2100
            ) {
              publishedAt = date;
            }
          } catch {
            // Invalid date, leave as undefined
          }
        }

        if (title && link) {
          const hash = generateHash({ url: link, title, content, publishedAt });
          items.push({
            url: link,
            title,
            content,
            publishedAt,
            rawText: content,
            hash,
          });
        }
      });
    }

    return items;
  } catch (error) {
    console.error('Error parsing RSS:', error);
    return [];
  }
}

/**
 * Generate a deterministic hash for an item
 */
export function generateHash(item: {
  url: string;
  title: string;
  content?: string;
  publishedAt?: Date;
}): string {
  const data = JSON.stringify({
    url: item.url.trim().toLowerCase(),
    title: item.title.trim(),
    content: item.content?.trim().substring(0, 500) || '', // First 500 chars
    date: item.publishedAt?.toISOString() || '',
  });

  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Parse various date formats
 */
function parseDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;

  try {
    // Try ISO format first
    const date = new Date(dateStr);
    // Validate the date is actually valid and reasonable
    if (
      !isNaN(date.getTime()) &&
      date.getFullYear() >= 1900 &&
      date.getFullYear() <= 2100
    ) {
      return date;
    }

    // Try common formats
    // Add more formats as needed
    const patterns = [
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i,
      /(\d{4})-(\d{2})-(\d{2})/,
    ];

    for (const pattern of patterns) {
      const match = dateStr.match(pattern);
      if (match) {
        try {
          const parsed = new Date(dateStr);
          // Validate the date is actually valid and reasonable
          if (
            !isNaN(parsed.getTime()) &&
            parsed.getFullYear() >= 1900 &&
            parsed.getFullYear() <= 2100
          ) {
            return parsed;
          }
        } catch {
          // Invalid date, continue to next pattern
        }
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Extract text content from HTML (strip tags)
 */
export function htmlToText(html: string): string {
  const $ = loadCheerio(html);
  $('script, style, nav, footer, header').remove();
  return $.text().trim().replace(/\s+/g, ' ');
}
