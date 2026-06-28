import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';

const ALL_FEATURES = [
  { key: 'setup', label: 'Setup', defaultOn: true, description: 'POST /api/admin/setup — idempotent admin promotion + schema migration' },
  { key: 'migrate', label: 'Migrate', defaultOn: true, description: 'POST /api/admin/migrate — add missing columns to course_enrollments' },
  { key: 'confirm', label: 'Confirm', defaultOn: true, description: 'GET /api/payments/mpgs/confirm — MPGS success redirect; creates purchase+enrollment' },
  { key: 'diag', label: 'Diagnostic', defaultOn: false, description: 'GET /api/payments/mpgs/webhook/diag — unauthenticated; exposes order IDs and purchase data' },
];

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentUser = await db.findUserByEmail(session.user.email!);
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const existing = await db.listFeatureFlags();
  const existingMap = new Map(existing.map(f => [f.key, f.enabled]));

  const features = ALL_FEATURES.map(f => ({
    ...f,
    enabled: existingMap.has(f.key) ? existingMap.get(f.key)! : f.defaultOn,
  }));

  return NextResponse.json({ features });
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

  const { feature, enabled } = await request.json().catch(() => ({}));
  if (!feature || typeof enabled !== 'boolean') {
    return NextResponse.json({ error: 'feature (string) and enabled (boolean) required' }, { status: 400 });
  }

  if (!ALL_FEATURES.some(f => f.key === feature)) {
    return NextResponse.json({ error: `Unknown feature: ${feature}` }, { status: 400 });
  }

  await db.setFeatureFlag(feature, enabled);
  return NextResponse.json({ success: true, feature, enabled });
}
