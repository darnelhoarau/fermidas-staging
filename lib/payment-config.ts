/**
 * Payment system configuration
 * Determines if payment system is enabled based on environment variables
 */

/** User type for payment exemption checks (e.g. admin) */
export type UserWithRole = { id: string; role?: string } | null;

/**
 * Returns true if the user is exempt from payment (e.g. ADMIN role).
 * Exempt users have full access to paid content without subscription/purchase.
 */
export function isPaymentExempt(user: UserWithRole): boolean {
  return user?.role === 'ADMIN';
}

export function isPaymentEnabled(): boolean {
  return !!(
    process.env.MPGS_MERCHANT_ID &&
    process.env.MPGS_API_PASSWORD &&
    process.env.MPGS_WEBHOOK_SECRET &&
    process.env.MPGS_GATEWAY_URL &&
    process.env.MPGS_SUCCESS_URL &&
    process.env.MPGS_CANCEL_URL
  );
}

export function getPaymentMode(): 'enabled' | 'free' {
  return isPaymentEnabled() ? 'enabled' : 'free';
}

export function requiresPayment(): boolean {
  return isPaymentEnabled();
}

/**
 * Check if user has access to product (either via subscription/purchase OR free mode)
 */
export async function hasProductAccess(): Promise<boolean> {
  // If payment system is disabled, grant free access
  if (!isPaymentEnabled()) {
    return true;
  }

  // Otherwise check subscription/purchase (implement in calling code)
  return false;
}
