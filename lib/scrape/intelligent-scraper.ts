/**
 * Intelligent web scraper that can adapt to different website structures
 * Uses multiple strategies to find content on various types of websites
 */

import { load as loadCheerio } from 'cheerio';
import { ScrapedItem, generateHash } from './fetcher';

export interface IntelligentScrapeResult {
  items: ScrapedItem[];
  strategy: string;
  confidence: number;
  errors: string[];
}

/**
 * Intelligent scraper that tries multiple strategies to find content
 */
export async function intelligentScrape(
  html: string,
  url: string,
  customSelectors?: {
    listSelector?: string;
    itemSelector?: string;
    titleSelector?: string;
    linkSelector?: string;
    dateSelector?: string;
    contentSelector?: string;
  }
): Promise<IntelligentScrapeResult> {
  const $ = loadCheerio(html);
  const errors: string[] = [];

  // Strategy 1: Use custom selectors if provided
  if (customSelectors && hasValidSelectors(customSelectors)) {
    try {
      const items = await scrapeWithCustomSelectors($, customSelectors, url);
      if (items.length > 0) {
        return {
          items,
          strategy: 'custom-selectors',
          confidence: 0.9,
          errors: [],
        };
      }
    } catch (error) {
      errors.push(`Custom selectors failed: ${error}`);
    }
  }

  // Strategy 2: Try website-specific patterns first
  if (url.includes('creativeseychelles.com')) {
    try {
      const items = await scrapeCreativeAgencySeychelles($, url);
      if (items.length > 0) {
        return {
          items,
          strategy: 'creative-agency-seychelles-specific',
          confidence: 0.95,
          errors,
        };
      }
    } catch (error) {
      errors.push(
        `Creative Agency Seychelles specific scraping failed: ${error}`
      );
    }
  }

  // Strategy 2.1: Try Judiciary of Seychelles specific patterns
  if (url.includes('judiciary.sc')) {
    try {
      const items = await scrapeJudiciarySeychelles($, url);
      if (items.length > 0) {
        return {
          items,
          strategy: 'judiciary-seychelles-specific',
          confidence: 0.95,
          errors,
        };
      }
    } catch (error) {
      errors.push(`Judiciary Seychelles specific scraping failed: ${error}`);
    }
  }

  // Strategy 3: Try common news/blog patterns
  const newsPatterns = [
    // WordPress patterns
    {
      list: '.post, article, .entry',
      item: '.post, article, .entry',
      title: 'h1, h2, .entry-title, .post-title',
      link: 'a',
      date: '.date, .published, time',
      content: '.entry-content, .post-content, .content',
    },
    // Generic news patterns
    {
      list: '.news-item, .article, .story',
      item: '.news-item, .article, .story',
      title: 'h1, h2, h3, .title, .headline',
      link: 'a',
      date: '.date, .published, .timestamp',
      content: '.content, .excerpt, .summary',
    },
    // Card-based layouts
    {
      list: '.card, .item, .post-card',
      item: '.card, .item, .post-card',
      title: 'h1, h2, h3, .card-title, .title',
      link: 'a',
      date: '.date, .published, .meta',
      content: '.content, .excerpt, .description',
    },
    // List patterns
    {
      list: 'ul li, ol li, .list-item',
      item: 'li, .list-item',
      title: 'h1, h2, h3, a, .title',
      link: 'a',
      date: '.date, .published, .meta',
      content: '.content, .excerpt, p',
    },
    // News-specific patterns
    {
      list: '.news, .news-list, .news-container',
      item: '.news-item, .news-article, .news-card',
      title: 'h1, h2, h3, h4, .news-title, .article-title',
      link: 'a',
      date: '.date, .published, .news-date',
      content: '.news-content, .article-content, .excerpt',
    },
    // Blog patterns
    {
      list: '.blog, .blog-list, .blog-container',
      item: '.blog-item, .blog-post, .blog-entry',
      title: 'h1, h2, h3, h4, .blog-title, .post-title',
      link: 'a',
      date: '.date, .published, .blog-date',
      content: '.blog-content, .post-content, .excerpt',
    },
  ];

  for (const pattern of newsPatterns) {
    try {
      const items = await scrapeWithPattern($, pattern, url);
      if (items.length > 0) {
        return {
          items,
          strategy: `news-pattern-${newsPatterns.indexOf(pattern)}`,
          confidence: 0.7,
          errors,
        };
      }
    } catch (error) {
      errors.push(
        `News pattern ${newsPatterns.indexOf(pattern)} failed: ${error}`
      );
    }
  }

  // Strategy 4: Try to find any structured content
  const structuredPatterns = [
    // Look for any elements with links and text
    {
      list: 'body',
      item: 'div, section, article',
      title: 'h1, h2, h3, h4, a',
      link: 'a',
      date: '',
      content: 'p, .content, .text',
    },
    // Look for any clickable elements with meaningful text
    {
      list: 'body',
      item: 'a[href]',
      title: 'text',
      link: 'href',
      date: '',
      content: '',
    },
  ];

  for (const pattern of structuredPatterns) {
    try {
      const items = await scrapeWithPattern($, pattern, url);
      if (items.length > 0) {
        // Filter out navigation and footer links
        const filteredItems = items.filter(
          (item) =>
            !isNavigationLink(item.url, item.title) &&
            item.title.length > 10 &&
            item.title.length < 200
        );

        if (filteredItems.length > 0) {
          return {
            items: filteredItems,
            strategy: `structured-pattern-${structuredPatterns.indexOf(pattern)}`,
            confidence: 0.5,
            errors,
          };
        }
      }
    } catch (error) {
      errors.push(
        `Structured pattern ${structuredPatterns.indexOf(pattern)} failed: ${error}`
      );
    }
  }

  // Strategy 5: Fallback - extract any meaningful content
  try {
    const items = await extractAnyContent($, url);
    return {
      items,
      strategy: 'fallback-extraction',
      confidence: 0.3,
      errors,
    };
  } catch (error) {
    errors.push(`Fallback extraction failed: ${error}`);
    return {
      items: [],
      strategy: 'failed',
      confidence: 0,
      errors,
    };
  }
}

/**
 * Check if custom selectors are valid
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasValidSelectors(selectors: any): boolean {
  return !!(
    selectors.listSelector ||
    selectors.itemSelector ||
    selectors.titleSelector
  );
}

/**
 * Scrape using custom selectors
 */
async function scrapeWithCustomSelectors(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectors: any,
  baseUrl: string
): Promise<ScrapedItem[]> {
  const items: ScrapedItem[] = [];

  const container = selectors.listSelector
    ? $(selectors.listSelector)
    : $('body');
  const itemElements = selectors.itemSelector
    ? container.find(selectors.itemSelector)
    : container.children();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  itemElements.each((_: any, element: any) => {
    const $el = $(element);

    const title = extractText($el, selectors.titleSelector || 'h1, h2, h3, a');
    const url = extractUrl($el, selectors.linkSelector || 'a', baseUrl);
    const content = extractText(
      $el,
      selectors.contentSelector || 'p, .content, .excerpt'
    );
    const publishedAt = extractDate(
      $el,
      selectors.dateSelector || '.date, .published, time'
    );

    if (title && url && !isNavigationLink(url, title)) {
      const hash = generateHash({ url, title, content, publishedAt });
      items.push({
        url,
        title,
        content,
        publishedAt,
        rawHtml: $el.html() || '',
        rawText: content,
        hash,
      });
    }
  });

  return items;
}

/**
 * Scrape Judiciary of Seychelles specifically
 */
async function scrapeJudiciarySeychelles(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $: any,
  baseUrl: string
): Promise<ScrapedItem[]> {
  const items: ScrapedItem[] = [];

  // Based on the screenshot, the Judiciary website has news articles in a specific structure
  // Look for news articles in the main content area

  // Strategy 1: Look for news articles in the main content area
  // The news articles appear to be in a grid layout with images, titles, and descriptions

  // Look for article containers - these could be divs with specific classes or structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $('div, article, section').each((_: any, element: any) => {
    const $el = $(element);

    // Look for elements that contain an image, title, and description
    const hasImage = $el.find('img').length > 0;
    const hasTitle =
      $el.find('h1, h2, h3, h4, h5, h6, .title, .headline').length > 0;

    // Skip if it doesn't look like a news article
    if (!hasImage || !hasTitle) {
      return;
    }

    // Extract title
    const titleEl = $el
      .find('h1, h2, h3, h4, h5, h6, .title, .headline')
      .first();
    const title = titleEl.text().trim();

    // Skip if title is too short or looks like navigation
    if (
      title.length < 20 ||
      title.toLowerCase().includes('home') ||
      title.toLowerCase().includes('about') ||
      title.toLowerCase().includes('contact') ||
      title.toLowerCase().includes('menu') ||
      title.toLowerCase().includes('search')
    ) {
      return;
    }

    // Extract description/content
    const contentEl = $el.find('p, .description, .excerpt, .summary').first();
    let content = contentEl.text().trim();

    // If no specific content element, try to get text from the container
    if (!content) {
      const allText = $el.text().trim();
      const lines = allText
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);

      // Find the description (usually after the title)
      const titleIndex = lines.findIndex((line: string) => line === title);
      if (titleIndex !== -1 && titleIndex + 1 < lines.length) {
        content = lines[titleIndex + 1];
      }
    }

    // Extract URL
    let url = '';
    const linkEl = $el.find('a').first();
    if (linkEl.length) {
      const href = linkEl.attr('href');
      if (href) {
        url = href.startsWith('http') ? href : new URL(href, baseUrl).href;
      }
    }

    // Extract date if available
    let publishedAt: Date | undefined;
    const dateEl = $el.find('.date, .published, time, .timestamp').first();
    if (dateEl.length) {
      const dateText = dateEl.text().trim();
      if (dateText) {
        try {
          publishedAt = new Date(dateText);
          if (isNaN(publishedAt.getTime())) {
            publishedAt = undefined;
          }
        } catch {
          publishedAt = undefined;
        }
      }
    }

    // Create the item
    if (title && title.length > 20) {
      const hash = generateHash({
        url: url || baseUrl,
        title,
        content,
        publishedAt,
      });
      items.push({
        url: url || baseUrl,
        title,
        content: content.substring(0, 500),
        publishedAt,
        rawHtml: $el.html() || '',
        rawText: content,
        hash,
      });
    }
  });

  // Strategy 2: If no items found with images, try to find text-based news items
  if (items.length === 0) {
    // Look for links that might be news articles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $('a[href]').each((_: any, element: any) => {
      const $el = $(element);
      const title = $el.text().trim();
      const url = $el.attr('href');

      // Skip if it looks like navigation or is too short
      if (
        title.length < 20 ||
        title.length > 200 ||
        title.toLowerCase().includes('home') ||
        title.toLowerCase().includes('about') ||
        title.toLowerCase().includes('contact') ||
        title.toLowerCase().includes('menu') ||
        title.toLowerCase().includes('search') ||
        title.toLowerCase().includes('the judiciary') ||
        title.toLowerCase().includes('code of judicial') ||
        title.toLowerCase().includes('vacancies')
      ) {
        return;
      }

      // Check if this looks like a news article title
      // News titles are usually longer and more descriptive
      if (
        title.length > 30 &&
        (title.includes('JUDICIARY') ||
          title.includes('COURT') ||
          title.includes('MAGISTRATE') ||
          title.includes('JUDGE') ||
          title.includes('SYMPOSIUM') ||
          title.includes('CEREMONY') ||
          title.includes('TRAINING') ||
          title.includes('NEWSLETTER'))
      ) {
        const fullUrl = url.startsWith('http')
          ? url
          : new URL(url, baseUrl).href;
        const hash = generateHash({ url: fullUrl, title });

        items.push({
          url: fullUrl,
          title,
          content: '',
          publishedAt: undefined,
          rawHtml: $el.html() || '',
          rawText: title,
          hash,
        });
      }
    });
  }

  return items;
}

/**
 * Scrape Creative Agency Seychelles specifically
 */
async function scrapeCreativeAgencySeychelles(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $: any,
  baseUrl: string
): Promise<ScrapedItem[]> {
  const items: ScrapedItem[] = [];

  // Based on the website content, look for specific patterns
  // The site has Events and Facilities sections with specific content

  // Look for all div elements that might contain content
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $('div').each((_: any, element: any) => {
    const $el = $(element);
    const text = $el.text().trim();

    // Skip if too short, navigation, or common page elements
    const lowerText = text.toLowerCase();
    if (
      text.length < 30 ||
      lowerText.includes('menu') ||
      lowerText.includes('search') ||
      lowerText.includes('copyright') ||
      lowerText.includes('creative seychelles agency') ||
      lowerText.includes('growing seychelles creative future') ||
      lowerText.includes('instagram') ||
      lowerText.includes('youtube') ||
      lowerText.includes('facebook') ||
      lowerText.includes('website developed') ||
      lowerText.includes('cyberwave') ||
      lowerText.includes('all rights reserved') ||
      lowerText.includes('©') ||
      lowerText.includes('||') ||
      (lowerText.includes('https://') && text.length < 100)
    ) {
      return;
    }

    // Look for content that looks like news/events
    // Based on the website, we expect titles like:
    // "Celebrating Success of Festival Kreol 38th Edition 2023!"
    // "Festival Kreol's 38th Edition Comes Alive at Fond Ferdinand, Praslin"
    // "Our Facilities for Rent"

    const lines = text
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    // Look for lines that could be titles (longer than 20 chars, not dates, not navigation)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip if it looks like a date or navigation
      if (
        line.length < 20 ||
        line.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/) ||
        line.match(
          /^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i
        ) ||
        line.includes('Read More') ||
        line.includes('Home') ||
        line.includes('About') ||
        line.includes('Contact')
      ) {
        continue;
      }

      // This could be a title
      const title = line;

      // Look for a date in nearby lines
      let publishedAt: Date | undefined;
      for (
        let j = Math.max(0, i - 2);
        j <= Math.min(lines.length - 1, i + 2);
        j++
      ) {
        const dateLine = lines[j];
        if (
          dateLine.match(/\d{1,2}\/\d{1,2}\/\d{4}/) ||
          dateLine.match(
            /\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i
          )
        ) {
          try {
            const parsedDate = new Date(dateLine);
            // Validate the date is actually valid
            if (
              !isNaN(parsedDate.getTime()) &&
              parsedDate.getFullYear() > 1900 &&
              parsedDate.getFullYear() < 2100
            ) {
              publishedAt = parsedDate;
              break;
            }
          } catch {
            // Try to parse common date formats manually
            const dateMatch = dateLine.match(
              /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i
            );
            if (dateMatch) {
              const monthNames = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ];
              const monthIndex = monthNames.findIndex(
                (m) => m.toLowerCase() === dateMatch[2].toLowerCase()
              );
              if (monthIndex !== -1) {
                const year = parseInt(dateMatch[3]);
                const day = parseInt(dateMatch[1]);
                // Validate day and year are reasonable
                if (year > 1900 && year < 2100 && day > 0 && day <= 31) {
                  try {
                    const manualDate = new Date(year, monthIndex, day);
                    if (!isNaN(manualDate.getTime())) {
                      publishedAt = manualDate;
                      break;
                    }
                  } catch {
                    // Invalid date, skip
                  }
                }
              }
            }
          }
        }
      }

      // Look for content/description in the next few lines
      let content = '';
      for (let j = i + 1; j < Math.min(lines.length, i + 5); j++) {
        const contentLine = lines[j];
        const lowerContentLine = contentLine.toLowerCase();
        // Skip copyright, footer, and other non-content text
        if (
          contentLine.length > 10 &&
          !lowerContentLine.includes('read more') &&
          !lowerContentLine.includes('copyright') &&
          !lowerContentLine.includes('all rights reserved') &&
          !lowerContentLine.includes('website developed') &&
          !lowerContentLine.includes('cyberwave') &&
          !lowerContentLine.includes('©') &&
          !contentLine.match(/\d{1,2}\/\d{1,2}\/\d{4}/) &&
          !contentLine.match(
            /\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i
          ) &&
          !(contentLine.startsWith('https://') && contentLine.length < 100)
        ) {
          content += contentLine + ' ';
        }
      }
      content = content.trim();

      // Skip if the entire content looks like copyright/footer
      const lowerContent = content.toLowerCase();
      if (
        lowerContent.includes('copyright') &&
        (lowerContent.includes('all rights reserved') ||
          lowerContent.includes('website developed'))
      ) {
        return;
      }

      // Look for a link
      let url = '';
      const linkEl = $el.find('a').first();
      if (linkEl.length) {
        const href = linkEl.attr('href');
        if (href) {
          url = href.startsWith('http') ? href : new URL(href, baseUrl).href;
        }
      }

      // Additional filtering: skip if title looks like copyright/footer
      const lowerTitle = title.toLowerCase();
      if (
        title &&
        title.length > 10 &&
        !isNavigationLink(url, title) &&
        !lowerTitle.includes('copyright') &&
        !lowerTitle.includes('all rights reserved') &&
        !lowerTitle.includes('website developed') &&
        !lowerTitle.includes('cyberwave') &&
        !(title.startsWith('©') && title.length < 50) &&
        !(title.includes('||') && title.length < 100)
      ) {
        const hash = generateHash({
          url: url || baseUrl,
          title,
          content,
          publishedAt,
        });
        items.push({
          url: url || baseUrl,
          title,
          content: content.substring(0, 500),
          publishedAt,
          rawHtml: $el.html() || '',
          rawText: content,
          hash,
        });
      }
    }
  });

  return items;
}

/**
 * Scrape using a specific pattern
 */
async function scrapeWithPattern(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pattern: any,
  baseUrl: string
): Promise<ScrapedItem[]> {
  const items: ScrapedItem[] = [];

  const container = pattern.list ? $(pattern.list) : $('body');
  const itemElements = pattern.item
    ? container.find(pattern.item)
    : container.children();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  itemElements.each((_: any, element: any) => {
    const $el = $(element);

    const title = extractText($el, pattern.title);
    const url = extractUrl($el, pattern.link, baseUrl);
    const content = extractText($el, pattern.content);
    const publishedAt = extractDate($el, pattern.date);

    if (title && url && !isNavigationLink(url, title)) {
      const hash = generateHash({ url, title, content, publishedAt });
      items.push({
        url,
        title,
        content,
        publishedAt,
        rawHtml: $el.html() || '',
        rawText: content,
        hash,
      });
    }
  });

  return items;
}

/**
 * Extract any meaningful content as fallback
 */
async function extractAnyContent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $: any,
  baseUrl: string
): Promise<ScrapedItem[]> {
  const items: ScrapedItem[] = [];

  // Look for any links with meaningful text
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $('a[href]').each((_: any, element: any) => {
    const $el = $(element);
    const title = $el.text().trim();
    const url = $el.attr('href');

    if (
      title &&
      url &&
      title.length > 10 &&
      title.length < 200 &&
      !isNavigationLink(url, title)
    ) {
      const fullUrl = url.startsWith('http') ? url : new URL(url, baseUrl).href;
      const hash = generateHash({ url: fullUrl, title });

      items.push({
        url: fullUrl,
        title,
        content: '',
        rawHtml: $el.html() || '',
        rawText: title,
        hash,
      });
    }
  });

  return items;
}

/**
 * Extract text using selector
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractText($el: any, selector: string): string {
  if (!selector) return '';

  const text = $el.find(selector).first().text().trim();
  return text || $el.text().trim();
}

/**
 * Extract URL using selector
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractUrl($el: any, selector: string, baseUrl: string): string {
  if (!selector) return '';

  const href = $el.find(selector).first().attr('href');
  if (!href) return '';

  // Handle relative URLs
  if (href.startsWith('http')) {
    return href;
  }

  try {
    return new URL(href, baseUrl).href;
  } catch {
    return '';
  }
}

/**
 * Extract date using selector
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractDate($el: any, selector: string): Date | undefined {
  if (!selector) return undefined;

  const dateText = $el.find(selector).first().text().trim();
  if (!dateText) return undefined;

  try {
    const date = new Date(dateText);
    // Validate the date is actually valid and reasonable
    if (
      isNaN(date.getTime()) ||
      date.getFullYear() < 1900 ||
      date.getFullYear() > 2100
    ) {
      return undefined;
    }
    return date;
  } catch {
    return undefined;
  }
}

/**
 * Check if a link is likely navigation/footer content
 */
function isNavigationLink(url: string, title: string): boolean {
  const navKeywords = [
    'home',
    'about',
    'contact',
    'privacy',
    'terms',
    'login',
    'register',
    'search',
    'menu',
    'navigation',
    'footer',
    'header',
    'sidebar',
    'facebook',
    'twitter',
    'instagram',
    'linkedin',
    'youtube',
    'the judiciary',
    'code of judicial',
    'vacancies',
    'court structure',
    'legal practitioners',
    'resources',
    'contact us',
    'about us',
    'copyright',
    'all rights reserved',
    'website developed',
    'cyberwave',
  ];

  const lowerTitle = title.toLowerCase();
  const lowerUrl = url.toLowerCase();

  // Check for navigation keywords
  const hasNavKeyword = navKeywords.some(
    (keyword) => lowerTitle.includes(keyword) || lowerUrl.includes(keyword)
  );

  // Check for copyright/footer patterns
  const isCopyright =
    lowerTitle.includes('copyright') ||
    lowerTitle.includes('©') ||
    (lowerTitle.includes('all rights reserved') && title.length < 100) ||
    lowerTitle.includes('website developed');

  // Check for very short titles (likely navigation)
  const isTooShort = title.length < 10;

  // Check for very long titles (likely not news)
  const isTooLong = title.length > 200;

  // Check for titles that look like page sections rather than news
  const isPageSection =
    lowerTitle.includes('welcome') ||
    lowerTitle.includes('overview') ||
    lowerTitle.includes('introduction') ||
    lowerTitle.includes('services') ||
    lowerTitle.includes('information');

  // Check for URLs that are just domain names or copyright text
  const isUrlOnly = title.startsWith('https://') && title.length < 100;

  return (
    hasNavKeyword ||
    isCopyright ||
    isTooShort ||
    isTooLong ||
    isPageSection ||
    isUrlOnly
  );
}

/**
 * Get suggested selectors for a website
 */
export function getSuggestedSelectors(
  html: string,
  _url: string
): {
  listSelector: string;
  itemSelector: string;
  titleSelector: string;
  linkSelector: string;
  dateSelector: string;
  contentSelector: string;
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const $: any = loadCheerio(html);

  // Analyze the page structure and suggest selectors
  const suggestions = {
    listSelector: '',
    itemSelector: '',
    titleSelector: '',
    linkSelector: '',
    dateSelector: '',
    contentSelector: '',
  };

  // Look for common patterns
  const commonPatterns = [
    {
      list: '.post, article',
      item: '.post, article',
      title: 'h1, h2, .entry-title',
      link: 'a',
      date: '.date, time',
      content: '.entry-content, .content',
    },
    {
      list: '.news-item, .article',
      item: '.news-item, .article',
      title: 'h1, h2, h3, .title',
      link: 'a',
      date: '.date, .published',
      content: '.content, .excerpt',
    },
    {
      list: '.card, .item',
      item: '.card, .item',
      title: 'h1, h2, h3, .card-title',
      link: 'a',
      date: '.date, .meta',
      content: '.content, .description',
    },
  ];

  for (const pattern of commonPatterns) {
    const listElements = $(pattern.list);
    if (listElements.length > 0) {
      suggestions.listSelector = pattern.list;
      suggestions.itemSelector = pattern.item;
      suggestions.titleSelector = pattern.title;
      suggestions.linkSelector = pattern.link;
      suggestions.dateSelector = pattern.date;
      suggestions.contentSelector = pattern.content;
      break;
    }
  }

  return suggestions;
}
