import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';

export async function GET() {
  try {
    await requireAdmin();
    const users = await db.listUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin list users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
