import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import { retrieveOrder } from '@/lib/mpgs';

function redirectTo(url: string, request: NextRequest) {
  return NextResponse.redirect(new URL(url, request.url));
}

export async function GET(request: NextRequest) {
  if (!(await db.isFeatureEnabled('confirm'))) {
    return redirectTo('/digital/training', request);
  }

  const { searchParams } = new URL(request.url);
  const result = searchParams.get('result');
  const orderId = searchParams.get('order.id');

  if (result !== 'success' || !orderId) {
    return redirectTo('/digital/training', request);
  }

  try {
    const context = await db.findCheckoutContext(orderId);

    if (!context?.userId || !context?.planId || !context?.productId || !context?.interval) {
      console.warn('Confirm: no checkout context found for order', orderId);
      return redirectTo('/digital/training', request);
    }

    const { userId, planId, courseId } = context;

    const fullOrder = await retrieveOrder(orderId);

    const isSuccess =
      fullOrder.status === 'CAPTURED' ||
      fullOrder.status === 'AUTHORIZED' ||
      fullOrder.transaction?.[0]?.result === 'SUCCESS';

    if (!isSuccess) {
      return redirectTo('/digital/training', request);
    }

    if (context.interval === 'ONE_OFF' && courseId) {
      const existing = await db.findOneOffPurchaseByOrderId(orderId);

      if (!existing) {
        const plan = await db.findPlanById(planId);
        if (!plan) {
          return redirectTo('/digital/training', request);
        }

        try {
          const purchase = await db.createOneOffPurchase({
            userId,
            productId: context.productId,
            planId,
            reportDate: context.reportDate ? new Date(context.reportDate) : null,
            courseId,
            amountMinor: plan.price_minor,
            currency: plan.currency,
            status: 'PAID',
            mpgsOrderId: orderId,
            mpgsTxnId: fullOrder.transaction?.[0]?.id,
          });

          const accessExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          await db.createCourseEnrollment(userId, courseId, purchase.id, accessExpiresAt);
        } catch (err) {
          const code = (err as { code?: string }).code;
          if (code === '23505') {
            // concurrent insert — enrolment was created by another request
          } else if (code === '42703') {
            console.error('Confirm: missing column in course_enrollments — run /api/admin/setup');
          } else {
            console.error('Confirm: purchase creation failed:', err);
          }
        }
      } else {
        const purchaseId = existing.status === 'PAID' ? existing.id : (
          (await db.updateOneOffPurchaseStatusByOrderId(orderId, 'PAID'), existing.id)
        ) as string;
        const accessExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await db.createCourseEnrollment(userId, courseId, purchaseId, accessExpiresAt);
      }
    }

    return redirectTo('/digital/training', request);
  } catch (error) {
    console.error('Confirm payment error:', error);
    return redirectTo('/digital/training', request);
  }
}

export async function POST(request: NextRequest) {
  if (!(await db.isFeatureEnabled('confirm'))) {
    return NextResponse.json({ error: 'Payment confirmation is disabled' }, { status: 403 });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId: bodyOrderId } = await request.json().catch(() => ({}));
  let orderId = bodyOrderId;

  try {
    if (!orderId) {
      const latest = await db.findLatestCheckoutForUser(session.user.id);
      if (!latest?.orderId) {
        return NextResponse.json(
          { error: 'No pending checkout found. Payment may have been processed already.' },
          { status: 404 },
        );
      }
      orderId = latest.orderId;
    }

    const context = await db.findCheckoutContext(orderId);
    if (!context) {
      return NextResponse.json({ error: 'Checkout context not found' }, { status: 404 });
    }

    if (context.userId !== session.user.id) {
      return NextResponse.json({ error: 'Checkout does not belong to current user' }, { status: 403 });
    }

    const fullOrder = await retrieveOrder(orderId);
    const isSuccess =
      fullOrder.status === 'CAPTURED' ||
      fullOrder.status === 'AUTHORIZED' ||
      fullOrder.transaction?.[0]?.result === 'SUCCESS';

    if (!isSuccess) {
      return NextResponse.json({ error: 'Payment was not successful' }, { status: 400 });
    }

    if (context.interval === 'ONE_OFF' && context.courseId) {
      const existing = await db.findOneOffPurchaseByOrderId(orderId);
      let purchaseId: string;

      if (existing) {
        purchaseId = existing.id;
        if (existing.status !== 'PAID') {
          await db.updateOneOffPurchaseStatusByOrderId(orderId, 'PAID');
        }
      } else {
        const plan = await db.findPlanById(context.planId);
        if (!plan) {
          return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }
        const purchase = await db.createOneOffPurchase({
          userId: session.user.id,
          productId: context.productId,
          planId: context.planId,
          courseId: context.courseId,
          amountMinor: plan.price_minor,
          currency: plan.currency,
          status: 'PAID',
          mpgsOrderId: orderId,
          mpgsTxnId: fullOrder.transaction?.[0]?.id,
        });
        purchaseId = purchase.id;
      }

      const accessExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await db.createCourseEnrollment(session.user.id, context.courseId, purchaseId, accessExpiresAt);
    } else {
      return NextResponse.json({ error: 'Only course purchases are supported' }, { status: 400 });
    }

    // Read configured redirect URL from settings
    const redirectSetting = await db.getSetting('payment_success_url');
    let redirectUrl = '/digital/account';
    if (redirectSetting?.value_json) {
      try {
        const parsed = JSON.parse(redirectSetting.value_json);
        if (typeof parsed === 'string' && parsed) {
          redirectUrl = parsed;
        }
      } catch { /* ignore invalid JSON */ }
    }

    return NextResponse.json({ success: true, redirectUrl });
  } catch (error) {
    console.error('Confirm payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
