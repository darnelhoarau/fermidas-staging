import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: '.env.local' });
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

const courseId = 'course-cybersecurity-awareness-series-1-2026';
const planId = 'plan-course-cybersecurity-awareness-series-1-2026';
const moduleId = 'module-cybersecurity-awareness-series-1-2026';
const lessonId = 'lesson-cybersecurity-awareness-series-1-2026';
const coursePosterUrl =
  'vercel-blob://training/courses/course-cybersecurity-awareness-series-1-2026/covers/cybersecurity-awareness-series-1-2026-poster.jpg';
const courseVideoUrl =
  'vercel-blob://training/courses/course-cybersecurity-awareness-series-1-2026/videos/cybersecurity-awareness-series-1-2026.mp4';

const whatYouLearn = [
  'Identify sophisticated social engineering and phishing mechanics: detect hidden digital threats such as weaponised business files or macro-enabled documents, and master the HTTPS hover technique to verify true web destinations before clicking.',
  'Neutralise AI driven threats, BEC 2.0 and deepfakes: recognise how autonomous AI agents bypass traditional red flags through hyper-personalised pretexting, and master real-time verification tests to expose synthetic voice or video clones.',
  'Enforce physical, oral and workplace security: implement robust habits including clean desk and clear screen compliance, secure print management, need-to-know conversation boundaries, and tailgating prevention at physical perimeters.',
  "Secure remote environments and incident reporting: mitigate work-from-home and public network vulnerabilities using encrypted VPN tunnels, while learning to classify, flag and escalate security anomalies through your organisation's incident reporting channels.",
];

const targetAudience = [
  'Leadership and C-Suite: master strategic oversight of emerging, high-stakes AI threats, corporate deepfakes, and executive impersonation scams.',
  'Compliance and Risk Teams: align internal governance, manage data classification protocols, and ensure auditable regulatory and device retention trails.',
  'Front line and Finance Staff: build practical defence habits to catch sophisticated phishing, billing fraud, and tailgating traps.',
  'Remote and Hybrid Workforce: secure unmanaged networks, prevent visual eavesdropping, and safeguard data outside the traditional office perimeter.',
];

async function main() {
  const client = await pool.connect();

  try {
    const schemaPath = join(
      process.cwd(),
      'migrations/003_training_schema.sql',
    );
    const schemaSql = readFileSync(schemaPath, 'utf8');

    await client.query('BEGIN');
    await client.query(schemaSql);

    const productResult = await client.query(
      "SELECT id FROM products WHERE slug = 'training' LIMIT 1",
    );
    const productId = productResult.rows[0]?.id as string | undefined;

    if (!productId) {
      throw new Error('Training product was not created by the migration');
    }

    await client.query(
      `
        INSERT INTO plans (
          id, product_id, name, price_minor, currency, interval,
          course_id, is_active, created_at, updated_at
        )
        VALUES ($1, $2, $3, 90000, 'SCR', 'ONE_OFF', NULL, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          product_id = EXCLUDED.product_id,
          name = EXCLUDED.name,
          price_minor = EXCLUDED.price_minor,
          currency = EXCLUDED.currency,
          interval = EXCLUDED.interval,
          course_id = NULL,
          is_active = TRUE,
          updated_at = CURRENT_TIMESTAMP
      `,
      [planId, productId, 'Cybersecurity Awareness Training - Series 1 2026'],
    );

    await client.query(
      `
        INSERT INTO courses (
          id, product_id, plan_id, slug, title, short_description, description,
          what_you_learn, requirements, thumbnail_url, trailer_url,
          instructor_name, instructor_bio, instructor_avatar_url, level,
          language, total_duration_seconds, total_lessons, is_published,
          is_featured, sort, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10, NULL,
          $11, $12, NULL, 'beginner', 'en', 2880, 1, TRUE, TRUE, 1,
          '2026-05-19T00:00:00Z', '2026-05-19T00:00:00Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          product_id = EXCLUDED.product_id,
          plan_id = EXCLUDED.plan_id,
          slug = EXCLUDED.slug,
          title = EXCLUDED.title,
          short_description = EXCLUDED.short_description,
          description = EXCLUDED.description,
          what_you_learn = EXCLUDED.what_you_learn,
          requirements = EXCLUDED.requirements,
          thumbnail_url = EXCLUDED.thumbnail_url,
          trailer_url = EXCLUDED.trailer_url,
          instructor_name = EXCLUDED.instructor_name,
          instructor_bio = EXCLUDED.instructor_bio,
          level = EXCLUDED.level,
          language = EXCLUDED.language,
          is_published = TRUE,
          is_featured = TRUE,
          sort = EXCLUDED.sort,
          updated_at = EXCLUDED.updated_at
      `,
      [
        courseId,
        productId,
        planId,
        'fermidas-cybersecurity-awareness-training-series-1-2026',
        'Fermidas Cybersecurity Awareness Training, (Series 1 2026)',
        'Cybersecurity general awareness training on social engineering, agentic AI threats, phishing, remote work and physical security.',
        [
          'Most corporate awareness training relies on static scripts. Fermidas focuses on real-time adaptive reasoning, training your team to pause, verify and decisively act.',
          'The course deconstructs social engineering and psychological manipulation, showing how attackers exploit helpfulness, authority, urgency and manufactured trust.',
          'Learners spot agentic AI trends and red flags, from recognisable macro-enabled Trojan horse business files to subtle visual and audio latency clues in live deepfake calls.',
          'The programme finishes with practical countermeasures: the never-tap rule for mobile links, profile-view verification for video calls, clean desk and clear screen discipline, secure print management, and physical entry awareness.',
        ].join('\n\n'),
        JSON.stringify(whatYouLearn),
        JSON.stringify(targetAudience),
        coursePosterUrl,
        'Fermidas Training Team',
        'Fermidas training courses are designed by compliance, governance and security practitioners for regulated organisations and teams that need practical, auditable awareness training.',
      ],
    );

    await client.query(
      `
        INSERT INTO course_modules (id, course_id, title, description, sort, created_at, updated_at)
        VALUES ($1, $2, 'Social Engineering and Physical Security', 'Cybersecurity awareness foundations for practical workplace defence.', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          course_id = EXCLUDED.course_id,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          sort = EXCLUDED.sort,
          updated_at = CURRENT_TIMESTAMP
      `,
      [moduleId, courseId],
    );

    await client.query(
      `
        INSERT INTO course_lessons (
          id, module_id, course_id, title, description, video_url,
          video_duration_seconds, resource_urls, is_preview, sort,
          created_at, updated_at
        )
        VALUES (
          $1, $2, $3, 'Cybersecurity General Awareness: Social Engineering and Physical Security',
          'A 48-minute presentation covering phishing mechanics, AI-enabled deception, physical security and practical reporting habits.',
          $4,
          2880,
          '[]'::jsonb,
          FALSE,
          1,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO UPDATE SET
          module_id = EXCLUDED.module_id,
          course_id = EXCLUDED.course_id,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          video_url = EXCLUDED.video_url,
          video_duration_seconds = EXCLUDED.video_duration_seconds,
          resource_urls = EXCLUDED.resource_urls,
          is_preview = EXCLUDED.is_preview,
          sort = EXCLUDED.sort,
          updated_at = CURRENT_TIMESTAMP
      `,
      [lessonId, moduleId, courseId, courseVideoUrl],
    );

    await client.query(
      `
        UPDATE plans
        SET
          course_id = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [planId, courseId],
    );

    await client.query('COMMIT');
    console.log('Seeded Fermidas Cybersecurity Awareness Training course.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
