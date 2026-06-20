import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import * as db from '../lib/db';
import { renderReportHtml } from '../lib/reports/renderer';

async function main() {
  const productId = 'clx-compliance-watch-001';
  const language = 'en';

  // Find today's report
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const report = await db.findReportByDate(productId, today);

  if (!report) {
    console.error('No report found for today');
    process.exit(1);
  }

  console.log(`Regenerating HTML for report: ${report.id} (${report.status})`);

  const html = await renderReportHtml(report.id, language);

  const existing = await db.findReportLanguage(report.id, language);
  if (existing) {
    await db.updateReportLanguageHtml(report.id, language, html);
    console.log('HTML updated in DB');
  } else {
    await db.createReportLanguage({ reportId: report.id, language, html });
    console.log('HTML created in DB');
  }

  const preview = html.slice(0, 300);
  console.log('\nHTML preview (first 300 chars):\n', preview);

  // Verify category IDs are present
  const catMatches = html.match(/id="cat-[^"]+"/g) ?? [];
  console.log(`\nCategory IDs found: ${catMatches.length}`);
  catMatches.forEach((m) => console.log(' ', m));

  process.exit(0);
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
