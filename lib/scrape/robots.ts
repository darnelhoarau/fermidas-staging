/**
 * robots.txt parser and checker
 * Respects website crawling rules
 */

import robotsParser from 'robots-parser';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const robotsCache = new Map<string, any>();

export async function canFetch(url: string, userAgent: string = 'FermidasBot'): Promise<boolean> {
  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

    // Check cache
    if (robotsCache.has(robotsUrl)) {
      const robots = robotsCache.get(robotsUrl);
      return robots?.isAllowed(url, userAgent) ?? true;
    }

    // Fetch robots.txt
    const response = await fetch(robotsUrl, {
      headers: {
        'User-Agent': userAgent,
      },
    });

    let robotsTxt = '';
    if (response.ok) {
      robotsTxt = await response.text();
    }

    // Parse and cache
    const robots = robotsParser(robotsUrl, robotsTxt);
    robotsCache.set(robotsUrl, robots);

    return robots?.isAllowed(url, userAgent) ?? true;
  } catch (error) {
    // If we can't fetch robots.txt, default to allowing
    console.warn(`Could not fetch robots.txt for ${url}:`, error);
    return true;
  }
}

export async function getCrawlDelay(url: string, userAgent: string = 'FermidasBot'): Promise<number> {
  try {
    const urlObj = new URL(url);
    const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;

    if (robotsCache.has(robotsUrl)) {
      const robots = robotsCache.get(robotsUrl);
      const delay = robots.getCrawlDelay(userAgent);
      return delay ? delay * 1000 : 1000; // Convert to ms, default 1s
    }

    return 1000; // Default 1 second
  } catch {
    return 1000;
  }
}

