import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { z } from 'zod';

const settingsSchema = z.object({
  killSwitch: z.boolean(),
  frequency: z.enum(['daily', 'weekly']),
  reportTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  allowedLanguages: z.array(z.string()).min(1),
  defaultLanguage: z.string(),
});

export async function GET() {
  try {
    await requireAdmin();

    const [
      killSwitch,
      frequency,
      reportTime,
      allowedLanguages,
      defaultLanguage,
    ] = await Promise.all([
      db.getSetting('compliance_watch:kill_switch'),
      db.getSetting('compliance_watch:frequency'),
      db.getSetting('compliance_watch:report_time'),
      db.getSetting('compliance_watch:allowed_languages'),
      db.getSetting('compliance_watch:default_language'),
    ]);

    return NextResponse.json({
      killSwitch: killSwitch ? JSON.parse(killSwitch.value_json) : false,
      frequency: frequency ? JSON.parse(frequency.value_json) : 'daily',
      reportTime: reportTime ? JSON.parse(reportTime.value_json) : '06:00',
      allowedLanguages: allowedLanguages
        ? JSON.parse(allowedLanguages.value_json)
        : ['en'],
      defaultLanguage: defaultLanguage
        ? JSON.parse(defaultLanguage.value_json)
        : 'en',
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    const body = await request.json();
    const {
      killSwitch,
      frequency,
      reportTime,
      allowedLanguages,
      defaultLanguage,
    } = settingsSchema.parse(body);

    // Update settings
    await Promise.all([
      db.upsertSetting(
        'compliance_watch:kill_switch',
        JSON.stringify(killSwitch)
      ),
      db.upsertSetting('compliance_watch:frequency', JSON.stringify(frequency)),
      db.upsertSetting(
        'compliance_watch:report_time',
        JSON.stringify(reportTime)
      ),
      db.upsertSetting(
        'compliance_watch:allowed_languages',
        JSON.stringify(allowedLanguages)
      ),
      db.upsertSetting(
        'compliance_watch:default_language',
        JSON.stringify(defaultLanguage)
      ),
    ]);

    // Log the change
    await db.createAuditLog({
      actorUserId: session.user.id,
      action: 'settings.updated',
      metaJson: JSON.stringify({
        killSwitch,
        frequency,
        reportTime,
        allowedLanguages,
        defaultLanguage,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
