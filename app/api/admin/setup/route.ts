import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';

const ADMIN_EMAIL = 'darnelhoarau@gmail.com';

export async function GET() {
  try {
    const existing = await pool.query('SELECT id, role FROM users WHERE email = $1', [ADMIN_EMAIL]);
    if (existing.rows.length === 0) {
      const hashed = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (id, email, name, password, role) VALUES ($1, $2, $3, $4, $5)',
        ['admin_setup', ADMIN_EMAIL, 'Admin', hashed, 'ADMIN'],
      );
      return NextResponse.json({ message: 'Admin user created and promoted to ADMIN' });
    }

    if (existing.rows[0].role !== 'ADMIN') {
      await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['ADMIN', ADMIN_EMAIL]);
      return NextResponse.json({ message: 'User promoted to ADMIN' });
    }

    return NextResponse.json({ message: 'User is already ADMIN' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}
