import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const mpgsConfigured = !!(
    process.env.MPGS_MERCHANT_ID &&
    process.env.MPGS_API_PASSWORD &&
    process.env.MPGS_WEBHOOK_SECRET &&
    process.env.MPGS_GATEWAY_URL &&
    process.env.MPGS_SUCCESS_URL &&
    process.env.MPGS_CANCEL_URL
  );

  const [recentWebhooks, recentCheckouts, orphaned] = await Promise.all([
    pool.query(
      "SELECT created_at, meta_json FROM audit_logs WHERE action = 'webhook.received' ORDER BY created_at DESC LIMIT 10",
    ),
    pool.query(
      "SELECT created_at, meta_json FROM audit_logs WHERE action = 'checkout.initiated' ORDER BY created_at DESC LIMIT 10",
    ),
    pool.query(`
      SELECT op.id, op.user_id, op.course_id, op.amount_minor, op.currency, op.status,
        op.mpgs_order_id, op.created_at, u.email, c.title AS course_title
      FROM one_off_purchases op
      JOIN users u ON u.id = op.user_id
      LEFT JOIN courses c ON c.id = op.course_id
      WHERE op.status = 'PAID'
        AND op.course_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM course_enrollments ce WHERE ce.purchase_id = op.id)
      ORDER BY op.created_at DESC
      LIMIT 50
    `),
  ]);

  return NextResponse.json({
    configured: mpgsConfigured,
    merchantId: process.env.MPGS_MERCHANT_ID ? 'set' : 'missing',
    gatewayUrl: process.env.MPGS_GATEWAY_URL ? 'set' : 'missing',
    webhookSecretSet: !!process.env.MPGS_WEBHOOK_SECRET,
    expectedWebhookUrl: `${process.env.NEXT_PUBLIC_WEBSITE_URL || process.env.APP_URL || 'https://fermidas.com'}/api/payments/mpgs/webhook`,
    recentCheckouts: recentCheckouts.rows.map((r: { created_at: string; meta_json: string }) => ({
      time: r.created_at,
      context: tryParse(r.meta_json),
    })),
    recentWebhooks: recentWebhooks.rows.map((r: { created_at: string; meta_json: string }) => ({
      time: r.created_at,
      context: tryParse(r.meta_json),
    })),
    orphanedPurchases: orphaned.rows.map((r: Record<string, unknown>) => ({
      id: r.id,
      email: r.email,
      courseTitle: r.course_title,
      amountMinor: r.amount_minor,
      currency: r.currency,
      orderId: r.mpgs_order_id,
      purchasedAt: r.created_at,
    })),
  });
}

function tryParse(json: string) {
  try {
    return JSON.parse(json);
  } catch {
    return json;
  }
}
