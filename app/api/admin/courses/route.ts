import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
  try {
    await requireAdmin();
    const result = await pool.query(
      'SELECT id, title, slug FROM courses ORDER BY title',
    );
    return NextResponse.json({ courses: result.rows });
  } catch (error) {
    console.error('Admin list courses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
