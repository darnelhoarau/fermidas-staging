// Database utility for NeonDB integration
// Expanded for Digital Products (Compliance Watch)

import { Pool, type PoolClient } from 'pg';
import { randomBytes } from 'crypto';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  throw new Error('DATABASE_URL environment variable is required');
}

// Create a connection pool
const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

type QueryClient = Pool | PoolClient;

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface CourseResourceUrl {
  label: string;
  url: string;
}

// Test the connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Generate unique ID (similar to Prisma cuid)
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${randomBytes(8).toString('hex')}`;
}

// ============================================
// CONTACT FORM (existing)
// ============================================

export async function createContact(data: {
  name: string;
  email: string;
  organisation?: string;
  country: string;
  message: string;
}) {
  const query = `
    INSERT INTO contacts (name, email, organization, country, message)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [
    data.name,
    data.email,
    data.organisation || null,
    data.country,
    data.message,
  ];

  try {
    const insertResult = await pool.query(query, values);
    return insertResult.rows[0];
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
}

export async function getContacts(limit = 100) {
  const query = `
    SELECT * FROM contacts 
    ORDER BY created_at DESC 
    LIMIT $1
  `;

  try {
    const queryResult = await pool.query(query, [limit]);
    return queryResult.rows;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
}

export async function getContactById(id: string) {
  const query = 'SELECT * FROM contacts WHERE id = $1';

  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching contact:', error);
    throw error;
  }
}

// ============================================
// USERS
// ============================================

export async function createUser(data: {
  email: string;
  name?: string;
  password?: string;
  role?: 'ADMIN' | 'MEMBER';
}) {
  const id = generateId('user');
  const query = `
    INSERT INTO users (id, email, name, password, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [
      id,
      data.email.toLowerCase(),
      data.name || null,
      data.password || null,
      data.role || 'MEMBER',
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function findUserByEmail(email: string) {
  const query = 'SELECT * FROM users WHERE email = $1';
  try {
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
}

export async function findUserById(id: string) {
  const query = 'SELECT * FROM users WHERE id = $1';
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding user by id:', error);
    throw error;
  }
}

// ============================================
// PRODUCTS & PLANS
// ============================================

export async function findProductBySlug(slug: string) {
  const query = 'SELECT * FROM products WHERE slug = $1';
  try {
    const result = await pool.query(query, [slug]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding product:', error);
    throw error;
  }
}

export async function findProductWithPlans(slug: string) {
  const query = `
    SELECT 
      p.*,
      json_agg(
        json_build_object(
          'id', pl.id,
          'name', pl.name,
          'price_minor', pl.price_minor,
          'currency', pl.currency,
          'interval', pl.interval,
          'course_id', pl.course_id,
          'is_active', pl.is_active
        ) ORDER BY pl.price_minor DESC
      ) FILTER (WHERE pl.id IS NOT NULL AND pl.is_active = TRUE) as plans
    FROM products p
    LEFT JOIN plans pl ON pl.product_id = p.id AND pl.is_active = TRUE
    WHERE p.slug = $1
    GROUP BY p.id
  `;
  try {
    const result = await pool.query(query, [slug]);
    const row = result.rows[0];
    if (row) {
      row.plans = row.plans || [];
    }
    return row;
  } catch (error) {
    console.error('Error finding product with plans:', error);
    throw error;
  }
}

export async function findAllActiveProducts() {
  const query =
    'SELECT * FROM products WHERE is_active = TRUE ORDER BY name ASC';
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error finding products:', error);
    throw error;
  }
}

export async function findPlanById(id: string) {
  const query = `
    SELECT pl.*, p.id as product_id, p.name as product_name
    FROM plans pl
    JOIN products p ON p.id = pl.product_id
    WHERE pl.id = $1
  `;
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding plan:', error);
    throw error;
  }
}

export async function findPlansForProduct(productId: string) {
  const query = `
    SELECT pl.*, p.id as product_id, p.name as product_name
    FROM plans pl
    JOIN products p ON p.id = pl.product_id
    WHERE pl.product_id = $1 AND pl.is_active = TRUE
    ORDER BY pl.price_minor ASC
  `;
  try {
    const result = await pool.query(query, [productId]);
    return result.rows;
  } catch (error) {
    console.error('Error finding plans for product:', error);
    throw error;
  }
}

// ============================================
// SUBSCRIPTIONS
// ============================================

export async function createSubscription(data: {
  userId: string;
  productId: string;
  planId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  mpgsCustomerRef?: string;
  mpgsTokenRef?: string;
  termsAcceptedAt?: Date;
  termsVersion?: string;
  termsIpAddress?: string;
}) {
  const id = generateId('sub');
  const query = `
    INSERT INTO subscriptions (
      id, user_id, product_id, plan_id, status,
      current_period_start, current_period_end,
      mpgs_customer_ref, mpgs_token_ref,
      terms_accepted_at, terms_version, terms_ip_address
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [
      id,
      data.userId,
      data.productId,
      data.planId,
      'ACTIVE',
      data.currentPeriodStart,
      data.currentPeriodEnd,
      data.mpgsCustomerRef || null,
      data.mpgsTokenRef || null,
      data.termsAcceptedAt || null,
      data.termsVersion || null,
      data.termsIpAddress || null,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function findActiveSubscription(
  userId: string,
  productId: string,
) {
  const query = `
    SELECT * FROM subscriptions
    WHERE user_id = $1 AND product_id = $2 AND status = 'ACTIVE'
    AND current_period_end >= CURRENT_DATE
    ORDER BY created_at DESC
    LIMIT 1
  `;
  try {
    const result = await pool.query(query, [userId, productId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding subscription:', error);
    throw error;
  }
}

export async function findUserSubscriptions(userId: string) {
  const query = `
    SELECT 
      s.*,
      p.name as product_name,
      pl.name as plan_name,
      pl.price_minor,
      pl.currency
    FROM subscriptions s
    JOIN products p ON p.id = s.product_id
    JOIN plans pl ON pl.id = s.plan_id
    WHERE s.user_id = $1
    ORDER BY s.created_at DESC
  `;
  try {
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error finding user subscriptions:', error);
    throw error;
  }
}

export async function updateSubscription(
  id: string,
  data: {
    status?: 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    canceledAt?: Date;
  },
) {
  const updates: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = [];
  let paramIndex = 1;

  if (data.status) {
    updates.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }
  if (data.currentPeriodStart) {
    updates.push(`current_period_start = $${paramIndex++}`);
    values.push(data.currentPeriodStart);
  }
  if (data.currentPeriodEnd) {
    updates.push(`current_period_end = $${paramIndex++}`);
    values.push(data.currentPeriodEnd);
  }
  if (data.canceledAt !== undefined) {
    updates.push(`canceled_at = $${paramIndex++}`);
    values.push(data.canceledAt);
  }

  values.push(id);

  const query = `
    UPDATE subscriptions
    SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

export async function findSubscriptionsDueForRenewal() {
  const query = `
    SELECT 
      s.*,
      u.email,
      u.name as user_name,
      p.name as product_name,
      pl.price_minor,
      pl.currency
    FROM subscriptions s
    JOIN users u ON u.id = s.user_id
    JOIN products p ON p.id = s.product_id
    JOIN plans pl ON pl.id = s.plan_id
    WHERE s.status = 'ACTIVE'
    AND s.current_period_end <= CURRENT_DATE
    AND s.mpgs_token_ref IS NOT NULL
  `;
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error finding subscriptions due for renewal:', error);
    throw error;
  }
}

export async function countActiveSubscribers(productId: string) {
  const query = `
    SELECT COUNT(*) as count
    FROM subscriptions
    WHERE product_id = $1 AND status = 'ACTIVE'
  `;
  try {
    const result = await pool.query(query, [productId]);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error counting subscribers:', error);
    throw error;
  }
}

// ============================================
// ONE-OFF PURCHASES
// ============================================

export async function createOneOffPurchase(data: {
  userId: string;
  productId: string;
  planId: string;
  reportDate?: Date | null;
  courseId?: string | null;
  amountMinor: number;
  currency: string;
  status: 'PAID' | 'FAILED';
  mpgsOrderId?: string;
  mpgsTxnId?: string;
}) {
  const id = generateId('purchase');
  const query = `
    INSERT INTO one_off_purchases (
      id, user_id, product_id, plan_id, report_date, course_id,
      amount_minor, currency, status, mpgs_order_id, mpgs_txn_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [
      id,
      data.userId,
      data.productId,
      data.planId,
      data.reportDate || null,
      data.courseId || null,
      data.amountMinor,
      data.currency,
      data.status,
      data.mpgsOrderId || null,
      data.mpgsTxnId || null,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating one-off purchase:', error);
    throw error;
  }
}

export async function findOneOffPurchaseByOrderId(mpgsOrderId: string) {
  const query = 'SELECT * FROM one_off_purchases WHERE mpgs_order_id = $1';
  try {
    const result = await pool.query(query, [mpgsOrderId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding one-off purchase:', error);
    throw error;
  }
}

export async function updateOneOffPurchaseStatusByOrderId(
  mpgsOrderId: string,
  status: 'PAID' | 'FAILED',
) {
  const query = `
    UPDATE one_off_purchases SET status = $1
    WHERE mpgs_order_id = $2
    RETURNING *
  `;
  try {
    const result = await pool.query(query, [status, mpgsOrderId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating one-off purchase status:', error);
    throw error;
  }
}

export async function findOneOffPurchase(
  userId: string,
  productId: string,
  reportDate: Date,
) {
  const query = `
    SELECT * FROM one_off_purchases
    WHERE user_id = $1 AND product_id = $2 AND report_date = $3 AND status = 'PAID'
    LIMIT 1
  `;
  try {
    const result = await pool.query(query, [userId, productId, reportDate]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding one-off purchase:', error);
    throw error;
  }
}

export async function findUserPurchases(userId: string) {
  const query = `
    SELECT 
      o.*,
      p.name as product_name,
      pl.name as plan_name,
      c.slug as course_slug,
      c.title as course_title,
      c.thumbnail_url as course_thumbnail_url
    FROM one_off_purchases o
    JOIN products p ON p.id = o.product_id
    JOIN plans pl ON pl.id = o.plan_id
    LEFT JOIN courses c ON c.id = o.course_id
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC
  `;
  try {
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error finding user purchases:', error);
    throw error;
  }
}

// ============================================
// CATEGORIES & SOURCES
// ============================================

export async function findCategoriesByProduct(productId: string) {
  const query = `
    SELECT 
      c.*,
      COUNT(s.id) as source_count
    FROM categories c
    LEFT JOIN sources s ON s.category_id = c.id AND s.is_active = TRUE
    WHERE c.product_id = $1 AND c.is_active = TRUE
    GROUP BY c.id
    ORDER BY c.sort ASC
  `;
  try {
    const result = await pool.query(query, [productId]);
    return result.rows.map((row) => ({
      ...row,
      _count: { sources: parseInt(row.source_count) || 0 },
    }));
  } catch (error) {
    console.error('Error finding categories:', error);
    throw error;
  }
}

export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    sort: number;
    isActive: boolean;
  }>,
) {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.sort !== undefined) {
    fields.push(`sort = $${paramCount++}`);
    values.push(data.sort);
  }
  if (data.isActive !== undefined) {
    fields.push(`is_active = $${paramCount++}`);
    values.push(data.isActive);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE categories
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function deleteCategory(id: string) {
  const query = 'DELETE FROM categories WHERE id = $1';
  try {
    await pool.query(query, [id]);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

export async function createCategory(data: {
  id: string;
  productId: string;
  name: string;
  isActive: boolean;
  sort: number;
}) {
  const query = `
    INSERT INTO categories (id, product_id, name, is_active, sort, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *
  `;
  try {
    const result = await pool.query(query, [
      data.id,
      data.productId,
      data.name,
      data.isActive,
      data.sort,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

export async function findCategoriesWithSources(productId: string) {
  const query = `
    SELECT 
      c.*,
      json_agg(
        json_build_object(
          'id', s.id,
          'name', s.name,
          'url', COALESCE(s.urls->0->>'url', s.url), -- Support both old and new format
          'type', COALESCE(s.urls->0->>'type', s.type), -- Support both old and new format
          'urls', s.urls, -- New format
          'is_active', s.is_active,
          'last_checked_at', s.last_checked_at
        ) ORDER BY s.name
      ) FILTER (WHERE s.id IS NOT NULL) as sources
    FROM categories c
    LEFT JOIN sources s ON s.category_id = c.id
    WHERE c.product_id = $1 AND c.is_active = TRUE
    GROUP BY c.id
    ORDER BY c.sort ASC
  `;
  try {
    const result = await pool.query(query, [productId]);
    return result.rows.map((row) => ({
      ...row,
      sources: row.sources || [],
    }));
  } catch (error) {
    console.error('Error finding categories with sources:', error);
    throw error;
  }
}

export async function findActiveSources(productId: string) {
  const query = `
    SELECT s.* FROM sources s
    JOIN categories c ON c.id = s.category_id
    WHERE c.product_id = $1 AND c.is_active = TRUE AND s.is_active = TRUE
  `;
  try {
    const result = await pool.query(query, [productId]);
    return result.rows;
  } catch (error) {
    console.error('Error finding active sources:', error);
    throw error;
  }
}

export async function findSourceById(id: string) {
  const query = 'SELECT * FROM sources WHERE id = $1';
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding source:', error);
    throw error;
  }
}

interface SourceUrlConfig {
  url: string;
  type: 'RSS' | 'HTML' | 'JSON';
  css_list_selector?: string | null;
  css_item_selector?: string | null;
  css_content_selector?: string | null;
  xpath_item?: string | null;
  xpath_content?: string | null;
}

export async function createSource(data: {
  id: string;
  productId: string;
  categoryId: string;
  name: string;
  urls?: Array<SourceUrlConfig>;
  url?: string; // Legacy
  type?: string; // Legacy
  isActive: boolean;
  selector?: string | null; // Legacy
  sort: number;
}) {
  // Convert to new format if using legacy format
  let urlsArray: Array<SourceUrlConfig>;
  if (data.urls && data.urls.length > 0) {
    urlsArray = data.urls;
  } else if (data.url && data.type) {
    // Legacy format: convert to array
    urlsArray = [
      {
        url: data.url,
        type:
          data.type === 'RSS' || data.type === 'HTML' || data.type === 'JSON'
            ? data.type
            : ('HTML' as 'RSS' | 'HTML' | 'JSON'),
        css_list_selector: null,
        css_item_selector: data.selector || null,
        css_content_selector: null,
        xpath_item: null,
        xpath_content: null,
      },
    ];
  } else {
    throw new Error('Either urls array or url/type must be provided');
  }

  // Extract first URL for legacy columns (backward compatibility)
  const firstUrl = urlsArray[0];
  const legacyUrl = firstUrl.url;
  const legacyType = firstUrl.type;
  const legacyCssListSelector = firstUrl.css_list_selector || null;
  const legacyCssItemSelector = firstUrl.css_item_selector || null;
  const legacyCssContentSelector = firstUrl.css_content_selector || null;
  const legacyXpathItem = firstUrl.xpath_item || null;
  const legacyXpathContent = firstUrl.xpath_content || null;

  const query = `
    INSERT INTO sources (
      id, category_id, name, 
      url, type, 
      css_list_selector, css_item_selector, css_content_selector,
      xpath_item, xpath_content,
      urls, is_active, sort, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *
  `;
  try {
    const result = await pool.query(query, [
      data.id,
      data.categoryId,
      data.name,
      legacyUrl,
      legacyType,
      legacyCssListSelector,
      legacyCssItemSelector,
      legacyCssContentSelector,
      legacyXpathItem,
      legacyXpathContent,
      JSON.stringify(urlsArray),
      data.isActive,
      data.sort,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating source:', error);
    throw error;
  }
}

export async function updateSource(
  id: string,
  data: Partial<{
    categoryId: string;
    name: string;
    urls?: Array<{
      url: string;
      type: 'RSS' | 'HTML' | 'JSON';
      css_list_selector?: string | null;
      css_item_selector?: string | null;
      css_content_selector?: string | null;
      xpath_item?: string | null;
      xpath_content?: string | null;
    }>;
    url?: string; // Legacy
    type?: string; // Legacy
    isActive: boolean;
    selector?: string | null; // Legacy
    sort: number;
  }>,
) {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (data.categoryId !== undefined) {
    fields.push(`category_id = $${paramCount++}`);
    values.push(data.categoryId);
  }
  if (data.name !== undefined) {
    fields.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.urls !== undefined) {
    // Update urls JSONB column
    fields.push(`urls = $${paramCount++}::jsonb`);
    values.push(JSON.stringify(data.urls));

    // Also update legacy columns from first URL (backward compatibility)
    if (data.urls.length > 0) {
      const firstUrl = data.urls[0];
      fields.push(`url = $${paramCount++}`);
      values.push(firstUrl.url);
      fields.push(`type = $${paramCount++}`);
      values.push(firstUrl.type);
      fields.push(`css_list_selector = $${paramCount++}`);
      values.push(firstUrl.css_list_selector || null);
      fields.push(`css_item_selector = $${paramCount++}`);
      values.push(firstUrl.css_item_selector || null);
      fields.push(`css_content_selector = $${paramCount++}`);
      values.push(firstUrl.css_content_selector || null);
      fields.push(`xpath_item = $${paramCount++}`);
      values.push(firstUrl.xpath_item || null);
      fields.push(`xpath_content = $${paramCount++}`);
      values.push(firstUrl.xpath_content || null);
    }
  } else if (data.url !== undefined && data.type !== undefined) {
    // Legacy format: convert single URL to array format
    const legacyUrl = {
      url: data.url,
      type: data.type,
      css_list_selector: null,
      css_item_selector: data.selector || null,
      css_content_selector: null,
      xpath_item: null,
      xpath_content: null,
    };
    fields.push(`urls = $${paramCount++}::jsonb`);
    values.push(JSON.stringify([legacyUrl]));
    // Also update legacy columns
    fields.push(`url = $${paramCount++}`);
    values.push(data.url);
    fields.push(`type = $${paramCount++}`);
    values.push(data.type);
    fields.push(`css_item_selector = $${paramCount++}`);
    values.push(data.selector || null);
  }
  if (data.isActive !== undefined) {
    fields.push(`is_active = $${paramCount++}`);
    values.push(data.isActive);
  }
  if (data.selector !== undefined && data.urls === undefined) {
    // Only update legacy selector if not using new urls format
    // This is handled above in the legacy URL conversion
  }
  if (data.sort !== undefined) {
    fields.push(`sort = $${paramCount++}`);
    values.push(data.sort);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE sources
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating source:', error);
    throw error;
  }
}

export async function deleteSource(id: string) {
  const query = 'DELETE FROM sources WHERE id = $1';
  try {
    await pool.query(query, [id]);
  } catch (error) {
    console.error('Error deleting source:', error);
    throw error;
  }
}

export async function updateSourceLastChecked(id: string, lastHash?: string) {
  const query = `
    UPDATE sources
    SET last_checked_at = CURRENT_TIMESTAMP, last_hash = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  try {
    const result = await pool.query(query, [id, lastHash || null]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating source:', error);
    throw error;
  }
}

export async function countSources(productId: string) {
  const query = `
    SELECT COUNT(*) as count
    FROM sources s
    JOIN categories c ON c.id = s.category_id
    WHERE c.product_id = $1
  `;
  try {
    const result = await pool.query(query, [productId]);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error counting sources:', error);
    throw error;
  }
}

export async function countActiveSources(productId: string) {
  const query = `
    SELECT COUNT(*) as count
    FROM sources s
    JOIN categories c ON c.id = s.category_id
    WHERE c.product_id = $1 AND s.is_active = TRUE
  `;
  try {
    const result = await pool.query(query, [productId]);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error counting active sources:', error);
    throw error;
  }
}

export async function countCategories(productId: string) {
  const query =
    'SELECT COUNT(*) as count FROM categories WHERE product_id = $1';
  try {
    const result = await pool.query(query, [productId]);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error counting categories:', error);
    throw error;
  }
}

// ============================================
// SOURCE CHANGES
// ============================================

export async function createSourceChange(data: {
  sourceId: string;
  changeHash: string;
  url: string;
  title: string;
  publishedAt?: Date;
  rawHtml?: string;
  rawText?: string;
}) {
  const id = generateId('change');
  const query = `
    INSERT INTO source_changes (
      id, source_id, change_hash, url, title, published_at, raw_html, raw_text
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (change_hash) DO NOTHING
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [
      id,
      data.sourceId,
      data.changeHash,
      data.url,
      data.title,
      data.publishedAt || null,
      data.rawHtml || null,
      data.rawText || null,
    ]);
    return result.rows[0] || null; // Return null if conflict (already exists)
  } catch (error) {
    console.error('Error creating source change:', error);
    throw error;
  }
}

export async function findSourceChangeByHash(changeHash: string) {
  const query = 'SELECT * FROM source_changes WHERE change_hash = $1';
  try {
    const result = await pool.query(query, [changeHash]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding source change:', error);
    throw error;
  }
}

export async function findSourceChangesBySourceId(
  sourceId: string,
  limit: number = 10,
) {
  const query = `
    SELECT * FROM source_changes 
    WHERE source_id = $1 
    ORDER BY created_at DESC 
    LIMIT $2
  `;
  try {
    const result = await pool.query(query, [sourceId, limit]);
    return result.rows;
  } catch (error) {
    console.error('Error finding source changes by source ID:', error);
    throw error;
  }
}

export async function findUnprocessedChanges(productId: string, since: Date) {
  const query = `
    SELECT
      c.*,
      json_agg(
        json_build_object(
          'id', s.id,
          'name', s.name,
          'category_id', s.category_id,
          'source_changes', (
            SELECT json_agg(row_to_json(sc_limited))
            FROM (
              SELECT sc.id, sc.source_id, sc.change_hash, sc.url, sc.title,
                     sc.published_at, sc.raw_html, sc.raw_text, sc.created_at
              FROM source_changes sc
              WHERE sc.source_id = s.id
              AND sc.created_at >= $2
              AND NOT EXISTS (
                SELECT 1 FROM report_items ri WHERE ri.source_change_id = sc.id
              )
              ORDER BY sc.created_at DESC
              LIMIT 10
            ) sc_limited
          )
        )
      ) FILTER (WHERE s.id IS NOT NULL) as sources
    FROM categories c
    LEFT JOIN sources s ON s.category_id = c.id AND s.is_active = TRUE
    WHERE c.product_id = $1 AND c.is_active = TRUE
    GROUP BY c.id, c.name, c.product_id, c.sort, c.is_active, c.created_at, c.updated_at
    ORDER BY c.sort ASC
  `;
  try {
    const result = await pool.query(query, [productId, since]);
    return result.rows;
  } catch (error) {
    console.error('Error finding unprocessed changes:', error);
    throw error;
  }
}

// ============================================
// REPORTS
// ============================================

export async function createReport(data: {
  productId: string;
  date: Date;
  languageDefault?: string;
}) {
  const id = generateId('report');
  const query = `
    INSERT INTO reports (id, product_id, date, status, language_default)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [
      id,
      data.productId,
      data.date,
      'DRAFT',
      data.languageDefault || 'en',
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
}

export async function findReportByDate(productId: string, date: Date) {
  const query = 'SELECT * FROM reports WHERE product_id = $1 AND date = $2';
  try {
    const result = await pool.query(query, [productId, date]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding report by date:', error);
    throw error;
  }
}

export async function findReportById(id: string) {
  const query = 'SELECT * FROM reports WHERE id = $1';
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding report:', error);
    throw error;
  }
}

export async function findReportWithItems(id: string) {
  const query = `
    SELECT 
      r.*,
      p.name as product_name,
      json_agg(
        json_build_object(
          'id', ri.id,
          'source_id', ri.source_id,
          'source_name', ri.source_name,
          'url', ri.url,
          'title', ri.title,
          'extracted_facts_json', ri.extracted_facts_json,
          'summary_json', ri.summary_json,
          'language', ri.language,
          'category_name', c.name,
          'category_sort', c.sort
        ) ORDER BY c.sort, ri.source_name
      ) FILTER (WHERE ri.id IS NOT NULL) as items
    FROM reports r
    JOIN products p ON p.id = r.product_id
    LEFT JOIN report_items ri ON ri.report_id = r.id
    LEFT JOIN sources s ON s.id = ri.source_id
    LEFT JOIN categories c ON c.id = s.category_id
    WHERE r.id = $1
    GROUP BY r.id, p.name
  `;
  try {
    const result = await pool.query(query, [id]);
    const row = result.rows[0];
    if (row) {
      row.items = row.items || [];
    }
    return row;
  } catch (error) {
    console.error('Error finding report with items:', error);
    throw error;
  }
}

export async function findRecentReports(productId: string, limit: number = 5) {
  const query = `
    SELECT * FROM reports
    WHERE product_id = $1
    ORDER BY date DESC
    LIMIT $2
  `;
  try {
    const result = await pool.query(query, [productId, limit]);
    return result.rows;
  } catch (error) {
    console.error('Error finding recent reports:', error);
    throw error;
  }
}

export async function findAllPublishedReports(productId: string) {
  const query = `
    SELECT * FROM reports
    WHERE product_id = $1 AND status = 'PUBLISHED'
    ORDER BY date DESC
  `;
  try {
    const result = await pool.query(query, [productId]);
    return result.rows;
  } catch (error) {
    console.error('Error finding all published reports:', error);
    throw error;
  }
}

export async function findPublishedReports(productId: string, userId: string) {
  // Get reports user has access to via subscription or one-off purchase
  const query = `
    SELECT DISTINCT r.*
    FROM reports r
    WHERE r.product_id = $1 AND r.status = 'PUBLISHED'
    AND (
      -- Has active subscription covering this date
      EXISTS (
        SELECT 1 FROM subscriptions s
        WHERE s.user_id = $2
        AND s.product_id = r.product_id
        AND s.status = 'ACTIVE'
        AND r.date >= s.current_period_start::date
        AND r.date <= s.current_period_end::date
      )
      OR
      -- Has one-off purchase for this date
      EXISTS (
        SELECT 1 FROM one_off_purchases o
        WHERE o.user_id = $2
        AND o.product_id = r.product_id
        AND o.report_date = r.date
        AND o.status = 'PAID'
      )
    )
    ORDER BY r.date DESC
  `;
  try {
    const result = await pool.query(query, [productId, userId]);
    return result.rows;
  } catch (error) {
    console.error('Error finding published reports:', error);
    throw error;
  }
}

export async function findLatestPublishedReport(productId: string) {
  const query = `
    SELECT * FROM reports
    WHERE product_id = $1 AND status = 'PUBLISHED'
    ORDER BY date DESC
    LIMIT 1
  `;
  try {
    const result = await pool.query(query, [productId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding latest report:', error);
    throw error;
  }
}

// Get recent published reports (admin view - no user filtering)
export async function findRecentPublishedReports(
  productId: string,
  limit: number = 5,
) {
  const query = `
    SELECT * FROM reports
    WHERE product_id = $1 AND status = 'PUBLISHED'
    ORDER BY date DESC
    LIMIT $2
  `;
  try {
    const result = await pool.query(query, [productId, limit]);
    return result.rows;
  } catch (error) {
    console.error('Error finding recent published reports:', error);
    throw error;
  }
}

export async function updateReport(
  id: string,
  data: {
    status?: 'DRAFT' | 'PUBLISHED' | 'FAILED';
    totalItems?: number;
    publishedAt?: Date;
  },
) {
  const updates: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = [];
  let paramIndex = 1;

  if (data.status) {
    updates.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }
  if (data.totalItems !== undefined) {
    updates.push(`total_items = $${paramIndex++}`);
    values.push(data.totalItems);
  }
  if (data.publishedAt !== undefined) {
    updates.push(`published_at = $${paramIndex++}`);
    values.push(data.publishedAt);
  }

  values.push(id);

  const query = `
    UPDATE reports
    SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
}

export async function createReportItem(data: {
  reportId: string;
  sourceId: string;
  sourceChangeId?: string;
  sourceName: string;
  url: string;
  title: string;
  extractedFactsJson: string;
  summaryJson: string;
  language?: string;
}) {
  const id = generateId('item');
  const query = `
    INSERT INTO report_items (
      id, report_id, source_id, source_change_id, source_name,
      url, title, extracted_facts_json, summary_json, language
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [
      id,
      data.reportId,
      data.sourceId,
      data.sourceChangeId || null,
      data.sourceName,
      data.url,
      data.title,
      data.extractedFactsJson,
      data.summaryJson,
      data.language || 'en',
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating report item:', error);
    throw error;
  }
}

export async function createReportLanguage(data: {
  reportId: string;
  language: string;
  html: string;
  pdfPath?: string;
}) {
  const id = generateId('lang');
  const query = `
    INSERT INTO report_languages (id, report_id, language, html, pdf_path)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [
      id,
      data.reportId,
      data.language,
      data.html,
      data.pdfPath || null,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating report language:', error);
    throw error;
  }
}

export async function findAllReportLanguages(
  reportId: string,
): Promise<{ language: string; html: string }[]> {
  const query =
    'SELECT language, html FROM report_languages WHERE report_id = $1 ORDER BY language';
  try {
    const result = await pool.query(query, [reportId]);
    return result.rows;
  } catch (error) {
    console.error('Error finding all report languages:', error);
    throw error;
  }
}

export async function findReportLanguage(reportId: string, language: string) {
  const query =
    'SELECT * FROM report_languages WHERE report_id = $1 AND language = $2';
  try {
    const result = await pool.query(query, [reportId, language]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding report language:', error);
    throw error;
  }
}

export async function updateReportLanguageHtml(
  reportId: string,
  language: string,
  html: string,
) {
  const query = `
    UPDATE report_languages SET html = $1
    WHERE report_id = $2 AND language = $3
    RETURNING *
  `;
  try {
    const result = await pool.query(query, [html, reportId, language]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating report language html:', error);
    throw error;
  }
}

// ============================================
// SETTINGS
// ============================================

export async function getSetting(key: string) {
  const query = 'SELECT * FROM settings WHERE key = $1';
  try {
    const result = await pool.query(query, [key]);
    return result.rows[0];
  } catch (error) {
    console.error('Error getting setting:', error);
    throw error;
  }
}

export async function upsertSetting(key: string, valueJson: string) {
  const query = `
    INSERT INTO settings (key, value_json)
    VALUES ($1, $2)
    ON CONFLICT (key) DO UPDATE SET value_json = $2, updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  try {
    const result = await pool.query(query, [key, valueJson]);
    return result.rows[0];
  } catch (error) {
    console.error('Error upserting setting:', error);
    throw error;
  }
}

// ============================================
// AUDIT LOG
// ============================================

export async function createAuditLog(data: {
  actorUserId?: string;
  action: string;
  metaJson: string;
}) {
  const id = generateId('audit');
  const query = `
    INSERT INTO audit_logs (id, actor_user_id, action, meta_json)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [
      id,
      data.actorUserId || null,
      data.action,
      data.metaJson,
    ]);
    return result.rows[0];
  } catch (error) {
    if ((error as { code?: string }).code === '23503' && data.actorUserId) {
      console.warn('Audit log FK violation — retrying without actor_user_id');
      const fallback = await pool.query(query, [
        id,
        null,
        data.action,
        data.metaJson,
      ]);
      return fallback.rows[0];
    }
    console.error('Error creating audit log:', error);
    throw error;
  }
}

// ============================================
// ADDITIONAL HELPER FUNCTIONS
// ============================================

export async function findActiveSubscribersForProduct(productId: string) {
  const query = `
    SELECT 
      s.*,
      u.email, u.name as user_name
    FROM subscriptions s
    JOIN users u ON u.id = s.user_id
    WHERE s.product_id = $1 AND s.status = 'ACTIVE'
  `;
  try {
    const result = await pool.query(query, [productId]);
    return result.rows;
  } catch (error) {
    console.error('Error finding active subscribers:', error);
    throw error;
  }
}

export async function findSubscriptionByMpgsRef(
  userId: string,
  productId: string,
  mpgsRef: string,
) {
  const query = `
    SELECT * FROM subscriptions 
    WHERE user_id = $1 AND product_id = $2 AND mpgs_customer_ref = $3 
    LIMIT 1
  `;
  try {
    const result = await pool.query(query, [userId, productId, mpgsRef]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding subscription by MPGS ref:', error);
    throw error;
  }
}

export async function findPublishedReportByDate(date: Date) {
  const query = `
    SELECT r.*, p.name as product_name, p.id as product_id
    FROM reports r
    JOIN products p ON p.id = r.product_id
    WHERE r.date = $1 AND r.status = 'PUBLISHED'
    LIMIT 1
  `;
  try {
    const result = await pool.query(query, [date]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding published report by date:', error);
    throw error;
  }
}

export async function findCategoriesWithCount(productId: string) {
  const query = `
    SELECT
      c.*,
      COUNT(s.id)::integer as source_count
    FROM categories c
    LEFT JOIN sources s ON s.category_id = c.id
    WHERE c.product_id = $1
    GROUP BY c.id
    ORDER BY c.sort ASC
  `;
  try {
    const result = await pool.query(query, [productId]);
    return result.rows;
  } catch (error) {
    console.error('Error finding categories with count:', error);
    throw error;
  }
}

export async function findCheckoutContext(orderId: string): Promise<{
  userId: string;
  planId: string;
  productId: string;
  interval: string;
  reportDate?: string;
  courseId?: string;
  termsVersion?: string;
  termsIp?: string;
  termsAcceptedAt?: string;
} | null> {
  const query = `
    SELECT meta_json
    FROM audit_logs
    WHERE action = 'checkout.initiated'
      AND meta_json::jsonb->>'orderId' = $1
    LIMIT 1
  `;
  try {
    const result = await pool.query(query, [orderId]);
    if (!result.rows[0]) return null;
    return JSON.parse(result.rows[0].meta_json);
  } catch (error) {
    console.error('Error finding checkout context:', error);
    throw error;
  }
}

// ============================================
// TRAINING COURSES
// ============================================

async function recalculateCourseStats(
  courseId: string,
  client: QueryClient = pool,
) {
  const query = `
    UPDATE courses
    SET
      total_lessons = COALESCE(stats.total_lessons, 0),
      total_duration_seconds = COALESCE(stats.total_duration_seconds, 0),
      updated_at = CURRENT_TIMESTAMP
    FROM (
      SELECT
        COUNT(*)::integer as total_lessons,
        COALESCE(SUM(video_duration_seconds), 0)::integer as total_duration_seconds
      FROM course_lessons
      WHERE course_id = $1
    ) stats
    WHERE courses.id = $1
    RETURNING courses.*
  `;
  const result = await client.query(query, [courseId]);
  return result.rows[0];
}

export async function createCourse(data: {
  productId: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  whatYouLearn?: string[];
  requirements?: string[];
  thumbnailUrl?: string | null;
  trailerUrl?: string | null;
  instructorName: string;
  instructorBio?: string | null;
  instructorAvatarUrl?: string | null;
  level?: CourseLevel;
  language?: string;
  priceMinor: number;
  currency?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  sort?: number;
}) {
  const client = await pool.connect();
  const courseId = generateId('course');
  const planId = `plan-course-${courseId}`;

  try {
    await client.query('BEGIN');

    const courseResult = await client.query(
      `
        INSERT INTO courses (
          id, product_id, slug, title, short_description, description,
          what_you_learn, requirements, thumbnail_url, trailer_url,
          instructor_name, instructor_bio, instructor_avatar_url,
          level, language, is_published, is_featured, sort
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18
        )
        RETURNING *
      `,
      [
        courseId,
        data.productId,
        data.slug,
        data.title,
        data.shortDescription,
        data.description,
        JSON.stringify(data.whatYouLearn || []),
        JSON.stringify(data.requirements || []),
        data.thumbnailUrl || null,
        data.trailerUrl || null,
        data.instructorName,
        data.instructorBio || null,
        data.instructorAvatarUrl || null,
        data.level || 'beginner',
        data.language || 'en',
        data.isPublished || false,
        data.isFeatured || false,
        data.sort || 0,
      ],
    );

    await client.query(
      `
        INSERT INTO plans (
          id, product_id, name, price_minor, currency, interval,
          course_id, is_active, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, 'ONE_OFF', $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      [
        planId,
        data.productId,
        data.title,
        data.priceMinor,
        data.currency || 'SCR',
        courseId,
        data.isPublished || false,
      ],
    );

    await client.query('UPDATE courses SET plan_id = $1 WHERE id = $2', [
      planId,
      courseId,
    ]);

    await client.query('COMMIT');

    return {
      ...courseResult.rows[0],
      plan_id: planId,
      price_minor: data.priceMinor,
      currency: data.currency || 'SCR',
      plan_name: data.title,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating course:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function findCourseById(id: string) {
  const query = `
    SELECT
      c.*,
      pl.name as plan_name,
      pl.price_minor,
      pl.currency,
      pl.is_active as plan_is_active
    FROM courses c
    LEFT JOIN plans pl ON pl.id = c.plan_id
    WHERE c.id = $1
  `;
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding course by id:', error);
    throw error;
  }
}

export async function findCourseBySlug(
  slug: string,
  includeUnpublished = false,
) {
  const query = `
    SELECT
      c.*,
      pl.name as plan_name,
      pl.price_minor,
      pl.currency,
      pl.is_active as plan_is_active
    FROM courses c
    LEFT JOIN plans pl ON pl.id = c.plan_id
    WHERE c.slug = $1
      AND ($2::boolean = TRUE OR c.is_published = TRUE)
    LIMIT 1
  `;
  try {
    const result = await pool.query(query, [slug, includeUnpublished]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding course by slug:', error);
    throw error;
  }
}

export async function findAllPublishedCourses() {
  const query = `
    SELECT
      c.*,
      pl.price_minor,
      pl.currency,
      pl.is_active as plan_is_active,
      COUNT(DISTINCT ce.id)::integer as enrollment_count
    FROM courses c
    LEFT JOIN plans pl ON pl.id = c.plan_id
    LEFT JOIN course_enrollments ce ON ce.course_id = c.id
    WHERE c.is_published = TRUE
    GROUP BY c.id, pl.id
    ORDER BY c.is_featured DESC, c.sort ASC, c.created_at DESC
  `;
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error finding published courses:', error);
    throw error;
  }
}

export async function findCoursesForAdmin() {
  const query = `
    SELECT
      c.*,
      pl.price_minor,
      pl.currency,
      pl.is_active as plan_is_active,
      COUNT(DISTINCT cm.id)::integer as module_count,
      COUNT(DISTINCT ce.id)::integer as enrollment_count
    FROM courses c
    LEFT JOIN plans pl ON pl.id = c.plan_id
    LEFT JOIN course_modules cm ON cm.course_id = c.id
    LEFT JOIN course_enrollments ce ON ce.course_id = c.id
    GROUP BY c.id, pl.id
    ORDER BY c.sort ASC, c.created_at DESC
  `;
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error finding admin courses:', error);
    throw error;
  }
}

export async function updateCourse(
  id: string,
  data: Partial<{
    slug: string;
    title: string;
    shortDescription: string;
    description: string;
    whatYouLearn: string[];
    requirements: string[];
    thumbnailUrl: string | null;
    trailerUrl: string | null;
    instructorName: string;
    instructorBio: string | null;
    instructorAvatarUrl: string | null;
    level: CourseLevel;
    language: string;
    priceMinor: number;
    currency: string;
    isPublished: boolean;
    isFeatured: boolean;
    sort: number;
  }>,
) {
  const existing = await findCourseById(id);
  if (!existing) return null;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    const addField = (column: string, value: unknown) => {
      fields.push(`${column} = $${paramCount++}`);
      values.push(value);
    };

    if (data.slug !== undefined) addField('slug', data.slug);
    if (data.title !== undefined) addField('title', data.title);
    if (data.shortDescription !== undefined) {
      addField('short_description', data.shortDescription);
    }
    if (data.description !== undefined)
      addField('description', data.description);
    if (data.whatYouLearn !== undefined) {
      fields.push(`what_you_learn = $${paramCount++}::jsonb`);
      values.push(JSON.stringify(data.whatYouLearn));
    }
    if (data.requirements !== undefined) {
      fields.push(`requirements = $${paramCount++}::jsonb`);
      values.push(JSON.stringify(data.requirements));
    }
    if (data.thumbnailUrl !== undefined)
      addField('thumbnail_url', data.thumbnailUrl);
    if (data.trailerUrl !== undefined) addField('trailer_url', data.trailerUrl);
    if (data.instructorName !== undefined) {
      addField('instructor_name', data.instructorName);
    }
    if (data.instructorBio !== undefined)
      addField('instructor_bio', data.instructorBio);
    if (data.instructorAvatarUrl !== undefined) {
      addField('instructor_avatar_url', data.instructorAvatarUrl);
    }
    if (data.level !== undefined) addField('level', data.level);
    if (data.language !== undefined) addField('language', data.language);
    if (data.isPublished !== undefined)
      addField('is_published', data.isPublished);
    if (data.isFeatured !== undefined) addField('is_featured', data.isFeatured);
    if (data.sort !== undefined) addField('sort', data.sort);

    if (fields.length > 0) {
      values.push(id);
      await client.query(
        `
          UPDATE courses
          SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $${paramCount}
        `,
        values,
      );
    }

    const planUpdates: string[] = [];
    const planValues: unknown[] = [];
    let planParamCount = 1;

    const addPlanField = (column: string, value: unknown) => {
      planUpdates.push(`${column} = $${planParamCount++}`);
      planValues.push(value);
    };

    if (data.title !== undefined) addPlanField('name', data.title);
    if (data.priceMinor !== undefined)
      addPlanField('price_minor', data.priceMinor);
    if (data.currency !== undefined) addPlanField('currency', data.currency);
    if (data.isPublished !== undefined)
      addPlanField('is_active', data.isPublished);

    if (planUpdates.length > 0 && existing.plan_id) {
      planValues.push(existing.plan_id);
      await client.query(
        `
          UPDATE plans
          SET ${planUpdates.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $${planParamCount}
        `,
        planValues,
      );
    }

    await client.query('COMMIT');
    return await findCourseById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating course:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteCourse(id: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `
        UPDATE plans
        SET is_active = FALSE, course_id = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE course_id = $1
      `,
      [id],
    );
    await client.query('DELETE FROM courses WHERE id = $1', [id]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting course:', error);
    throw error;
  } finally {
    client.release();
  }
}

// ============================================
// TRAINING MODULES & LESSONS
// ============================================

export async function findModulesForCourse(courseId: string) {
  try {
    const [modulesResult, lessonsResult] = await Promise.all([
      pool.query(
        `
          SELECT *
          FROM course_modules
          WHERE course_id = $1
          ORDER BY sort ASC, created_at ASC
        `,
        [courseId],
      ),
      pool.query(
        `
          SELECT *
          FROM course_lessons
          WHERE course_id = $1
          ORDER BY sort ASC, created_at ASC
        `,
        [courseId],
      ),
    ]);

    return modulesResult.rows.map((module) => ({
      ...module,
      lessons: lessonsResult.rows.filter(
        (lesson) => lesson.module_id === module.id,
      ),
    }));
  } catch (error) {
    console.error('Error finding modules for course:', error);
    throw error;
  }
}

export async function findCourseModuleById(id: string) {
  const query = 'SELECT * FROM course_modules WHERE id = $1';
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding course module:', error);
    throw error;
  }
}

export async function createCourseModule(data: {
  courseId: string;
  title: string;
  description?: string | null;
  sort?: number;
}) {
  const id = generateId('module');
  const sort =
    data.sort ??
    parseInt(
      (
        await pool.query(
          'SELECT COUNT(*) as count FROM course_modules WHERE course_id = $1',
          [data.courseId],
        )
      ).rows[0].count,
    );

  const query = `
    INSERT INTO course_modules (id, course_id, title, description, sort)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  try {
    const result = await pool.query(query, [
      id,
      data.courseId,
      data.title,
      data.description || null,
      sort,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating course module:', error);
    throw error;
  }
}

export async function updateCourseModule(
  id: string,
  data: Partial<{ title: string; description: string | null; sort: number }>,
) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (data.title !== undefined) {
    fields.push(`title = $${paramCount++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    values.push(data.description);
  }
  if (data.sort !== undefined) {
    fields.push(`sort = $${paramCount++}`);
    values.push(data.sort);
  }

  if (fields.length === 0) {
    return findCourseModuleById(id);
  }

  values.push(id);
  const query = `
    UPDATE course_modules
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount}
    RETURNING *
  `;
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating course module:', error);
    throw error;
  }
}

export async function deleteCourseModule(id: string) {
  const courseModule = await findCourseModuleById(id);
  if (!courseModule) return;

  try {
    await pool.query('DELETE FROM course_modules WHERE id = $1', [id]);
    await recalculateCourseStats(courseModule.course_id);
  } catch (error) {
    console.error('Error deleting course module:', error);
    throw error;
  }
}

export async function findCourseLessonById(id: string) {
  const query = `
    SELECT
      l.*,
      c.slug as course_slug,
      c.title as course_title,
      c.is_published as course_is_published
    FROM course_lessons l
    JOIN courses c ON c.id = l.course_id
    WHERE l.id = $1
  `;
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding course lesson:', error);
    throw error;
  }
}

export async function createCourseLesson(data: {
  courseId: string;
  moduleId: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  videoDurationSeconds?: number;
  resourceUrls?: CourseResourceUrl[];
  isPreview?: boolean;
  sort?: number;
}) {
  const courseModule = await findCourseModuleById(data.moduleId);
  if (!courseModule || courseModule.course_id !== data.courseId) {
    throw new Error('Invalid module for course');
  }

  const id = generateId('lesson');
  const sort =
    data.sort ??
    parseInt(
      (
        await pool.query(
          'SELECT COUNT(*) as count FROM course_lessons WHERE module_id = $1',
          [data.moduleId],
        )
      ).rows[0].count,
    );

  const query = `
    INSERT INTO course_lessons (
      id, module_id, course_id, title, description, video_url,
      video_duration_seconds, resource_urls, is_preview, sort
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [
      id,
      data.moduleId,
      data.courseId,
      data.title,
      data.description || null,
      data.videoUrl || null,
      data.videoDurationSeconds || 0,
      JSON.stringify(data.resourceUrls || []),
      data.isPreview || false,
      sort,
    ]);
    await recalculateCourseStats(data.courseId);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating course lesson:', error);
    throw error;
  }
}

export async function updateCourseLesson(
  id: string,
  data: Partial<{
    moduleId: string;
    title: string;
    description: string | null;
    videoUrl: string | null;
    videoDurationSeconds: number;
    resourceUrls: CourseResourceUrl[];
    isPreview: boolean;
    sort: number;
  }>,
) {
  const existing = await findCourseLessonById(id);
  if (!existing) return null;

  if (data.moduleId !== undefined) {
    const courseModule = await findCourseModuleById(data.moduleId);
    if (!courseModule || courseModule.course_id !== existing.course_id) {
      throw new Error('Invalid module for lesson');
    }
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (data.moduleId !== undefined) {
    fields.push(`module_id = $${paramCount++}`);
    values.push(data.moduleId);
  }
  if (data.title !== undefined) {
    fields.push(`title = $${paramCount++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    values.push(data.description);
  }
  if (data.videoUrl !== undefined) {
    fields.push(`video_url = $${paramCount++}`);
    values.push(data.videoUrl);
  }
  if (data.videoDurationSeconds !== undefined) {
    fields.push(`video_duration_seconds = $${paramCount++}`);
    values.push(data.videoDurationSeconds);
  }
  if (data.resourceUrls !== undefined) {
    fields.push(`resource_urls = $${paramCount++}::jsonb`);
    values.push(JSON.stringify(data.resourceUrls));
  }
  if (data.isPreview !== undefined) {
    fields.push(`is_preview = $${paramCount++}`);
    values.push(data.isPreview);
  }
  if (data.sort !== undefined) {
    fields.push(`sort = $${paramCount++}`);
    values.push(data.sort);
  }

  if (fields.length === 0) return existing;

  values.push(id);
  const query = `
    UPDATE course_lessons
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, values);
    await recalculateCourseStats(existing.course_id);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating course lesson:', error);
    throw error;
  }
}

export async function deleteCourseLesson(id: string) {
  const existing = await findCourseLessonById(id);
  if (!existing) return;

  try {
    await pool.query('DELETE FROM course_lessons WHERE id = $1', [id]);
    await recalculateCourseStats(existing.course_id);
  } catch (error) {
    console.error('Error deleting course lesson:', error);
    throw error;
  }
}

// ============================================
// TRAINING ENROLLMENT, ACCESS & PROGRESS
// ============================================

export async function createCourseEnrollment(
  userId: string,
  courseId: string,
  purchaseId?: string | null,
  accessExpiresAt?: Date | null,
) {
  const id = generateId('enroll');
  const query = `
    INSERT INTO course_enrollments (id, user_id, course_id, purchase_id, access_expires_at, last_accessed_at)
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, course_id) DO UPDATE SET
      purchase_id = COALESCE(EXCLUDED.purchase_id, course_enrollments.purchase_id),
      access_expires_at = COALESCE(EXCLUDED.access_expires_at, course_enrollments.access_expires_at),
      last_accessed_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  try {
    const result = await pool.query(query, [
      id,
      userId,
      courseId,
      purchaseId || null,
      accessExpiresAt || null,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating course enrollment:', error);
    throw error;
  }
}

export async function findCourseEnrollment(userId: string, courseId: string) {
  const query = `
    SELECT *
    FROM course_enrollments
    WHERE user_id = $1 AND course_id = $2
    LIMIT 1
  `;
  try {
    const result = await pool.query(query, [userId, courseId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding course enrollment:', error);
    throw error;
  }
}

export async function updateCourseEnrollmentLastAccessed(
  userId: string,
  courseId: string,
) {
  const query = `
    UPDATE course_enrollments
    SET last_accessed_at = CURRENT_TIMESTAMP
    WHERE user_id = $1 AND course_id = $2
    RETURNING *
  `;
  try {
    const result = await pool.query(query, [userId, courseId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating enrollment access time:', error);
    throw error;
  }
}

export async function findCoursePurchase(userId: string, courseId: string) {
  const query = `
    SELECT *
    FROM one_off_purchases
    WHERE user_id = $1 AND course_id = $2 AND status = 'PAID'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  try {
    const result = await pool.query(query, [userId, courseId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding course purchase:', error);
    throw error;
  }
}

export async function findActiveTrainingSubscription(userId: string) {
  const query = `
    SELECT s.*
    FROM subscriptions s
    JOIN products p ON p.id = s.product_id
    WHERE s.user_id = $1
      AND p.slug = 'training'
      AND s.status = 'ACTIVE'
      AND s.current_period_end >= CURRENT_DATE
    ORDER BY s.created_at DESC
    LIMIT 1
  `;
  try {
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error finding active training subscription:', error);
    throw error;
  }
}

export async function findUserEnrollments(userId: string) {
  const query = `
    SELECT
      ce.*,
      c.slug,
      c.title,
      c.short_description,
      c.thumbnail_url,
      c.total_lessons,
      c.total_duration_seconds,
      c.level,
      c.instructor_name,
      pl.price_minor,
      pl.currency,
      (
        SELECT COUNT(*)::integer
        FROM lesson_progress lp
        WHERE lp.user_id = $1
          AND lp.course_id = c.id
          AND lp.completed_at IS NOT NULL
      ) as completed_lessons,
      (
        SELECT cl.id
        FROM course_lessons cl
        WHERE cl.course_id = c.id
        ORDER BY cl.sort ASC, cl.created_at ASC
        LIMIT 1
      ) as first_lesson_id
    FROM course_enrollments ce
    JOIN courses c ON c.id = ce.course_id
    LEFT JOIN plans pl ON pl.id = c.plan_id
    WHERE ce.user_id = $1
    ORDER BY ce.last_accessed_at DESC NULLS LAST, ce.enrolled_at DESC
  `;
  try {
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error finding user enrollments:', error);
    throw error;
  }
}

export async function upsertLessonProgress(data: {
  userId: string;
  lessonId: string;
  courseId: string;
  watchSeconds?: number;
  completedAt?: Date | null;
}) {
  const id = generateId('progress');
  const query = `
    INSERT INTO lesson_progress (
      id, user_id, lesson_id, course_id, watch_seconds, completed_at
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (user_id, lesson_id) DO UPDATE SET
      watch_seconds = GREATEST(lesson_progress.watch_seconds, EXCLUDED.watch_seconds),
      completed_at = COALESCE(lesson_progress.completed_at, EXCLUDED.completed_at),
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  try {
    const result = await pool.query(query, [
      id,
      data.userId,
      data.lessonId,
      data.courseId,
      data.watchSeconds || 0,
      data.completedAt || null,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('Error upserting lesson progress:', error);
    throw error;
  }
}

export async function findCourseProgress(userId: string, courseId: string) {
  const query = `
    SELECT
      cl.id as lesson_id,
      cl.course_id,
      cl.title,
      cl.video_duration_seconds,
      lp.watch_seconds,
      lp.completed_at
    FROM course_lessons cl
    LEFT JOIN lesson_progress lp
      ON lp.lesson_id = cl.id AND lp.user_id = $1
    WHERE cl.course_id = $2
    ORDER BY cl.sort ASC, cl.created_at ASC
  `;
  try {
    const result = await pool.query(query, [userId, courseId]);
    const totalLessons = result.rows.length;
    const completedLessons = result.rows.filter(
      (row) => row.completed_at,
    ).length;
    return {
      totalLessons,
      completedLessons,
      percent:
        totalLessons === 0
          ? 0
          : Math.round((completedLessons / totalLessons) * 100),
      lessons: result.rows,
    };
  } catch (error) {
    console.error('Error finding course progress:', error);
    throw error;
  }
}

export async function markLessonComplete(
  userId: string,
  lessonId: string,
  courseId: string,
) {
  const progress = await upsertLessonProgress({
    userId,
    lessonId,
    courseId,
    completedAt: new Date(),
  });

  const courseProgress = await findCourseProgress(userId, courseId);
  if (
    courseProgress.totalLessons > 0 &&
    courseProgress.completedLessons >= courseProgress.totalLessons
  ) {
    await markCourseComplete(userId, courseId);
  }

  return progress;
}

export async function markCourseComplete(userId: string, courseId: string) {
  const query = `
    UPDATE course_enrollments
    SET completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP)
    WHERE user_id = $1 AND course_id = $2
    RETURNING *
  `;
  try {
    const result = await pool.query(query, [userId, courseId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error marking course complete:', error);
    throw error;
  }
}

// ============================================
// TRAINING ADMIN ANALYTICS
// ============================================

export async function countCoursesForProduct(productId: string) {
  const query =
    'SELECT COUNT(*)::integer as count FROM courses WHERE product_id = $1';
  try {
    const result = await pool.query(query, [productId]);
    return result.rows[0].count as number;
  } catch (error) {
    console.error('Error counting courses:', error);
    throw error;
  }
}

export async function countCourseEnrollments(courseId?: string) {
  const query = courseId
    ? 'SELECT COUNT(*)::integer as count FROM course_enrollments WHERE course_id = $1'
    : 'SELECT COUNT(*)::integer as count FROM course_enrollments';
  try {
    const result = await pool.query(query, courseId ? [courseId] : []);
    return result.rows[0].count as number;
  } catch (error) {
    console.error('Error counting course enrollments:', error);
    throw error;
  }
}

export async function countCourseCompletions(courseId?: string) {
  const query = courseId
    ? `
      SELECT COUNT(*)::integer as count
      FROM course_enrollments
      WHERE course_id = $1 AND completed_at IS NOT NULL
    `
    : `
      SELECT COUNT(*)::integer as count
      FROM course_enrollments
      WHERE completed_at IS NOT NULL
    `;
  try {
    const result = await pool.query(query, courseId ? [courseId] : []);
    return result.rows[0].count as number;
  } catch (error) {
    console.error('Error counting course completions:', error);
    throw error;
  }
}

export async function sumTrainingRevenue(productId: string) {
  const query = `
    SELECT COALESCE(SUM(amount_minor), 0)::integer as total
    FROM one_off_purchases
    WHERE product_id = $1 AND status = 'PAID'
  `;
  try {
    const result = await pool.query(query, [productId]);
    return result.rows[0].total as number;
  } catch (error) {
    console.error('Error summing training revenue:', error);
    throw error;
  }
}

export async function findRecentEnrollments(limit = 10) {
  const query = `
    SELECT
      ce.*,
      u.email,
      u.name as user_name,
      c.title as course_title,
      c.slug as course_slug
    FROM course_enrollments ce
    JOIN users u ON u.id = ce.user_id
    JOIN courses c ON c.id = ce.course_id
    ORDER BY ce.enrolled_at DESC
    LIMIT $1
  `;
  try {
    const result = await pool.query(query, [limit]);
    return result.rows;
  } catch (error) {
    console.error('Error finding recent enrollments:', error);
    throw error;
  }
}

export async function findCourseEnrollments(courseId?: string) {
  const query = `
    SELECT
      ce.*,
      u.email,
      u.name as user_name,
      c.title as course_title,
      c.slug as course_slug,
      c.total_lessons,
      (
        SELECT COUNT(*)::integer
        FROM lesson_progress lp
        WHERE lp.user_id = ce.user_id
          AND lp.course_id = ce.course_id
          AND lp.completed_at IS NOT NULL
      ) as completed_lessons
    FROM course_enrollments ce
    JOIN users u ON u.id = ce.user_id
    JOIN courses c ON c.id = ce.course_id
    WHERE ($1::text IS NULL OR ce.course_id = $1)
    ORDER BY ce.enrolled_at DESC
  `;
  try {
    const result = await pool.query(query, [courseId || null]);
    return result.rows;
  } catch (error) {
    console.error('Error finding course enrollments:', error);
    throw error;
  }
}

// ── Admin: User Management ──

export async function listUsers() {
  const query = `
    SELECT u.id, u.email, u.name, u.role, u.created_at,
      (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.user_id = u.id)::integer as enrollment_count,
      (SELECT COUNT(*) FROM one_off_purchases op WHERE op.user_id = u.id)::integer as purchase_count
    FROM users u
    ORDER BY u.created_at DESC
  `;
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
}

export async function updateUser(
  userId: string,
  data: { name?: string; role?: 'ADMIN' | 'MEMBER' },
) {
  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (data.name !== undefined) {
    sets.push(`name = $${idx++}`);
    params.push(data.name);
  }
  if (data.role !== undefined) {
    sets.push(`role = $${idx++}`);
    params.push(data.role);
  }

  if (sets.length === 0) return findUserById(userId);

  const query = `
    UPDATE users SET ${sets.join(', ')}, updated_at = NOW()
    WHERE id = $${idx}
    RETURNING *
  `;
  params.push(userId);

  try {
    const result = await pool.query(query, params);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUserWithData(userId: string) {
  const tables = [
    'lesson_progress',
    'course_enrollments',
    'one_off_purchases',
    'subscriptions',
    'audit_logs',
  ];
  try {
    for (const table of tables) {
      const col = table === 'audit_logs' ? 'actor_user_id' : 'user_id';
      await pool.query(`DELETE FROM ${table} WHERE ${col} = $1`, [userId]);
    }
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// ── Feature flags ──

export async function isFeatureEnabled(feature: string): Promise<boolean> {
  try {
    const row = await getSetting(`feature_${feature}`);
    if (!row) return true; // not yet set = enabled by default
    return row.value_json === 'true';
  } catch {
    return true; // settings table doesn't exist yet = enabled by default
  }
}

export async function listFeatureFlags(): Promise<{ key: string; enabled: boolean }[]> {
  try {
    const result = await pool.query(
      `SELECT key, value_json FROM settings WHERE key LIKE 'feature_%' ORDER BY key`,
    );
    return result.rows.map((r: { key: string; value_json: string }) => ({
      key: r.key.replace('feature_', ''),
      enabled: r.value_json === 'true',
    }));
  } catch {
    return [];
  }
}

export async function setFeatureFlag(feature: string, enabled: boolean): Promise<void> {
  await upsertSetting(`feature_${feature}`, enabled ? 'true' : 'false');
}

// Close the pool when the application shuts down
process.on('SIGINT', () => {
  pool.end();
});

export default pool;
