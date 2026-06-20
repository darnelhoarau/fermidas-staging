'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import * as db from '@/lib/db';

export async function cancelSubscription(subscriptionId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  const subscriptions = await db.findUserSubscriptions(session.user.id);
  const subscription = subscriptions.find(
    (s: { id: string; status: string }) =>
      s.id === subscriptionId && s.status === 'ACTIVE',
  );

  if (!subscription) {
    return { error: 'Subscription not found' };
  }

  await db.updateSubscription(subscriptionId, {
    status: 'CANCELED',
    canceledAt: new Date(),
  });

  await db.createAuditLog({
    actorUserId: session.user.id,
    action: 'subscription.canceled',
    metaJson: JSON.stringify({ subscriptionId }),
  });

  revalidatePath('/digital/account');
  return { success: true };
}
