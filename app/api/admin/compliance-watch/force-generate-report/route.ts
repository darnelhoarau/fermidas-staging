import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { generateDailyReport } from '@/lib/reports/generator';
import { z } from 'zod';

export const maxDuration = 300;

const forceGenerateReportSchema = z.object({
  productId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    const body = await request.json();
    const { productId } = forceGenerateReportSchema.parse(body);

    // Check if kill switch is enabled
    const killSwitch = await db.getSetting('compliance_watch:kill_switch');
    const killSwitchEnabled = killSwitch
      ? JSON.parse(killSwitch.value_json)
      : false;

    if (killSwitchEnabled) {
      return NextResponse.json(
        { error: 'Report generation is disabled by kill switch' },
        { status: 400 },
      );
    }

    // Get all active sources for this product
    const sources = await db.findActiveSources(productId);

    if (sources.length === 0) {
      return NextResponse.json(
        {
          error:
            'No active sources found for this product. Please ensure the product exists and has active sources.',
        },
        { status: 400 },
      );
    }

    // Generate the report using the generator
    const result = await generateDailyReport(productId, 'en');

    if (result.status === 'failed') {
      return NextResponse.json(
        {
          error: 'Report generation failed',
          details: result.errors,
        },
        { status: 500 },
      );
    }

    // Log the manual report generation
    await db.createAuditLog({
      actorUserId: session.user.id,
      action: 'report.force_generated',
      metaJson: JSON.stringify({
        reportId: result.reportId,
        productId: productId,
        sourceCount: sources.length,
        totalItems: result.totalItems,
      }),
    });

    return NextResponse.json({
      success: true,
      message: `Report generated successfully with ${result.totalItems} items from ${sources.length} sources`,
      reportId: result.reportId,
      sourceCount: sources.length,
      totalItems: result.totalItems,
    });
  } catch (error) {
    console.error('Error force generating report:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 },
    );
  }
}
