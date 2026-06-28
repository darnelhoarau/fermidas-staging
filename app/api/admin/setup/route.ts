import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import pool from '@/lib/db';
import { isFeatureEnabled, setFeatureFlag } from '@/lib/db';

const ADMIN_EMAIL = 'darnelhoarau@gmail.com';

const MIGRATION_COLUMNS: [string, string][] = [
  ['purchase_id', 'TEXT'],
  ['access_expires_at', 'TIMESTAMPTZ'],
  ['last_accessed_at', 'TIMESTAMPTZ'],
  ['completed_at', 'TIMESTAMPTZ'],
  ['enrolled_at', 'TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP'],
];

const FEATURE_DEFAULTS: [string, boolean][] = [
  ['setup', true],
  ['migrate', true],
  ['confirm', true],
  ['diag', false],
];

async function ensureColumn(table: string, col: string, type: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_name = $1 AND column_name = $2`,
    [table, col],
  );
  if (result.rows.length === 0) {
    await pool.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
    return true;
  }
  return false;
}

async function runMigrations(): Promise<string[]> {
  const operations: string[] = [];

  for (const [col, type] of MIGRATION_COLUMNS) {
    if (await ensureColumn('course_enrollments', col, type)) {
      operations.push(`Added course_enrollments.${col}`);
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

  if (backfill.rowCount && backfill.rowCount > 0) {
    operations.push(`Backfilled ${backfill.rowCount} access expiry dates`);
  }

  return operations;
}

async function ensureSettingsTable(): Promise<boolean> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);
    return true;
  } catch {
    return false;
  }
}

async function seedFeatureFlags(): Promise<string[]> {
  const seeded: string[] = [];
  for (const [feature, enabled] of FEATURE_DEFAULTS) {
    const was = await isFeatureEnabled(feature);
    if (was !== enabled) {
      await setFeatureFlag(feature, enabled);
      seeded.push(`${feature}=${enabled}`);
    }
  }
  return seeded;
}

export async function GET() {
  try {
    const messages: string[] = [];

    await ensureSettingsTable();

    const migrationOps = await runMigrations();
    messages.push(...migrationOps);

    const existing = await pool.query('SELECT id, role FROM users WHERE email = $1', [ADMIN_EMAIL]);
    if (existing.rows.length === 0) {
      const hashed = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (id, email, name, password, role) VALUES ($1, $2, $3, $4, $5)',
        ['admin_setup', ADMIN_EMAIL, 'Admin', hashed, 'ADMIN'],
      );
      messages.push('Admin user created and promoted to ADMIN');
    } else if (existing.rows[0].role !== 'ADMIN') {
      await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['ADMIN', ADMIN_EMAIL]);
      messages.push('User promoted to ADMIN');
    } else {
      messages.push('User is already ADMIN');
    }

    const seeded = await seedFeatureFlags();
    if (seeded.length > 0) {
      messages.push(`Seeded feature flags: ${seeded.join(', ')}`);
    }

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}
