import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';

const ALLOWED_KEYS = ['payment_success_url'];

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentUser = await db.findUserByEmail(session.user.email!);
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const settings: Record<string, string> = {};
  for (const key of ALLOWED_KEYS) {
    const row = await db.getSetting(key);
    if (row?.value_json) {
      try {
        const parsed = JSON.parse(row.value_json);
        if (typeof parsed === 'string') {
          settings[key] = parsed;
        }
      } catch {
        settings[key] = row.value_json;
      }
    }
  }

  return NextResponse.json({ settings });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentUser = await db.findUserByEmail(session.user.email!);
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { key, value } = await request.json().catch(() => ({}));
  if (!key || !ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ error: `Invalid key. Allowed: ${ALLOWED_KEYS.join(', ')}` }, { status: 400 });
  }

  await db.upsertSetting(key, JSON.stringify(value || ''));
  return NextResponse.json({ success: true });
}
