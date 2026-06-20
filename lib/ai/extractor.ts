/**
 * Deterministic fact extraction from raw text
 * Extracts entities, amounts, dates, and key paragraphs WITHOUT AI
 * This ensures we have grounded facts before summarization
 */

export interface ExtractedFacts {
  title: string;
  entities: {
    type: 'organization' | 'person' | 'location';
    name: string;
    mentions: number;
  }[];
  amounts: {
    value: string; // Exact text (e.g. "SCR 1,000,000")
    context: string; // Surrounding context
  }[];
  dates: {
    value: string; // Exact text
    parsed?: Date;
  }[];
  keyParagraphs: string[]; // Important paragraphs/sentences
  urls: string[];
  sourceUrl: string;
}

/**
 * Extract facts from raw text using deterministic rules
 */
export function extractFacts(
  rawText: string,
  title: string,
  sourceUrl: string
): ExtractedFacts {
  const facts: ExtractedFacts = {
    title,
    entities: [],
    amounts: [],
    dates: [],
    keyParagraphs: [],
    urls: [],
    sourceUrl,
  };

  // Extract amounts (currency patterns)
  const amountPatterns = [
    // SCR formats
    /SCR\s*[\d,]+(?:\.\d{2})?/gi,
    /Seychelles\s+Rupees?\s*[\d,]+(?:\.\d{2})?/gi,
    /Rs\.?\s*[\d,]+(?:\.\d{2})?/gi,
    // USD formats
    /USD?\s*\$?\s*[\d,]+(?:\.\d{2})?/gi,
    /\$\s*[\d,]+(?:\.\d{2})?/gi,
    // EUR formats
    /EUR?\s*€?\s*[\d,]+(?:\.\d{2})?/gi,
    /€\s*[\d,]+(?:\.\d{2})?/gi,
  ];

  for (const pattern of amountPatterns) {
    const matches = rawText.matchAll(pattern);
    for (const match of matches) {
      const value = match[0];
      // Get 50 chars before and after for context
      const index = match.index || 0;
      const contextStart = Math.max(0, index - 50);
      const contextEnd = Math.min(rawText.length, index + value.length + 50);
      const context = rawText.slice(contextStart, contextEnd).trim();

      facts.amounts.push({ value, context });
    }
  }

  // Extract dates
  const datePatterns = [
    // ISO format
    /\d{4}-\d{2}-\d{2}/g,
    // DD Month YYYY
    /\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/gi,
    // Month DD, YYYY
    /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi,
    // DD/MM/YYYY
    /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/g,
  ];

  for (const pattern of datePatterns) {
    const matches = rawText.matchAll(pattern);
    for (const match of matches) {
      const value = match[0];
      try {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
          facts.dates.push({ value, parsed });
        } else {
          facts.dates.push({ value });
        }
      } catch {
        facts.dates.push({ value });
      }
    }
  }

  // Extract capitalized entities (potential organizations/people)
  // Look for sequences of capitalized words
  const entityPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;
  const entityCounts = new Map<string, number>();
  const matches = rawText.matchAll(entityPattern);
  
  for (const match of matches) {
    const entity = match[0];
    // Filter out common false positives
    if (!isCommonPhrase(entity)) {
      entityCounts.set(entity, (entityCounts.get(entity) || 0) + 1);
    }
  }

  // Convert to entities array (only those mentioned 2+ times)
  for (const [name, mentions] of entityCounts.entries()) {
    if (mentions >= 2) {
      facts.entities.push({
        type: inferEntityType(name),
        name,
        mentions,
      });
    }
  }

  // Extract URLs
  const urlPattern = /https?:\/\/[^\s<>"]+/gi;
  const urlMatches = rawText.matchAll(urlPattern);
  for (const match of urlMatches) {
    facts.urls.push(match[0]);
  }

  // Extract key paragraphs
  // Look for paragraphs with important keywords or substantial content
  const paragraphs = rawText.split(/\n\n+/).filter((p) => p.trim().length > 50);
  const importantKeywords = [
    'announce',
    'require',
    'must',
    'shall',
    'comply',
    'regulation',
    'law',
    'penalty',
    'fine',
    'license',
    'suspend',
    'revoke',
    'approve',
    'reject',
    'deadline',
    'effective',
    'amendment',
  ];

  for (const para of paragraphs) {
    const lowerPara = para.toLowerCase();
    const hasKeyword = importantKeywords.some((kw) => lowerPara.includes(kw));
    const hasAmount = facts.amounts.some((amt) => para.includes(amt.value));
    const hasDate = facts.dates.some((date) => para.includes(date.value));

    if (hasKeyword || hasAmount || hasDate) {
      facts.keyParagraphs.push(para.trim());
    }
  }

  // Limit key paragraphs to top 5
  facts.keyParagraphs = facts.keyParagraphs.slice(0, 5);

  return facts;
}

function isCommonPhrase(text: string): boolean {
  const commonPhrases = [
    'United States',
    'United Kingdom',
    'South Africa',
    'New Zealand',
    'Saudi Arabia',
    'Terms Of Service',
    'Privacy Policy',
  ];

  return commonPhrases.some((phrase) =>
    text.toLowerCase().includes(phrase.toLowerCase())
  );
}

function inferEntityType(
  name: string
): 'organization' | 'person' | 'location' {
  const orgKeywords = [
    'bank',
    'authority',
    'commission',
    'ministry',
    'department',
    'agency',
    'corporation',
    'company',
    'limited',
    'ltd',
    'inc',
    'plc',
  ];

  const locationKeywords = ['seychelles', 'victoria', 'mahe', 'praslin'];

  const lowerName = name.toLowerCase();

  if (orgKeywords.some((kw) => lowerName.includes(kw))) {
    return 'organization';
  }

  if (locationKeywords.some((kw) => lowerName.includes(kw))) {
    return 'location';
  }

  // If it's 2 words and both capitalized, likely a person
  const words = name.split(/\s+/);
  if (words.length === 2 && words.every((w) => /^[A-Z]/.test(w))) {
    return 'person';
  }

  // Default to organization
  return 'organization';
}

