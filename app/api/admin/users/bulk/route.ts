import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';

export const dynamic = 'force-dynamic';

const ACTIONS = ['delete', 'ban', 'unban'] as const;

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    const body = await request.json();
    const { action, userIds } = body as { action?: string; userIds?: unknown };

    if (!ACTIONS.includes(action as (typeof ACTIONS)[number])) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    if (
      !Array.isArray(userIds) ||
      userIds.length === 0 ||
      userIds.length > 100 ||
      userIds.some((id) => typeof id !== 'string')
    ) {
      return NextResponse.json({ error: 'Invalid userIds' }, { status: 400 });
    }

    let affected = 0;
    const skipped: string[] = [];

    for (const userId of userIds as string[]) {
      if (action === 'delete') {
        if (userId === session.user.id) {
          skipped.push(userId);
          continue;
        }
        await db.deleteUserWithData(userId);
      } else {
        const banned = action === 'ban';
        if (banned && userId === session.user.id) {
          skipped.push(userId);
          continue;
        }
        await db.setUserBanStatus(userId, banned);
      }
      affected++;
    }

    await db.createAuditLog({
      actorUserId: session.user.id,
      action: `admin.users.bulk_${action}`,
      metaJson: JSON.stringify({ userIds, affected, skipped }),
    });

    return NextResponse.json({ success: true, affected, skipped });
  } catch (error) {
    console.error('Bulk user action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
