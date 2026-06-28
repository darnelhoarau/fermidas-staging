import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
  try {
    await requireAdmin();
    const result = await pool.query(`
      SELECT op.id, op.user_id, op.course_id, op.amount_minor, op.currency,
        op.status, op.mpgs_order_id, op.created_at, u.email, c.title AS course_title
      FROM one_off_purchases op
      JOIN users u ON u.id = op.user_id
      LEFT JOIN courses c ON c.id = op.course_id
      WHERE op.status = 'PAID'
        AND op.course_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM course_enrollments ce WHERE ce.purchase_id = op.id)
      ORDER BY op.created_at DESC
      LIMIT 50
    `);
    return NextResponse.json({ purchases: result.rows });
  } catch (error) {
    console.error('Error listing orphaned purchases:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
