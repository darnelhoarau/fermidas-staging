import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import pool from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await requireAdmin();
    const body = await request.json();
    const expiresAt = body.access_expires_at ? new Date(body.access_expires_at) : null;

    const result = await pool.query(
      'UPDATE course_enrollments SET access_expires_at = $1, last_accessed_at = NOW() WHERE id = $2 RETURNING *',
      [expiresAt, id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    return NextResponse.json({ enrollment: result.rows[0] });
  } catch (error) {
    console.error('Admin update enrollment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    const enrollResult = await pool.query(
      'SELECT user_id, course_id, purchase_id FROM course_enrollments WHERE id = $1',
      [id],
    );
    const enrollment = enrollResult.rows[0];
    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    if (hard) {
      await pool.query(
        'DELETE FROM lesson_progress WHERE user_id = $1 AND course_id = $2',
        [enrollment.user_id, enrollment.course_id],
      );
    }

    await pool.query('DELETE FROM course_enrollments WHERE id = $1', [id]);

    if (enrollment.purchase_id) {
      await pool.query('DELETE FROM one_off_purchases WHERE id = $1', [enrollment.purchase_id]);
    }

    await pool.query(
      'INSERT INTO audit_logs (id, actor_user_id, action, meta_json) VALUES ($1, $2, $3, $4)',
      ['audit_' + Date.now(), session.user.id, hard ? 'admin.enrollment.hard_deleted' : 'admin.enrollment.removed', JSON.stringify({ enrollmentId: id, userId: enrollment.user_id, courseId: enrollment.course_id, hard })],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete enrollment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
