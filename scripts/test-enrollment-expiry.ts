/**
 * Direct DB test for the 30-day course access expiry feature.
 *
 * Creates temporary test records (course + enrollments), runs tests, cleans up.
 * Safe to run against any database — all test data is removed afterward.
 *
 * Usage: npx tsx scripts/test-enrollment-expiry.ts
 */

import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const TEST_PREFIX = '__expiry_test__';
let testUserId = '';
let testCourseId = '';
let testProductId = '';
let testPlanId = '';
let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

async function cleanup() {
  await pool.query('DELETE FROM course_enrollments WHERE course_id = $1', [testCourseId]);
  await pool.query('DELETE FROM course_modules WHERE course_id = $1', [testCourseId]);
  await pool.query('DELETE FROM courses WHERE id = $1', [testCourseId]);
  await pool.query('DELETE FROM plans WHERE id = $1', [testPlanId]);
  await pool.query('DELETE FROM products WHERE id = $1', [testProductId]);
}

async function setup() {
  // Find an existing user
  const userResult = await pool.query('SELECT id FROM users LIMIT 1');
  if (userResult.rows.length === 0) {
    throw new Error('No users in database. Sign up first.');
  }
  testUserId = userResult.rows[0].id;
  console.log(`Using user: ${testUserId}`);

  // Create temporary product, plan, course
  testProductId = `${TEST_PREFIX}product`;
  testPlanId = `${TEST_PREFIX}plan`;
  testCourseId = `${TEST_PREFIX}course`;

  await pool.query(
    `INSERT INTO products (id, slug, name, is_active) VALUES ($1, $2, $3, true)`,
    [testProductId, `${TEST_PREFIX}product`, 'Test Product'],
  );
  await pool.query(
    `INSERT INTO plans (id, product_id, name, price_minor, currency, interval, is_active)
     VALUES ($1, $2, $3, 90000, 'SCR', 'ONE_OFF', true)`,
    [testPlanId, testProductId, 'Test Plan'],
  );
  await pool.query(
    `INSERT INTO courses (id, product_id, plan_id, slug, title, short_description, description, level, language, is_published, instructor_name, total_lessons, total_duration_seconds)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'BEGINNER', 'en', true, 'Test', 0, 0)`,
    [testCourseId, testProductId, testPlanId, `${TEST_PREFIX}slug`, 'Test Course', 'Test', 'Test'],
  );

  console.log(`Created test course: ${testCourseId}`);
}

async function testColumnExists() {
  console.log('\n[Test 1] Column access_expires_at exists');
  const result = await pool.query(`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name = 'course_enrollments' AND column_name = 'access_expires_at'
  `);
  assert(result.rows.length === 1, 'column exists');
  assert(
    result.rows[0]?.data_type === 'timestamp with time zone',
    `type is timestamptz (got: ${result.rows[0]?.data_type})`,
  );
}

async function testNullExpiryUnlimitedAccess() {
  console.log('\n[Test 2] NULL access_expires_at → unlimited access');
  await pool.query('DELETE FROM course_enrollments WHERE course_id = $1 AND user_id = $2', [testCourseId, testUserId]);

  await pool.query(
    `INSERT INTO course_enrollments (id, user_id, course_id, access_expires_at, last_accessed_at)
     VALUES ($1, $2, $3, NULL, CURRENT_TIMESTAMP)`,
    [`${TEST_PREFIX}null`, testUserId, testCourseId],
  );

  const result = await pool.query(
    'SELECT access_expires_at FROM course_enrollments WHERE user_id = $1 AND course_id = $2',
    [testUserId, testCourseId],
  );
  const enrollment = result.rows[0];

  assert(enrollment.access_expires_at === null, 'access_expires_at is NULL');

  // Simulate canAccessCourse logic
  const hasAccess =
    !enrollment.access_expires_at ||
    new Date(enrollment.access_expires_at) > new Date();
  assert(hasAccess, 'NULL expiry → access granted');
}

async function testFutureExpiryGrantsAccess() {
  console.log('\n[Test 3] Future access_expires_at → access granted');
  await pool.query('DELETE FROM course_enrollments WHERE course_id = $1 AND user_id = $2', [testCourseId, testUserId]);

  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO course_enrollments (id, user_id, course_id, access_expires_at, last_accessed_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
    [`${TEST_PREFIX}future`, testUserId, testCourseId, futureDate],
  );

  const result = await pool.query(
    'SELECT access_expires_at FROM course_enrollments WHERE user_id = $1 AND course_id = $2',
    [testUserId, testCourseId],
  );
  const enrollment = result.rows[0];
  const expiry = new Date(enrollment.access_expires_at);

  assert(expiry > new Date(), 'expiry date is in the future');

  const hasAccess =
    !enrollment.access_expires_at ||
    new Date(enrollment.access_expires_at) > new Date();
  assert(hasAccess, 'future expiry → access granted');

  const daysRemaining = Math.ceil(
    (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  assert(
    daysRemaining >= 29 && daysRemaining <= 30,
    `days remaining ~30 (got ${daysRemaining})`,
  );
}

async function testPastExpiryDeniesAccess() {
  console.log('\n[Test 4] Past access_expires_at → access denied');
  await pool.query('DELETE FROM course_enrollments WHERE course_id = $1 AND user_id = $2', [testCourseId, testUserId]);

  const pastDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO course_enrollments (id, user_id, course_id, access_expires_at, last_accessed_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
    [`${TEST_PREFIX}past`, testUserId, testCourseId, pastDate],
  );

  const result = await pool.query(
    'SELECT access_expires_at FROM course_enrollments WHERE user_id = $1 AND course_id = $2',
    [testUserId, testCourseId],
  );
  const enrollment = result.rows[0];
  const expiry = new Date(enrollment.access_expires_at);

  assert(expiry <= new Date(), 'expiry date is in the past');

  const hasAccess =
    !enrollment.access_expires_at ||
    new Date(enrollment.access_expires_at) > new Date();
  assert(!hasAccess, 'past expiry → access denied');
}

async function testExpiryFormatting() {
  console.log('\n[Test 5] Expiry display formatting');
  await pool.query('DELETE FROM course_enrollments WHERE course_id = $1 AND user_id = $2', [testCourseId, testUserId]);

  const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO course_enrollments (id, user_id, course_id, access_expires_at, last_accessed_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
    [`${TEST_PREFIX}format`, testUserId, testCourseId, futureDate],
  );

  const result = await pool.query(
    'SELECT access_expires_at FROM course_enrollments WHERE user_id = $1 AND course_id = $2',
    [testUserId, testCourseId],
  );
  const enrollment = result.rows[0];
  const expiry = new Date(enrollment.access_expires_at);
  const now = new Date();
  const daysRemaining = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  const isExpired = expiry <= now;
  const isExpiringSoon = !isExpired && daysRemaining <= 7;

  assert(!isExpired, 'not expired');
  assert(isExpiringSoon, `expiring soon (≤7 days): got ${daysRemaining} days`);

  const formatted = expiry.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  assert(
    typeof formatted === 'string' && formatted.length > 0,
    `formatted date: "${formatted}"`,
  );
}

async function testUpsertPreservesExpiry() {
  console.log('\n[Test 6] UPSERT preserves existing expiry on re-enrollment');
  await pool.query('DELETE FROM course_enrollments WHERE course_id = $1 AND user_id = $2', [testCourseId, testUserId]);

  const expiryDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO course_enrollments (id, user_id, course_id, access_expires_at, last_accessed_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
    [`${TEST_PREFIX}upsert`, testUserId, testCourseId, expiryDate],
  );

  // Upsert WITHOUT expiry (simulates auto-enrollment from learn page)
  await pool.query(
    `INSERT INTO course_enrollments (id, user_id, course_id, access_expires_at, last_accessed_at)
     VALUES ($1, $2, $3, NULL, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id, course_id) DO UPDATE SET
       access_expires_at = COALESCE(EXCLUDED.access_expires_at, course_enrollments.access_expires_at),
       last_accessed_at = CURRENT_TIMESTAMP`,
    [`${TEST_PREFIX}upsert2`, testUserId, testCourseId],
  );

  const result = await pool.query(
    'SELECT access_expires_at FROM course_enrollments WHERE user_id = $1 AND course_id = $2',
    [testUserId, testCourseId],
  );
  const enrollment = result.rows[0];
  const stored = new Date(enrollment.access_expires_at);
  const expected = new Date(expiryDate);

  assert(
    Math.abs(stored.getTime() - expected.getTime()) < 1000,
    'UPSERT preserved original expiry date',
  );
}

async function main() {
  console.log('=== Enrollment Expiry DB Tests ===\n');

  try {
    await setup();
    await testColumnExists();
    await testNullExpiryUnlimitedAccess();
    await testFutureExpiryGrantsAccess();
    await testPastExpiryDeniesAccess();
    await testExpiryFormatting();
    await testUpsertPreservesExpiry();
  } catch (err) {
    console.error('\nFatal error:', err);
    failed++;
  } finally {
    await cleanup();
    await pool.end();
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
