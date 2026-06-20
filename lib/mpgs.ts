/**
 * Nouvobanq MPGS (Mastercard Payment Gateway Services) Integration
 * Supports: Hosted Checkout, Stored Credentials (CIT/MIT), Webhooks
 * Integration Guide: https://na-gateway.mastercard.com/api/documentation/integrationGuidelines/index.htm
 * API Documentation: https://na-gateway.mastercard.com/api/documentation/apiDocumentation/rest-json/version/latest/
 *
 * Integration Type: Hosted Checkout (full-page redirect - no PCI DSS certification required)
 * API Version: 57 - Checkout.js v57 requires REST API v57 for version consistency.
 * Versions 63+ use a different URL scheme and this bundle rejects them at runtime.
 */

import 'server-only';

import { z } from 'zod';
import { createHmac, timingSafeEqual } from 'crypto';

// Must match the Checkout.js version — v57 accepts returnUrl/cancelUrl in the POST body
// and Checkout.js v57 validates that the session was created with the same API version.
const MPGS_API_VERSION = process.env.MPGS_API_VERSION || '57';

// Environment validation
const mpgsEnvSchema = z.object({
  MPGS_MERCHANT_ID: z.string().min(1),
  MPGS_API_PASSWORD: z.string().min(1),
  MPGS_GATEWAY_URL: z.string().url(),
  MPGS_WEBHOOK_SECRET: z.string().min(1),
  MPGS_SUCCESS_URL: z.string().url(),
  MPGS_CANCEL_URL: z.string().url(),
});

function getMpgsConfig() {
  const config = mpgsEnvSchema.safeParse({
    MPGS_MERCHANT_ID: process.env.MPGS_MERCHANT_ID,
    MPGS_API_PASSWORD: process.env.MPGS_API_PASSWORD,
    MPGS_GATEWAY_URL: process.env.MPGS_GATEWAY_URL,
    MPGS_WEBHOOK_SECRET: process.env.MPGS_WEBHOOK_SECRET,
    MPGS_SUCCESS_URL: process.env.MPGS_SUCCESS_URL,
    MPGS_CANCEL_URL: process.env.MPGS_CANCEL_URL,
  });

  if (!config.success) {
    return null; // Return null when payment system is not configured
  }

  return config.data;
}

export function isPaymentEnabled(): boolean {
  return getMpgsConfig() !== null;
}

// Base64 encode credentials for Basic Auth
function getAuthHeader() {
  const config = getMpgsConfig();
  if (!config) {
    throw new Error('Payment system not configured');
  }
  const credentials = `merchant.${config.MPGS_MERCHANT_ID}:${config.MPGS_API_PASSWORD}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

export interface CreateCheckoutSessionParams {
  orderId: string;
  amount: number; // in minor units (e.g. 300000 for SCR 3,000.00)
  currency: string;
  description: string;
}

export interface CheckoutSession {
  sessionId: string;
  checkoutJsUrl: string;
}

/**
 * Create a Hosted Checkout session (API v57).
 * v57 accepts all order and interaction fields in a single POST, including
 * returnUrl and cancelUrl. The Checkout.js version must match the API version.
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams,
): Promise<CheckoutSession> {
  const config = getMpgsConfig();

  if (!config) {
    throw new Error(
      'Payment system not configured - Nouvobanq MPGS environment variables missing',
    );
  }

  try {
    const response = await fetch(
      `${config.MPGS_GATEWAY_URL}/api/rest/version/${MPGS_API_VERSION}/merchant/${config.MPGS_MERCHANT_ID}/session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify({
          apiOperation: 'CREATE_CHECKOUT_SESSION',
          interaction: {
            operation: 'PURCHASE',
            merchant: { name: 'Fermidas' },
            returnUrl: config.MPGS_SUCCESS_URL,
            cancelUrl: config.MPGS_CANCEL_URL,
          },
          order: {
            id: params.orderId,
            amount: (params.amount / 100).toFixed(2),
            currency: params.currency,
            description: params.description,
          },
        }),
        redirect: 'error',
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401) {
        const maskedId = config.MPGS_MERCHANT_ID.slice(0, 4) + '****';
        console.error(
          `MPGS 401 - Check credentials. Auth username used: merchant.${maskedId} — ` +
            `Ensure MPGS_MERCHANT_ID does NOT already contain "merchant." prefix, ` +
            `and MPGS_API_PASSWORD is from Admin > Integration Settings (not portal login password).`,
        );
      }
      console.error(
        'MPGS session creation failed:',
        response.status,
        errorText,
      );
      throw new Error(`MPGS API error: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      const rawBody = await response.text();
      console.error(
        `MPGS returned non-JSON response (${contentType}). Verify MPGS_GATEWAY_URL is correct. Body: ${rawBody.slice(0, 500)}`,
      );
      throw new Error(
        'MPGS API returned an unexpected response format. Check MPGS_GATEWAY_URL is the gateway host only.',
      );
    }

    const data = await response.json();

    if (!data.session?.id) {
      console.error(
        'MPGS session creation - no session ID returned:',
        JSON.stringify(data).slice(0, 500),
      );
      throw new Error(
        `MPGS session creation failed: ${data.result ?? 'no session returned'}`,
      );
    }

    return {
      sessionId: data.session.id,
      checkoutJsUrl: `${config.MPGS_GATEWAY_URL}/checkout/version/${MPGS_API_VERSION}/checkout.js`,
    };
  } catch (error) {
    console.error('Error creating MPGS checkout session:', error);
    throw error;
  }
}

export interface RecurringChargeParams {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  tokenId: string;
}

/**
 * Process a recurring charge (MIT - Merchant Initiated Transaction)
 * Used for subscription renewals
 */
export async function processRecurringCharge(
  params: RecurringChargeParams,
): Promise<{
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
}> {
  const config = getMpgsConfig();

  if (!config) {
    return {
      success: false,
      errorMessage: 'Payment system not configured',
    };
  }

  const chargeData = {
    apiOperation: 'PAY',
    order: {
      id: params.orderId,
      amount: (params.amount / 100).toFixed(2),
      currency: params.currency,
      description: params.description,
    },
    storedCredential: {
      type: 'RECURRING',
      initiator: 'MERCHANT',
    },
    sourceOfFunds: {
      type: 'CARD',
      provided: {
        card: {
          token: params.tokenId,
        },
      },
    },
  };

  try {
    // Process recurring charge using stored token (MIT - Merchant Initiated Transaction)
    // API Reference: https://na-gateway.mastercard.com/api/documentation/apiDocumentation/rest-json/version/latest/operation/Payment:%20%20Pay.html
    const response = await fetch(
      `${config.MPGS_GATEWAY_URL}/api/rest/version/${MPGS_API_VERSION}/merchant/${config.MPGS_MERCHANT_ID}/order/${params.orderId}/transaction/1`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify(chargeData),
      },
    );

    const data = await response.json();

    if (!response.ok || data.result !== 'SUCCESS') {
      return {
        success: false,
        errorMessage: data.error?.explanation || 'Payment failed',
      };
    }

    return {
      success: true,
      transactionId: data.transaction?.id,
    };
  } catch (error) {
    console.error('Error processing recurring charge:', error);
    return {
      success: false,
      errorMessage: 'Payment processing error',
    };
  }
}

/**
 * Retrieve order details from MPGS
 */
export async function retrieveOrder(orderId: string) {
  const config = getMpgsConfig();

  if (!config) {
    throw new Error('Payment system not configured');
  }

  try {
    // Retrieve order details
    // API Reference: https://na-gateway.mastercard.com/api/documentation/apiDocumentation/rest-json/version/latest/operation/Order:%20%20Retrieve.html
    const response = await fetch(
      `${config.MPGS_GATEWAY_URL}/api/rest/version/${MPGS_API_VERSION}/merchant/${config.MPGS_MERCHANT_ID}/order/${orderId}`,
      {
        method: 'GET',
        headers: {
          Authorization: getAuthHeader(),
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MPGS order retrieval failed:', response.status, errorText);
      throw new Error(`Failed to retrieve order: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      const rawBody = await response.text();
      console.error(
        `MPGS retrieve order returned non-JSON (${contentType}). Body: ${rawBody.slice(0, 500)}`,
      );
      throw new Error('MPGS API returned an unexpected response format.');
    }

    return await response.json();
  } catch (error) {
    console.error('Error retrieving order:', error);
    throw error;
  }
}

/**
 * Verify webhook signature
 * MPGS may send either:
 * - X-Notification-Secret: raw secret (constant-time compare)
 * - x-mpgs-signature: HMAC-SHA256(body, secret) in hex
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
): boolean {
  const config = getMpgsConfig();

  if (!config) {
    return false; // No payment system = no valid webhooks
  }

  const computedSignature = createHmac('sha256', config.MPGS_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  const a = Buffer.from(signature);
  const b = Buffer.from(computedSignature);

  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

/**
 * Verify webhook request using X-Notification-Secret (raw) or x-mpgs-signature (HMAC)
 */
export function verifyWebhookRequest(
  rawBody: string,
  secretHeader: string | null,
  signatureHeader: string | null,
): boolean {
  const config = getMpgsConfig();
  if (!config) return false;

  if (secretHeader && secretHeader.length > 0) {
    if (
      secretHeader.length === config.MPGS_WEBHOOK_SECRET.length &&
      timingSafeEqual(
        Buffer.from(secretHeader, 'utf8'),
        Buffer.from(config.MPGS_WEBHOOK_SECRET, 'utf8'),
      )
    ) {
      return true;
    }
  }
  if (signatureHeader && signatureHeader.length > 0) {
    return verifyWebhookSignature(rawBody, signatureHeader);
  }
  return false;
}

export { generateOrderId, toMinorUnits, fromMinorUnits } from './mpgs-utils';
