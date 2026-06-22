import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { verifyWebhookRequest, retrieveOrder } from '@/lib/mpgs';
import { z } from 'zod';

// MPGS webhook payload schema
const webhookSchema = z.object({
  order: z.object({
    id: z.string(),
    status: z.string(),
    amount: z.number().optional(),
    currency: z.string().optional(),
  }),
  transaction: z
    .object({
      id: z.string().optional(),
      type: z.string().optional(),
      result: z.string().optional(),
    })
    .optional(),
  sourceOfFunds: z
    .object({
      provided: z
        .object({
          card: z
            .object({
              scheme: z.string().optional(),
              number: z.string().optional(), // masked
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const secretHeader = request.headers.get('x-notification-secret');
    const signatureHeader = request.headers.get('x-mpgs-signature');

    // Verify webhook (X-Notification-Secret or x-mpgs-signature HMAC)
    if (!verifyWebhookRequest(rawBody, secretHeader, signatureHeader)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody);
    const validatedPayload = webhookSchema.parse(payload);

    const { order, transaction } = validatedPayload;

    // Retrieve full order details from MPGS (non-fatal: fall back to webhook payload)
    let fullOrder: Record<string, unknown> = {};
    try {
      fullOrder = await retrieveOrder(order.id);
    } catch (retrieveErr) {
      console.warn(
        'MPGS order retrieval failed — using webhook payload:',
        retrieveErr instanceof Error ? retrieveErr.message : retrieveErr,
      );
      // Use the webhook payload as the order source (amount, currency, etc.)
      fullOrder = {
        order: { id: order.id },
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        transaction: transaction ? [transaction] : [],
      };
    }

    // Look up checkout context from our audit log (keyed by orderId)
    const context = await db.findCheckoutContext(order.id);

    if (
      !context?.userId ||
      !context?.planId ||
      !context?.productId ||
      !context?.interval
    ) {
      console.error('Missing checkout context for order:', order.id);
      return NextResponse.json(
        { error: 'Invalid checkout context' },
        { status: 400 },
      );
    }

    const {
      userId,
      planId,
      productId,
      interval,
      reportDate,
      courseId,
      termsVersion,
      termsIp,
      termsAcceptedAt,
    } = context;

    // Treat any CAPTURED/AUTHORIZED status as success, from either the webhook payload
    // or the full order retrieved from MPGS (the retrieve endpoint returns status at top level).
    // Also accept transaction.result === 'SUCCESS' as a standalone success signal.
    const isSuccess =
      order.status === 'CAPTURED' ||
      order.status === 'AUTHORIZED' ||
      fullOrder.status === 'CAPTURED' ||
      fullOrder.status === 'AUTHORIZED' ||
      transaction?.result === 'SUCCESS';

    if (interval === 'MONTH') {
      await handleSubscription({
        orderId: order.id,
        userId,
        planId,
        productId,
        isSuccess,
        fullOrder,
        termsVersion,
        termsIp,
        termsAcceptedAt,
      });
    } else if (interval === 'ONE_OFF') {
      if (courseId) {
        await handleCoursePurchase({
          orderId: order.id,
          userId,
          planId,
          productId,
          courseId,
          isSuccess,
          fullOrder,
        });
      } else if (reportDate) {
        await handleOneOffPurchase({
          orderId: order.id,
          userId,
          planId,
          productId,
          reportDate: new Date(reportDate),
          isSuccess,
          fullOrder,
        });
      } else {
        console.error(
          'Missing reportDate/courseId for one-off purchase, order:',
          order.id,
        );
        return NextResponse.json(
          { error: 'Invalid one-off purchase context' },
          { status: 400 },
        );
      }
    }

    // Log webhook receipt
    await db.createAuditLog({
      actorUserId: userId,
      action: 'webhook.received',
      metaJson: JSON.stringify({
        orderId: order.id,
        status: order.status,
        result: transaction?.result,
        interval,
      }),
    });

    return NextResponse.json({ received: true, orderId: order.id });
  } catch (error) {
    console.error('Webhook processing error:', error);

    // Always return 200 to prevent retries on our errors
    return NextResponse.json(
      { received: true, error: 'Processing failed' },
      { status: 200 },
    );
  }
}

interface HandleSubscriptionParams {
  orderId: string;
  userId: string;
  planId: string;
  productId: string;
  isSuccess: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fullOrder: any;
  termsVersion?: string;
  termsIp?: string;
  termsAcceptedAt?: string;
}

async function handleSubscription(params: HandleSubscriptionParams) {
  const {
    orderId,
    userId,
    planId,
    productId,
    isSuccess,
    fullOrder,
    termsVersion,
    termsIp,
    termsAcceptedAt,
  } = params;

  // Check if subscription already exists (idempotency)
  const existing = await db.findSubscriptionByMpgsRef(
    userId,
    productId,
    orderId,
  );

  if (existing) {
    console.log('Subscription already processed (idempotent)');
    return;
  }

  if (isSuccess) {
    const token =
      fullOrder.sourceOfFunds?.token ||
      fullOrder.paymentMethod?.tokenization?.token;

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    try {
      await db.createSubscription({
        userId,
        productId,
        planId,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        mpgsCustomerRef: orderId,
        mpgsTokenRef: token,
        termsAcceptedAt: termsAcceptedAt ? new Date(termsAcceptedAt) : now,
        termsVersion: termsVersion || '1.0',
        termsIpAddress: termsIp,
      });
    } catch (err) {
      if ((err as { code?: string }).code === '23505') {
        console.log('Subscription already processed (concurrent idempotent)');
        return;
      }
      throw err;
    }

    await db.createAuditLog({
      actorUserId: userId,
      action: 'subscription.activated',
      metaJson: JSON.stringify({
        orderId,
        planId,
        productId,
        periodEnd: periodEnd.toISOString(),
      }),
    });
  } else {
    await db.createAuditLog({
      actorUserId: userId,
      action: 'subscription.failed',
      metaJson: JSON.stringify({
        orderId,
        planId,
        productId,
        reason: fullOrder.error?.explanation || 'Payment declined',
      }),
    });
  }
}

interface HandleOneOffPurchaseParams {
  orderId: string;
  userId: string;
  planId: string;
  productId: string;
  reportDate: Date;
  isSuccess: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fullOrder: any;
}

interface HandleCoursePurchaseParams {
  orderId: string;
  userId: string;
  planId: string;
  productId: string;
  courseId: string;
  isSuccess: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fullOrder: any;
}

async function handleCoursePurchase(params: HandleCoursePurchaseParams) {
  const { orderId, userId, planId, productId, courseId, isSuccess, fullOrder } =
    params;

  const plan = await db.findPlanById(planId);
  if (!plan) {
    throw new Error('Plan not found');
  }

  const course = await db.findCourseById(courseId);
  if (!course || course.plan_id !== planId) {
    throw new Error('Course purchase context does not match plan');
  }

  const existing = await db.findOneOffPurchaseByOrderId(orderId);

  if (existing) {
    if (existing.status === 'PAID') {
      const accessExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db.createCourseEnrollment(userId, courseId, existing.id, accessExpiresAt);
      console.log('Course purchase already PAID (idempotent)');
      return;
    }

    if (isSuccess) {
      const updatedPurchase = await db.updateOneOffPurchaseStatusByOrderId(
        orderId,
        'PAID',
      );
      const accessExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db.createCourseEnrollment(
        userId,
        courseId,
        updatedPurchase?.id || existing.id,
        accessExpiresAt,
      );
      await db.createAuditLog({
        actorUserId: userId,
        action: 'course.purchase.completed',
        metaJson: JSON.stringify({
          orderId,
          planId,
          productId,
          courseId,
          amount: plan.price_minor,
          note: 'Upgraded from FAILED to PAID on CAPTURED webhook',
        }),
      });
    }
    return;
  }

  let purchase;
  try {
    purchase = await db.createOneOffPurchase({
      userId,
      productId,
      planId,
      reportDate: null,
      courseId,
      amountMinor: plan.price_minor,
      currency: plan.currency,
      status: isSuccess ? 'PAID' : 'FAILED',
      mpgsOrderId: orderId,
      mpgsTxnId: fullOrder.transaction?.[0]?.id,
    });
  } catch (err) {
    if ((err as { code?: string }).code === '23505') {
      console.log('Course purchase already processed (concurrent idempotent)');
      return;
    }
    throw err;
  }

  if (isSuccess) {
    const accessExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.createCourseEnrollment(userId, courseId, purchase.id, accessExpiresAt);
  }

  await db.createAuditLog({
    actorUserId: userId,
    action: isSuccess ? 'course.purchase.completed' : 'course.purchase.failed',
    metaJson: JSON.stringify({
      orderId,
      planId,
      productId,
      courseId,
      amount: plan.price_minor,
    }),
  });
}

async function handleOneOffPurchase(params: HandleOneOffPurchaseParams) {
  const {
    orderId,
    userId,
    planId,
    productId,
    reportDate,
    isSuccess,
    fullOrder,
  } = params;

  const plan = await db.findPlanById(planId);
  if (!plan) {
    throw new Error('Plan not found');
  }

  // Check if purchase already exists
  const existing = await db.findOneOffPurchaseByOrderId(orderId);

  if (existing) {
    if (existing.status === 'PAID') {
      // Already marked PAID — nothing to do
      console.log('One-off purchase already PAID (idempotent)');
      return;
    }

    // Record exists as FAILED but this webhook indicates success — upgrade it
    if (isSuccess) {
      await db.updateOneOffPurchaseStatusByOrderId(orderId, 'PAID');
      await db.createAuditLog({
        actorUserId: userId,
        action: 'purchase.completed',
        metaJson: JSON.stringify({
          orderId,
          planId,
          productId,
          reportDate: reportDate.toISOString(),
          amount: plan.price_minor,
          note: 'Upgraded from FAILED to PAID on CAPTURED webhook',
        }),
      });
    }
    return;
  }

  try {
    await db.createOneOffPurchase({
      userId,
      productId,
      planId,
      reportDate,
      amountMinor: plan.price_minor,
      currency: plan.currency,
      status: isSuccess ? 'PAID' : 'FAILED',
      mpgsOrderId: orderId,
      mpgsTxnId: fullOrder.transaction?.[0]?.id,
    });
  } catch (err) {
    // Concurrent webhook delivery — another request already inserted this record.
    if ((err as { code?: string }).code === '23505') {
      console.log('One-off purchase already processed (concurrent idempotent)');
      return;
    }
    throw err;
  }

  await db.createAuditLog({
    actorUserId: userId,
    action: isSuccess ? 'purchase.completed' : 'purchase.failed',
    metaJson: JSON.stringify({
      orderId,
      planId,
      productId,
      reportDate: reportDate.toISOString(),
      amount: plan.price_minor,
    }),
  });
}

// Allow OPTIONS for CORS (if needed)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: 'POST, OPTIONS',
    },
  });
}
