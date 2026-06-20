/**
 * Cron job: Renew subscriptions via recurring MIT charges
 * Runs: Daily at 00:00 UTC
 * Checks for subscriptions expiring today and processes renewal
 */

import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { processRecurringCharge, generateOrderId } from '@/lib/mpgs';

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('CRON_SECRET not set, allowing request');
    return true;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscriptions that need renewal
    const subscriptions = await db.findSubscriptionsDueForRenewal();

    console.log(`Found ${subscriptions.length} subscriptions to renew`);

    const results = {
      total: subscriptions.length,
      succeeded: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const subscription of subscriptions) {
      try {
        const orderId = generateOrderId('RENEWAL');

        // Process MIT charge
        const chargeResult = await processRecurringCharge({
          orderId,
          amount: subscription.price_minor,
          currency: subscription.currency,
          description: `${subscription.product_name} - Monthly Renewal`,
          tokenId: subscription.mpgs_token_ref!,
        });

        if (chargeResult.success) {
          // Extend subscription period
          const newPeriodStart = new Date(subscription.current_period_end);
          const newPeriodEnd = new Date(newPeriodStart);
          newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

          await db.updateSubscription(subscription.id, {
            currentPeriodStart: newPeriodStart,
            currentPeriodEnd: newPeriodEnd,
            status: 'ACTIVE',
          });

          // Log success
          await db.createAuditLog({
            actorUserId: subscription.user_id,
            action: 'subscription.renewed',
            metaJson: JSON.stringify({
              subscriptionId: subscription.id,
              orderId,
              amount: subscription.price_minor,
              newPeriodEnd: newPeriodEnd.toISOString(),
            }),
          });

          results.succeeded++;
          console.log(
            `Renewed subscription ${subscription.id} for user ${subscription.email}`,
          );
        } else {
          // Payment failed - mark as past_due
          await db.updateSubscription(subscription.id, {
            status: 'PAST_DUE',
          });

          // Log failure
          await db.createAuditLog({
            actorUserId: subscription.user_id,
            action: 'subscription.renewal_failed',
            metaJson: JSON.stringify({
              subscriptionId: subscription.id,
              orderId,
              error: chargeResult.errorMessage,
            }),
          });

          results.failed++;
          results.errors.push(
            `Failed for ${subscription.email}: ${chargeResult.errorMessage}`,
          );
          console.error(
            `Renewal failed for subscription ${subscription.id}: ${chargeResult.errorMessage}`,
          );

          // TODO: Send email notification to user about failed payment
        }
      } catch (error) {
        console.error(`Error renewing subscription ${subscription.id}:`, error);
        results.failed++;
        results.errors.push(
          `Error for ${subscription.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Log completion
    await db.createAuditLog({
      action: 'cron.renew_subscriptions',
      metaJson: JSON.stringify(results),
    });

    return NextResponse.json({
      message: 'Subscription renewals processed',
      ...results,
    });
  } catch (error) {
    console.error('Cron job error:', error);

    await db.createAuditLog({
      action: 'cron.error',
      metaJson: JSON.stringify({
        job: 'renew-subscriptions',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Vercel Cron Jobs invoke via GET — delegate to POST which handles auth
export async function GET(request: NextRequest) {
  return POST(request);
}
