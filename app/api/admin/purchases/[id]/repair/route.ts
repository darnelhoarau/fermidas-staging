import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();

    const purchase = await pool.query(
      'SELECT * FROM one_off_purchases WHERE id = $1 AND status = $2 AND course_id IS NOT NULL',
      [id, 'PAID'],
    );

    if (purchase.rows.length === 0) {
      return NextResponse.json({ error: 'Orphaned purchase not found' }, { status: 404 });
    }

    const { user_id, course_id } = purchase.rows[0];
    const accessExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const existing = await pool.query(
      'SELECT id FROM course_enrollments WHERE user_id = $1 AND course_id = $2',
      [user_id, course_id],
    );

    let enrollment;
    if (existing.rows.length > 0) {
      const r = await pool.query(
        'UPDATE course_enrollments SET purchase_id = $1, access_expires_at = $2, last_accessed_at = NOW() WHERE id = $3 RETURNING *',
        [id, accessExpiresAt, existing.rows[0].id],
      );
      enrollment = r.rows[0];
    } else {
      const enrollId = 'enroll_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
      const r = await pool.query(
        'INSERT INTO course_enrollments (id, user_id, course_id, purchase_id, access_expires_at, last_accessed_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
        [enrollId, user_id, course_id, id, accessExpiresAt],
      );
      enrollment = r.rows[0];
    }

    await pool.query(
      "INSERT INTO audit_logs (id, actor_user_id, action, meta_json) VALUES ($1, $2, 'admin.purchase.repaired', $3)",
      ['audit_' + Date.now(), session.user.id, JSON.stringify({ purchaseId: id, enrollmentId: enrollment.id })],
    );

    return NextResponse.json({ enrollment });
  } catch (error) {
    console.error('Error repairing purchase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
