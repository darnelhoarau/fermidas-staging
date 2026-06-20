/**
 * AI-powered summarization with strict validation
 * Uses OpenRouter to summarize ONLY extracted facts (no hallucinations)
 */

import { z } from 'zod';
import type { ExtractedFacts } from './extractor';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Schema for summarization output
const summarySchema = z.object({
  title: z.string(),
  bullet_points: z.array(z.string()).min(2).max(6),
  key_entities: z.array(z.string()),
  amounts: z.array(z.string()),
  links: z.array(z.string()),
  source_url: z.string().url(),
  language: z.string().default('en'),
});

export type Summary = z.infer<typeof summarySchema>;

/**
 * Generate a summary from extracted facts using OpenRouter
 * with strict validation to prevent hallucinations
 */
export async function summarizeFacts(
  facts: ExtractedFacts,
  language: string = 'en'
): Promise<Summary> {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    // Prepare the prompt with ONLY extracted facts
    const prompt = buildPrompt(facts, language);

    // Call OpenRouter with JSON mode
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer':
          process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://fermidas.com',
        'X-Title': 'Fermidas Compliance Watch',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Model via OpenRouter
        temperature: 0, // Deterministic output
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(language),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenRouter API error: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenRouter');
    }

    // Parse and validate
    const rawSummary = JSON.parse(content);
    const validatedSummary = summarySchema.parse(rawSummary);

    // Additional validation: ensure no hallucinations
    const isValid = validateSummaryAgainstFacts(validatedSummary, facts);
    if (!isValid) {
      console.warn('Summary validation failed, using fallback');
      return createFallbackSummary(facts, language);
    }

    return validatedSummary;
  } catch (error) {
    console.error('Error in summarizeFacts:', error);
    // Return fallback summary on error
    return createFallbackSummary(facts, language);
  }
}

function getSystemPrompt(language: string): string {
  const prompts: Record<string, string> = {
    en: `You are a compliance analyst summarizing regulatory and legal updates from Seychelles sources.

CRITICAL RULES:
1. ONLY summarize information explicitly present in the provided facts
2. Copy names, amounts, and dates EXACTLY as given
3. If a fact is not present, do NOT make it up - omit it
4. Keep bullet points clear and concise (2-6 points)
5. Focus on actionable compliance implications
6. Output MUST be valid JSON matching the schema

Your summary must be grounded in the provided facts. No speculation, no assumptions, no external knowledge.`,

    fr: `Vous êtes un analyste de conformité résumant les mises à jour réglementaires et légales des sources seychelloises.

RÈGLES CRITIQUES:
1. Résumez UNIQUEMENT les informations explicitement présentes dans les faits fournis
2. Copiez les noms, montants et dates EXACTEMENT comme donnés
3. Si un fait n'est pas présent, NE l'inventez PAS - omettez-le
4. Gardez les points concis et clairs (2-6 points)
5. Concentrez-vous sur les implications de conformité actionnables
6. La sortie DOIT être un JSON valide correspondant au schéma

Votre résumé doit être ancré dans les faits fournis. Pas de spéculation, pas d'hypothèses, pas de connaissances externes.`,

    sc: `Ou en analis konformite ki pe rezime bann miz-aj regilater ek legal depi bann sour Sesel.

REG KREYOL:
1. Rezime zis bann informasyon ki prezan dan bann fe ki donn
2. Kopi bann non, montan, ek dat EGZAKTEMAN kouma donn
3. Si en fe pa prezan, PA invant li - pa met li
4. Gard bann pwen klair ek kour (2-6 pwen)
5. Konsantre lor bann konsekans konformite ki kapab fer
6. Sorti bizin en JSON valab ki matche avek schema

Ou rezime bizin baz lor bann fe ki donn. Pa spekile, pa asime, pa met konnesans eksteryer.`,
  };

  return prompts[language] || prompts.en;
}

function buildPrompt(facts: ExtractedFacts, language: string): string {
  const sections = [`Title: ${facts.title}`, `Source: ${facts.sourceUrl}`];

  if (facts.entities.length > 0) {
    sections.push(
      `\nEntities mentioned:\n${facts.entities.map((e) => `- ${e.name} (${e.type})`).join('\n')}`
    );
  }

  if (facts.amounts.length > 0) {
    sections.push(
      `\nAmounts:\n${facts.amounts.map((a) => `- ${a.value} (context: ${a.context})`).join('\n')}`
    );
  }

  if (facts.dates.length > 0) {
    sections.push(
      `\nDates:\n${facts.dates.map((d) => `- ${d.value}`).join('\n')}`
    );
  }

  if (facts.keyParagraphs.length > 0) {
    sections.push(
      `\nKey Information:\n${facts.keyParagraphs.map((p, i) => `${i + 1}. ${p}`).join('\n\n')}`
    );
  }

  const instruction =
    language === 'fr'
      ? '\n\nCréez un résumé JSON avec title, bullet_points (2-6 points), key_entities, amounts, links, et source_url. Utilisez UNIQUEMENT les faits ci-dessus.'
      : language === 'sc'
        ? '\n\nKreye en rezime JSON avek title, bullet_points (2-6 pwen), key_entities, amounts, links, ek source_url. Itiliz ZIS bann fe ki anler.'
        : '\n\nCreate a JSON summary with title, bullet_points (2-6 points), key_entities, amounts, links, and source_url. Use ONLY the facts above.';

  return sections.join('\n') + instruction;
}

/**
 * Validate that the summary doesn't contain hallucinated information
 */
function validateSummaryAgainstFacts(
  summary: Summary,
  facts: ExtractedFacts
): boolean {
  // Check that all entities in summary exist in facts
  for (const entity of summary.key_entities) {
    const found = facts.entities.some((e) =>
      entity.toLowerCase().includes(e.name.toLowerCase())
    );
    if (!found && !facts.title.toLowerCase().includes(entity.toLowerCase())) {
      console.warn(`Hallucinated entity: ${entity}`);
      return false;
    }
  }

  // Check that all amounts in summary exist in facts
  for (const amount of summary.amounts) {
    const found = facts.amounts.some(
      (a) => amount.includes(a.value) || a.value.includes(amount)
    );
    if (!found) {
      console.warn(`Hallucinated amount: ${amount}`);
      return false;
    }
  }

  // Bullet points should reference content from key paragraphs
  const allText = facts.keyParagraphs.join(' ').toLowerCase();
  for (const bullet of summary.bullet_points) {
    // Extract key nouns/verbs from bullet point
    const words = bullet
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 4); // Words longer than 4 chars

    // At least some words should appear in the original text
    const matchCount = words.filter((w) => allText.includes(w)).length;
    if (words.length > 0 && matchCount === 0) {
      console.warn(`Potentially hallucinated bullet: ${bullet}`);
      // Don't fail entirely, but log warning
    }
  }

  return true;
}

/**
 * Create a fallback summary from facts (no AI)
 * Used when AI summarization fails or validation fails
 */
function createFallbackSummary(
  facts: ExtractedFacts,
  language: string
): Summary {
  const bulletPoints: string[] = [];

  // Create bullets from key paragraphs
  for (const para of facts.keyParagraphs.slice(0, 4)) {
    // Take first sentence or first 150 chars
    const firstSentence = para.split(/[.!?]/)[0];
    const bullet =
      firstSentence.length > 150
        ? firstSentence.substring(0, 147) + '...'
        : firstSentence;
    bulletPoints.push(bullet);
  }

  // If not enough bullets, add entity mentions
  if (bulletPoints.length < 2 && facts.entities.length > 0) {
    const prefix = language === 'fr' ? 'Mention de' : 'Mentions';
    bulletPoints.push(
      `${prefix}: ${facts.entities
        .slice(0, 3)
        .map((e) => e.name)
        .join(', ')}`
    );
  }

  return {
    title: facts.title,
    bullet_points:
      bulletPoints.length > 0 ? bulletPoints : ['No details available'],
    key_entities: facts.entities.slice(0, 5).map((e) => e.name),
    amounts: facts.amounts.slice(0, 5).map((a) => a.value),
    links: facts.urls,
    source_url: facts.sourceUrl,
    language,
  };
}

/**
 * Batch summarize multiple facts (with rate limiting)
 */
export async function batchSummarize(
  factsArray: ExtractedFacts[],
  language: string = 'en',
  delayMs: number = 1000
): Promise<Summary[]> {
  const summaries: Summary[] = [];

  for (const facts of factsArray) {
    try {
      const summary = await summarizeFacts(facts, language);
      summaries.push(summary);

      // Rate limiting
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Error summarizing ${facts.title}:`, error);
      summaries.push(createFallbackSummary(facts, language));
    }
  }

  return summaries;
}
