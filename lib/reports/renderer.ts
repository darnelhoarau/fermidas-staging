import * as db from '../db';
import type { Summary } from '../ai/summarizer';

const NO_DETAILS = 'No details available';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

function isEmptySummary(summary: Summary): boolean {
  return (
    summary.bullet_points.length === 0 ||
    summary.bullet_points.every((p) => p === NO_DETAILS)
  );
}

export async function renderReportHtml(
  reportId: string,
  language: string = 'en',
): Promise<string> {
  const report = await db.findReportWithItems(reportId);

  if (!report) {
    throw new Error('Report not found');
  }

  const itemsByCategory = new Map<string, typeof report.items>();

  for (const item of report.items || []) {
    const categoryName = item.category_name;
    if (!itemsByCategory.has(categoryName)) {
      itemsByCategory.set(categoryName, []);
    }
    itemsByCategory.get(categoryName)!.push(item);
  }

  const translations = getTranslations(language);

  const usedSlugs = new Map<string, number>();
  const categoryBlocks = Array.from(itemsByCategory.entries())
    .map(([categoryName, items]) => {
      const rendered = renderItems(items, translations);
      if (!rendered) return '';
      const base = slugify(categoryName);
      const count = usedSlugs.get(base) ?? 0;
      usedSlugs.set(base, count + 1);
      const id = count === 0 ? `cat-${base}` : `cat-${base}-${count}`;
      return `
      <div class="category" id="${id}">
        <h2 class="category-title">${categoryName}</h2>
        ${rendered}
      </div>`;
    })
    .filter(Boolean)
    .join('');

  const visibleCount = Array.from(itemsByCategory.values()).reduce(
    (sum, items) =>
      sum +
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items.filter((item: any) => {
        try {
          return !isEmptySummary(JSON.parse(item.summary_json) as Summary);
        } catch {
          return false;
        }
      }).length,
    0,
  );

  const html = `<style>
  .report-content * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .report-content {
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
    line-height: 1.6;
    color: #111213;
  }

  .report-content .rpt-summary {
    background: #edf3f3;
    padding: 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 3rem;
  }

  .report-content .rpt-summary-title {
    font-weight: 600;
    color: #141a1b;
    margin-bottom: 0.75rem;
  }

  .report-content .category {
    margin-bottom: 3rem;
  }

  .report-content .category-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #141a1b;
    border-left: 4px solid #749694;
    padding-left: 1rem;
    margin-bottom: 1.5rem;
  }

  .report-content .source-group {
    margin-bottom: 2rem;
  }

  .report-content .source-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: #354848;
    margin-bottom: 1rem;
  }

  .report-content .item {
    background: #ffffff;
    border: 1px solid #dce7e6;
    border-radius: 0.5rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .report-content .item-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #141a1b;
    margin-bottom: 0.75rem;
  }

  .report-content .item-title a {
    color: #141a1b;
    text-decoration: none;
    transition: color 0.2s;
  }

  .report-content .item-title a:hover {
    color: #749694;
  }

  .report-content .item-bullets {
    list-style: none;
    margin-bottom: 1rem;
  }

  .report-content .item-bullets li {
    padding-left: 1.5rem;
    margin-bottom: 0.5rem;
    position: relative;
  }

  .report-content .item-bullets li:before {
    content: "→";
    position: absolute;
    left: 0;
    color: #749694;
    font-weight: bold;
  }

  .report-content .item-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.875rem;
    color: #5f7b7b;
    padding-top: 0.75rem;
    border-top: 1px solid #dce7e6;
  }

  .report-content .meta-group {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .report-content .meta-label {
    font-weight: 600;
  }

  .report-content .badge {
    display: inline-block;
    background: #e8f2f1;
    color: #2e7d6d;
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  @media print {
    .report-content .item {
      page-break-inside: avoid;
    }
  }
</style>

<div class="rpt-summary">
  <div class="rpt-summary-title">${translations.summary}</div>
  ${
    visibleCount > 0
      ? `<p>${translations.totalUpdates.replace('{count}', visibleCount.toString())} ${translations.acrossSources.replace('{count}', itemsByCategory.size.toString())}</p>`
      : `<p>${translations.noUpdates}</p>`
  }
</div>

${categoryBlocks || `<p>${translations.noUpdates}</p>`}`;

  return html;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderItems(items: any[], translations: any): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemsBySource = new Map<string, any[]>();

  for (const item of items) {
    const sourceName = item.source_name;
    if (!itemsBySource.has(sourceName)) {
      itemsBySource.set(sourceName, []);
    }
    itemsBySource.get(sourceName)!.push(item);
  }

  const sourceBlocks = Array.from(itemsBySource.entries())
    .map(([sourceName, sourceItems]) => {
      const itemBlocks = sourceItems
        .map((item) => {
          let summary: Summary;
          try {
            summary = JSON.parse(item.summary_json) as Summary;
          } catch {
            return '';
          }

          if (isEmptySummary(summary)) return '';

          const metaSection =
            summary.key_entities.length > 0 || summary.amounts.length > 0
              ? `
          <div class="item-meta">
            ${
              summary.key_entities.length > 0
                ? `<div class="meta-group">
              <span class="meta-label">${translations.entities}:</span>
              <span>${summary.key_entities.slice(0, 3).join(', ')}</span>
            </div>`
                : ''
            }
            ${
              summary.amounts.length > 0
                ? `<div class="meta-group">
              <span class="meta-label">${translations.amounts}:</span>
              <span>${summary.amounts.slice(0, 3).join(', ')}</span>
            </div>`
                : ''
            }
          </div>`
              : '';

          return `
        <div class="item">
          <h3 class="item-title">
            <a href="${item.url}" target="_blank">${summary.title}</a>
          </h3>
          <ul class="item-bullets">
            ${summary.bullet_points.map((point) => `<li>${point}</li>`).join('')}
          </ul>
          ${metaSection}
          <div style="margin-top: 0.75rem;">
            <a href="${item.url}" target="_blank" class="badge">${translations.viewOriginal}</a>
          </div>
        </div>`;
        })
        .filter(Boolean)
        .join('');

      if (!itemBlocks) return '';

      return `
    <div class="source-group">
      <div class="source-name">${sourceName}</div>
      ${itemBlocks}
    </div>`;
    })
    .filter(Boolean)
    .join('');

  return sourceBlocks;
}

function formatDate(date: Date, language: string): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const localeMap: Record<string, string> = {
    fr: 'fr-FR',
    sc: 'en-US',
  };

  return new Date(date).toLocaleDateString(
    localeMap[language] || 'en-US',
    options,
  );
}

export function formatReportDate(date: Date, language: string): string {
  return formatDate(date, language);
}

function getTranslations(language: string) {
  const translations: Record<string, Record<string, string>> = {
    en: {
      summary: 'Summary',
      totalUpdates: '{count} new updates',
      acrossSources: 'across {count} categories',
      noUpdates: 'No new updates for this period.',
      entities: 'Entities',
      amounts: 'Amounts',
      viewOriginal: 'View Original',
    },
    fr: {
      summary: 'Résumé',
      totalUpdates: '{count} nouvelles mises à jour',
      acrossSources: 'dans {count} catégories',
      noUpdates: 'Aucune nouvelle mise à jour pour cette période.',
      entities: 'Entités',
      amounts: 'Montants',
      viewOriginal: "Voir l'original",
    },
    sc: {
      summary: 'Rezime',
      totalUpdates: '{count} nouvo miz-aj',
      acrossSources: 'dan {count} kategori',
      noUpdates: 'Pa ena nouvo miz-aj pou sa peryod la.',
      entities: 'Entite',
      amounts: 'Montan',
      viewOriginal: 'Vwar Orijinal',
    },
  };

  return translations[language] || translations.en;
}
