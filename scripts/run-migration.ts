/**
 * Run migrations against the database.
 *
 * Usage:
 *   npx tsx scripts/run-migration.ts
 *
 * Uses DATABASE_URL from .env.local.
 */

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

config({ path: '.env.local' });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const migrationFile = join(
    __dirname,
    '../migrations/002_add_enrollment_expiry.sql',
  );
  const sql = readFileSync(migrationFile, 'utf-8');

  console.log('Running migration: 002_add_enrollment_expiry.sql');
  console.log('Target:', process.env.DATABASE_URL?.split('@')[1]?.split('?')[0]);
  console.log('');

  try {
    await pool.query(sql);
    console.log('Migration applied successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
