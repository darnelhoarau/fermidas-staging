/**
 * Report generation pipeline
 * Orchestrates change detection -> extraction -> summarization -> HTML generation
 */

import * as db from '../db';
import { extractFacts } from '../ai/extractor';
import { summarizeFacts } from '../ai/summarizer';
import { detectAllChanges } from '../scrape/change-detector';
import { renderReportHtml } from './renderer';

export interface ReportGenerationResult {
  reportId: string;
  date: Date;
  totalItems: number;
  status: 'success' | 'failed';
  errors?: string[];
}

/**
 * Generate a daily report for Compliance Watch
 */
export async function generateDailyReport(
  productId: string,
  language: string = 'en',
): Promise<ReportGenerationResult> {
  const errors: string[] = [];
  const reportDate = new Date();
  reportDate.setHours(0, 0, 0, 0); // Normalize to start of day

  try {
    // Check if report already exists for today
    const existing = await db.findReportByDate(productId, reportDate);

    if (existing && existing.status === 'PUBLISHED') {
      // Regenerate HTML if missing or stored as a legacy full HTML document
      const existingHtml = await db.findReportLanguage(existing.id, language);
      const isLegacyFormat =
        existingHtml && existingHtml.html.trimStart().startsWith('<!DOCTYPE');
      if (!existingHtml || isLegacyFormat) {
        console.log(
          isLegacyFormat
            ? 'Report has legacy full-document HTML, regenerating as fragment...'
            : 'Report published but HTML missing, regenerating HTML...',
        );
        try {
          const html = await renderReportHtml(existing.id, language);
          if (existingHtml) {
            await db.updateReportLanguageHtml(existing.id, language, html);
          } else {
            await db.createReportLanguage({
              reportId: existing.id,
              language,
              html,
            });
          }
          console.log('HTML regenerated successfully');
        } catch (htmlError) {
          console.error('HTML regeneration failed:', htmlError);
        }
      }
      return {
        reportId: existing.id,
        date: reportDate,
        totalItems: existing.total_items,
        status: 'success',
      };
    }

    // Step 1: Get unprocessed changes since last report
    // Check BEFORE scraping — a previous run may have scraped but timed out
    // during AI processing, leaving pending changes already in the DB.
    const lastReport = await db.findLatestPublishedReport(productId);

    const since = lastReport?.date
      ? new Date(lastReport.date)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);
    let categoriesWithChanges = await getUnprocessedChanges(since, productId);

    const countUnprocessed = (cats: typeof categoriesWithChanges) =>
      cats.reduce((sum, cat) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sources: any[] = Array.isArray(cat.sources)
          ? cat.sources
          : cat.sources
            ? JSON.parse(cat.sources as unknown as string)
            : [];
        return (
          sum +
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sources.reduce((s: number, src: any) => {
            const changes = Array.isArray(src.source_changes)
              ? src.source_changes
              : [];
            return s + changes.length;
          }, 0)
        );
      }, 0);

    const pendingBeforeScrape = countUnprocessed(categoriesWithChanges);
    console.log(`Found ${pendingBeforeScrape} pending unprocessed changes`);

    // Step 2: Run scraping only if no pending changes from a previous run
    if (pendingBeforeScrape === 0) {
      console.log('No pending changes, detecting changes from sources...');
      const changeResults = await detectAllChanges(productId);
      const totalNewChanges = changeResults.reduce(
        (sum, r) => sum + r.newChanges,
        0,
      );
      console.log(`Scraped ${totalNewChanges} new changes`);

      if (totalNewChanges === 0) {
        console.log('No new changes, skipping report generation');
        const report = await db.createReport({
          productId,
          date: reportDate,
          languageDefault: language,
        });
        return {
          reportId: report.id,
          date: reportDate,
          totalItems: 0,
          status: 'success',
        };
      }

      // Refresh unprocessed list after scraping
      categoriesWithChanges = await getUnprocessedChanges(since, productId);
    }

    const totalUnprocessed = countUnprocessed(categoriesWithChanges);
    console.log(`Processing ${totalUnprocessed} unprocessed changes...`);

    // Step 3: Create report
    const report =
      existing ||
      (await db.createReport({
        productId,
        date: reportDate,
        languageDefault: language,
      }));

    // Step 4: Process each change through extraction & summarization
    let processedItems = 0;

    for (const category of categoriesWithChanges) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sources: any[] = Array.isArray(category.sources)
        ? category.sources
        : category.sources
          ? JSON.parse(category.sources as unknown as string)
          : [];

      for (const source of sources) {
        // source_changes lives directly on the source (flat structure from fixed query)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sourceChanges: any[] = Array.isArray(source.source_changes)
          ? source.source_changes
          : source.source_changes
            ? JSON.parse(source.source_changes as unknown as string)
            : [];

        if (sourceChanges.length === 0) continue;

        for (const change of sourceChanges) {
          try {
            const facts = extractFacts(
              change.raw_text || '',
              change.title,
              change.url,
            );

            const summary = await summarizeFacts(facts, language);

            await db.createReportItem({
              reportId: report.id,
              sourceId: source.id,
              sourceChangeId: change.id,
              sourceName: source.name,
              url: change.url,
              title: change.title,
              extractedFactsJson: JSON.stringify(facts),
              summaryJson: JSON.stringify(summary),
              language,
            });

            processedItems++;
          } catch (error) {
            console.error(`Error processing change ${change.id}:`, error);
            errors.push(
              `Failed to process: ${change.title} from ${source.name}`,
            );
          }
        }
      }
    }

    // Step 5: Generate HTML for each language
    const allowedLanguages = await getAllowedLanguages();

    for (const lang of allowedLanguages) {
      try {
        const html = await renderReportHtml(report.id, lang);

        await db.createReportLanguage({
          reportId: report.id,
          language: lang,
          html,
        });
      } catch (error) {
        console.error(`Error generating HTML for ${lang}:`, error);
        errors.push(`Failed to generate ${lang} version`);
      }
    }

    // Step 6: Publish report
    await db.updateReport(report.id, {
      status: 'PUBLISHED',
      totalItems: processedItems,
      publishedAt: new Date(),
    });

    // Step 7: Log audit
    await db.createAuditLog({
      action: 'report.generated',
      metaJson: JSON.stringify({
        reportId: report.id,
        date: reportDate.toISOString(),
        totalItems: processedItems,
        languages: allowedLanguages,
      }),
    });

    return {
      reportId: report.id,
      date: reportDate,
      totalItems: processedItems,
      status: 'success',
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Report generation failed:', error);

    return {
      reportId: '',
      date: reportDate,
      totalItems: 0,
      status: 'failed',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

async function getUnprocessedChanges(since: Date, productId: string) {
  return await db.findUnprocessedChanges(productId, since);
}

async function getAllowedLanguages(): Promise<string[]> {
  const setting = await db.getSetting('compliance_watch:allowed_languages');

  if (setting) {
    return JSON.parse(setting.value_json);
  }

  return ['en']; // Default to English
}
