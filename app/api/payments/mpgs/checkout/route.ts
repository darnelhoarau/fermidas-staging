import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';
import {
  createCheckoutSession,
  generateOrderId,
  isPaymentEnabled,
} from '@/lib/mpgs';

const checkoutSchema = z.object({
  planId: z.string().min(1),
  reportDate: z.string().optional(), // ISO date string for one-off purchases
  courseId: z.string().min(1).optional(),
  termsAccepted: z.boolean(),
  termsVersion: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Check if payment system is enabled
    if (!isPaymentEnabled()) {
      return NextResponse.json(
        {
          error: 'Payment system not configured. Product is free for testing.',
        },
        { status: 400 },
      );
    }

    // Require authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = checkoutSchema.parse(body);

    if (!validatedData.termsAccepted) {
      return NextResponse.json(
        { error: 'Terms must be accepted' },
        { status: 400 },
      );
    }

    // Get plan details
    const plan = await db.findPlanById(validatedData.planId);

    if (!plan || !plan.is_active) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Generate unique order ID
    const orderId = generateOrderId('FERM');

    // Get client IP for terms acceptance
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    let checkoutCourseId: string | undefined;
    let checkoutReportDate: string | undefined;

    // For one-off purchases, validate either reportDate or courseId
    if (plan.interval === 'ONE_OFF') {
      const planCourseId = plan.course_id as string | null | undefined;

      if (planCourseId || validatedData.courseId) {
        checkoutCourseId = validatedData.courseId || planCourseId || undefined;

        if (
          !checkoutCourseId ||
          (planCourseId && planCourseId !== checkoutCourseId)
        ) {
          return NextResponse.json(
            { error: 'Invalid course purchase plan' },
            { status: 400 },
          );
        }

        const course = await db.findCourseById(checkoutCourseId);
        if (
          !course ||
          !course.is_published ||
          course.plan_id !== plan.id ||
          !plan.is_active
        ) {
          return NextResponse.json(
            { error: 'Course is not available for purchase' },
            { status: 400 },
          );
        }

        const [existingPurchase, existingEnrollment, existingSubscription] =
          await Promise.all([
            db.findCoursePurchase(session.user.id, checkoutCourseId),
            db.findCourseEnrollment(session.user.id, checkoutCourseId),
            db.findActiveSubscription(session.user.id, plan.product_id),
          ]);

        if (existingPurchase || existingEnrollment || existingSubscription) {
          return NextResponse.json(
            { error: 'You already have access to this course' },
            { status: 400 },
          );
        }
      } else {
        if (!validatedData.reportDate) {
          return NextResponse.json(
            { error: 'Report date required for one-off purchase' },
            { status: 400 },
          );
        }

        checkoutReportDate = validatedData.reportDate;

        // Check if user already owns this report
        const existing = await db.findOneOffPurchase(
          session.user.id,
          plan.product_id,
          new Date(checkoutReportDate),
        );

        if (existing) {
          return NextResponse.json(
            { error: 'You already own this report' },
            { status: 400 },
          );
        }
      }
    }

    // For subscriptions, check if user already has active subscription
    if (plan.interval === 'MONTH') {
      const existingSubscription = await db.findActiveSubscription(
        session.user.id,
        plan.product_id,
      );

      if (existingSubscription) {
        return NextResponse.json(
          { error: 'You already have an active subscription' },
          { status: 400 },
        );
      }
    }

    // Store full checkout context in audit log BEFORE creating MPGS session.
    // MPGS metadata is not used - the webhook retrieves context via findCheckoutContext(orderId).
    await db.createAuditLog({
      actorUserId: session.user.id,
      action: 'checkout.initiated',
      metaJson: JSON.stringify({
        orderId,
        userId: session.user.id,
        planId: plan.id,
        productId: plan.product_id,
        interval: plan.interval,
        amount: plan.price_minor,
        currency: plan.currency,
        ...(checkoutReportDate && {
          reportDate: checkoutReportDate,
        }),
        ...(checkoutCourseId && {
          courseId: checkoutCourseId,
        }),
        termsVersion: validatedData.termsVersion,
        termsIp: ip,
        termsAcceptedAt: new Date().toISOString(),
      }),
    });

    // Create checkout session with MPGS
    const checkoutSession = await createCheckoutSession({
      orderId,
      amount: plan.price_minor,
      currency: plan.currency,
      description: `${plan.product_name} - ${plan.name}`,
    });

    return NextResponse.json({
      sessionId: checkoutSession.sessionId,
      checkoutJsUrl: checkoutSession.checkoutJsUrl,
    });
  } catch (error) {
    console.error('Checkout error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
