import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const clauses: string[] = [];
    const params: unknown[] = [];

    if (filter === 'active') {
      clauses.push('(ce.access_expires_at IS NULL OR ce.access_expires_at > NOW())');
    } else if (filter === 'expired') {
      clauses.push('(ce.access_expires_at IS NOT NULL AND ce.access_expires_at <= NOW())');
    } else if (filter === 'unlimited') {
      clauses.push('(ce.access_expires_at IS NULL)');
    }

    const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
    const result = await pool.query(`
      SELECT ce.*, u.email, u.name AS user_name, c.title AS course_title
      FROM course_enrollments ce
      JOIN users u ON u.id = ce.user_id
      JOIN courses c ON c.id = ce.course_id
      ${where}
      ORDER BY ce.enrolled_at DESC
      LIMIT 200
    `, params);

    return NextResponse.json({ enrollments: result.rows });
  } catch (error) {
    console.error('Admin list enrollments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { userId, courseId, accessExpiresAt } = body;

    if (!userId || !courseId) {
      return NextResponse.json({ error: 'userId and courseId are required' }, { status: 400 });
    }

    const existing = await pool.query(
      'SELECT id FROM course_enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId],
    );

    let enrollment;
    if (existing.rows.length > 0) {
      const r = await pool.query(
        'UPDATE course_enrollments SET access_expires_at = $1, last_accessed_at = NOW() WHERE id = $2 RETURNING *',
        [accessExpiresAt || null, existing.rows[0].id],
      );
      enrollment = r.rows[0];
    } else {
      const id = 'enroll_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
      const r = await pool.query(
        'INSERT INTO course_enrollments (id, user_id, course_id, access_expires_at, last_accessed_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
        [id, userId, courseId, accessExpiresAt || null],
      );
      enrollment = r.rows[0];
    }

    await pool.query(
      'INSERT INTO audit_logs (id, actor_user_id, action, meta_json) VALUES ($1, $2, $3, $4)',
      ['audit_' + Date.now(), session.user.id, 'admin.enrollment.created', JSON.stringify({ userId, courseId, enrollmentId: enrollment.id })],
    );

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    console.error('Admin create enrollment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
