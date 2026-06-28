import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  if (!(await db.isFeatureEnabled('migrate'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentUser = await db.findUserByEmail(session.user.email!);
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const operations: string[] = [];

    const columnExists = async (col: string) => {
      const result = await pool.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_name = 'course_enrollments' AND column_name = $1`,
        [col],
      );
      return result.rows.length > 0;
    };

    const columnDefs: [string, string][] = [
      ['purchase_id', 'TEXT'],
      ['access_expires_at', 'TIMESTAMPTZ'],
      ['last_accessed_at', 'TIMESTAMPTZ'],
      ['completed_at', 'TIMESTAMPTZ'],
      ['enrolled_at', 'TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP'],
    ];

    for (const [col, type] of columnDefs) {
      if (!(await columnExists(col))) {
        await pool.query(`ALTER TABLE course_enrollments ADD COLUMN ${col} ${type}`);
        operations.push(`Added column ${col}`);
      } else {
        operations.push(`Column ${col} already exists`);
      }
    }

    const backfill = await pool.query(`
      UPDATE course_enrollments ce
      SET access_expires_at = op.created_at + INTERVAL '30 days'
      FROM one_off_purchases op
      WHERE ce.purchase_id = op.id
        AND op.course_id IS NOT NULL
        AND op.status = 'PAID'
        AND ce.access_expires_at IS NULL
    `);

    operations.push(`Backfilled ${backfill.rowCount ?? 0} access expiry dates`);

    return NextResponse.json({ success: true, operations });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Migration failed' },
      { status: 500 },
    );
  }
}
