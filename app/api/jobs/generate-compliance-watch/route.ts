/**
 * Cron job: Generate daily Compliance Watch report
 * Runs: Daily at 06:00 UTC
 * Triggers: Change detection → Report generation → Email delivery
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { generateDailyReport } from '@/lib/reports/generator';
import { sendReportEmails } from '@/lib/email/sender';

// Allow up to 300 s on Vercel Pro/Enterprise (Hobby is capped at 60 s by Vercel)
export const maxDuration = 300;

// Protect cron endpoint
function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('CRON_SECRET not set, allowing request');
    return true; // In development
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check kill switch
    const killSwitch = await db.getSetting('compliance_watch:kill_switch');

    if (killSwitch && JSON.parse(killSwitch.value_json) === true) {
      console.log('Kill switch is ON, aborting report generation');
      return NextResponse.json({
        message: 'Report generation disabled by kill switch',
        skipped: true,
      });
    }

    // Get Compliance Watch product
    const product = await db.findProductBySlug('compliance-watch');

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get allowed languages
    const languagesSetting = await db.getSetting(
      'compliance_watch:allowed_languages',
    );
    const languages = languagesSetting
      ? JSON.parse(languagesSetting.value_json)
      : ['en'];

    // Generate report for primary language
    const primaryLanguage = languages[0] || 'en';
    console.log(`Generating report for ${product.name}...`);

    const result = await generateDailyReport(product.id, primaryLanguage);

    if (result.status === 'failed') {
      return NextResponse.json(
        {
          error: 'Report generation failed',
          reportId: result.reportId,
          errors: result.errors,
        },
        { status: 500 },
      );
    }

    // Skip email if no items
    if (result.totalItems === 0) {
      console.log('No items in report, skipping email');
      return NextResponse.json({
        message: 'Report generated (no new items)',
        reportId: result.reportId,
        totalItems: 0,
        emailsSent: 0,
      });
    }

    // Send emails to subscribers
    console.log(`Sending emails for report ${result.reportId}...`);
    const emailResult = await sendReportEmails({
      reportId: result.reportId,
      language: primaryLanguage,
    });

    // Log completion
    await db.createAuditLog({
      action: 'cron.generate_report',
      metaJson: JSON.stringify({
        reportId: result.reportId,
        totalItems: result.totalItems,
        emailsSent: emailResult.sent,
        errors: [...(result.errors || []), ...emailResult.errors],
      }),
    });

    return NextResponse.json({
      message: 'Report generated and emails sent successfully',
      reportId: result.reportId,
      totalItems: result.totalItems,
      emailsSent: emailResult.sent,
      errors: [...(result.errors || []), ...emailResult.errors],
    });
  } catch (error) {
    console.error('Cron job error:', error);

    // Log error
    await db.createAuditLog({
      action: 'cron.error',
      metaJson: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      }),
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Vercel Cron Jobs invoke via GET — delegate to POST which handles auth
export async function GET(request: NextRequest) {
  return POST(request);
}
