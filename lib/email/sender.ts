/**
 * Email sending utilities for Compliance Watch
 * Uses Resend to send report notifications
 */

import { Resend } from 'resend';
// Temporarily disabled - @react-email/components not installed
// import { render } from '@react-email/components';
// import ComplianceReportEmail from '@/emails/ComplianceReportEmail';
import * as db from '../db';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendReportEmailParams {
  reportId: string;
  language?: string;
}

/**
 * Send report emails to all eligible subscribers
 */
export async function sendReportEmails(
  params: SendReportEmailParams
): Promise<{ sent: number; errors: string[] }> {
  const { reportId, language = 'en' } = params;

  const errors: string[] = [];
  let sent = 0;

  // Get report details
  const report = await db.findReportById(reportId);

  if (!report || report.status !== 'PUBLISHED') {
    throw new Error('Report not found or not published');
  }

  // Get all active subscribers for this product
  const subscribers = await db.findActiveSubscribersForProduct(
    report.product_id
  );

  const reportUrl = `${process.env.NEXTAUTH_URL}/digital/compliance-watch/reports/${formatDateForUrl(report.date)}`;

  // Send emails
  for (const subscription of subscribers) {
    try {
      await sendReportEmail({
        to: subscription.email,
        userName: subscription.user_name || 'there',
        reportDate: formatDateForEmail(report.date, language),
        reportUrl,
        totalItems: report.total_items,
        language,
        reportId: report.id,
      });
      sent++;
    } catch (error) {
      console.error(`Error sending email to ${subscription.email}:`, error);
      errors.push(`Failed to send to ${subscription.email}`);
    }
  }

  return { sent, errors };
}

interface SendReportEmailOptions {
  to: string;
  userName: string;
  reportDate: string;
  reportUrl: string;
  totalItems: number;
  language: string;
  reportId: string;
}

async function sendReportEmail(options: SendReportEmailOptions) {
  const { to, userName, reportUrl, totalItems, language, reportId } = options;

  // Get report with items to build table
  const report = await db.findReportWithItems(reportId || '');

  // Group items by source name
  const itemsBySource = new Map<string, typeof report.items>();
  if (report?.items) {
    for (const item of report.items) {
      const sourceName = item.source_name;
      if (!itemsBySource.has(sourceName)) {
        itemsBySource.set(sourceName, []);
      }
      itemsBySource.get(sourceName)!.push(item);
    }
  }

  // Build summary for each source (combine bullet points)
  const sourceSummaries: Array<{ sourceName: string; summary: string }> = [];
  for (const sourceName of Array.from(itemsBySource.keys())) {
    const items = itemsBySource.get(sourceName) || [];
    const allBullets: string[] = [];
    for (const item of items) {
      try {
        const summary = JSON.parse(item.summary_json);
        if (summary.bullet_points && Array.isArray(summary.bullet_points)) {
          allBullets.push(...summary.bullet_points);
        }
      } catch {
        // Skip if can't parse
      }
    }
    // Combine bullets into one summary (limit to 5 key points)
    const combinedSummary =
      allBullets.slice(0, 5).join(' • ') || 'No summary available';
    sourceSummaries.push({ sourceName, summary: combinedSummary });
  }

  // Build email HTML with table format matching manual workflow
  const translations = getEmailTranslations(language);
  // reportDate is already formatted string, extract date from report
  const reportForDate = await db.findReportById(reportId || '');
  const dateForSubject = reportForDate?.date
    ? formatDateForSubject(reportForDate.date)
    : formatDateForSubject(new Date());

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
          line-height: 1.6;
          color: #111213;
          background: #f7faf9;
          padding: 2rem 1rem;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          background: #ffffff;
          padding: 2rem;
          border-radius: 0.5rem;
        }
        .header {
          border-bottom: 3px solid #749694;
          padding-bottom: 1rem;
          margin-bottom: 2rem;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: #141a1b;
        }
        .greeting {
          font-size: 1rem;
          color: #354848;
          margin-bottom: 1.5rem;
        }
        .summary-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2rem;
          border: 1px solid #dce7e6;
        }
        .summary-table th {
          background: #edf3f3;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #141a1b;
          border-bottom: 2px solid #749694;
        }
        .summary-table td {
          padding: 1rem;
          border-bottom: 1px solid #dce7e6;
          vertical-align: top;
        }
        .summary-table tr:last-child td {
          border-bottom: none;
        }
        .source-name {
          font-weight: 600;
          color: #141a1b;
          width: 30%;
        }
        .source-summary {
          color: #354848;
        }
        .footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 2px solid #dce7e6;
          text-align: center;
          color: #5f7b7b;
          font-size: 0.875rem;
        }
        .view-report-btn {
          display: inline-block;
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: #749694;
          color: #ffffff;
          text-decoration: none;
          border-radius: 0.5rem;
          font-weight: 600;
        }
        .view-report-btn:hover {
          background: #5f7b7b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Fermidas</div>
        </div>
        
        <div class="greeting">
          ${translations.greeting.replace('{name}', userName)}
        </div>

        ${
          totalItems > 0
            ? `
        <table class="summary-table">
          <thead>
            <tr>
              <th>${translations.tableColumn1}</th>
              <th>${translations.tableColumn2}</th>
            </tr>
          </thead>
          <tbody>
            ${sourceSummaries
              .map(
                ({ sourceName, summary }) => `
            <tr>
              <td class="source-name">${escapeHtml(sourceName)}</td>
              <td class="source-summary">${escapeHtml(summary)}</td>
            </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div style="text-align: center;">
          <a href="${reportUrl}" class="view-report-btn">${translations.viewFullReport}</a>
        </div>
        `
            : `
        <p style="color: #5f7b7b; text-align: center; padding: 2rem;">
          ${translations.noUpdates}
        </p>
        `
        }
        
        <div class="footer">
          <p>${translations.generatedBy} <strong>Fermidas Compliance Watch</strong></p>
          <p>${translations.visitWebsite}: <a href="https://www.fermidas.com" style="color: #749694;">www.fermidas.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const subject = `Compliance watch ${dateForSubject}`;

  await resend.emails.send({
    from: 'Fermidas Compliance Watch <reports@fermidas.com>',
    to,
    subject,
    html: emailHtml,
  });
}

/**
 * Send a test email (for admin testing)
 */
export async function sendTestEmail(to: string, language: string = 'en') {
  // Temporarily disabled - @react-email/components not installed
  // const emailHtml = await render(
  //   ComplianceReportEmail({
  //     reportDate: formatDateForEmail(new Date(), language),
  //     reportUrl: `${process.env.NEXTAUTH_URL}/digital/compliance-watch`,
  //     totalItems: 5,
  //     userName: 'Admin',
  //     language,
  //   })
  // );

  // Simple HTML email as fallback
  const emailHtml = `
    <html>
      <body>
        <h1>[TEST] Compliance Watch Report</h1>
        <p>Hello Admin,</p>
        <p>This is a test email from Compliance Watch.</p>
        <p>Report Date: ${formatDateForEmail(new Date(), language)}</p>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: 'Fermidas Compliance Watch <reports@fermidas.com>',
    to,
    subject: '[TEST] Compliance Watch Report',
    html: emailHtml,
  });
}

function formatDateForUrl(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateForEmail(date: Date, language: string): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(date).toLocaleDateString(
    language === 'fr' ? 'fr-FR' : 'en-US',
    options
  );
}

function formatDateForSubject(date: Date | string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getEmailTranslations(language: string) {
  const translations: Record<string, Record<string, string>> = {
    en: {
      greeting: 'Hello {name},',
      tableColumn1: 'Website/Media Name',
      tableColumn2: 'Summary of Findings',
      viewFullReport: 'View Full Report',
      noUpdates: "No new updates were found in today's scan.",
      generatedBy: 'Generated by',
      visitWebsite: 'Visit our website',
    },
    fr: {
      greeting: 'Bonjour {name},',
      tableColumn1: 'Nom du site Web / Média',
      tableColumn2: 'Résumé des résultats',
      viewFullReport: 'Voir le rapport complet',
      noUpdates: "Aucune mise à jour trouvée lors du scan d'aujourd'hui.",
      generatedBy: 'Généré par',
      visitWebsite: 'Visitez notre site Web',
    },
  };

  return translations[language] || translations.en;
}
