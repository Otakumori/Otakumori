import { env } from '@/env';
import type { Result } from './types';
import { safeAsync } from './types';
import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  images?: string[];
  active: boolean;
  default_price?: string;
  created: number;
  updated: number;
}

export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number | null;
  currency: string;
  active: boolean;
  type: 'one_time' | 'recurring';
  created: number;
}

export async function getStripeProducts(): Promise<Result<StripeProduct[]>> {
  return safeAsync(
    async () => {
      const products = await stripe.products.list({
        active: true,
        limit: 100,
      });

      return products.data.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description || undefined,
        images: product.images || [],
        active: product.active,
        default_price: product.default_price as string | undefined,
        created: product.created,
        updated: product.updated,
      }));
    },
    'STRIPE_FETCH_ERROR',
    'Failed to fetch products from Stripe',
  );
}

export async function getStripeProduct(productId: string): Promise<Result<StripeProduct>> {
  return safeAsync(
    async () => {
      const product = await stripe.products.retrieve(productId);

      return {
        id: product.id,
        name: product.name,
        description: product.description || undefined,
        images: product.images || [],
        active: product.active,
        default_price: product.default_price as string | undefined,
        created: product.created,
        updated: product.updated,
      };
    },
    'STRIPE_FETCH_ERROR',
    `Failed to fetch product ${productId} from Stripe`,
  );
}

export async function getStripePrice(priceId: string): Promise<Result<StripePrice>> {
  return safeAsync(
    async () => {
      const price = await stripe.prices.retrieve(priceId);

      return {
        id: price.id,
        product: price.product as string,
        unit_amount: price.unit_amount,
        currency: price.currency,
        active: price.active,
        type: price.type,
        created: price.created,
      };
    },
    'STRIPE_FETCH_ERROR',
    `Failed to fetch price ${priceId} from Stripe`,
  );
}

export async function checkStripeHealth(): Promise<Result<boolean>> {
  return safeAsync(
    async () => {
      // Check Stripe status page instead of making API calls
      const response = await fetch('https://status.stripe.com/current', {
        cache: 'no-store',
      });

      return response.ok;
    },
    'STRIPE_HEALTH_CHECK_ERROR',
    'Failed to check Stripe service health',
  );
}

export async function createStripeCheckoutSession(
  lineItems: Array<{
    price: string;
    quantity: number;
  }>,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>,
): Promise<Result<{ url: string }>> {
  return safeAsync(
    async () => {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: metadata || {},
      });

      if (!session.url) {
        throw new Error('Failed to create checkout session URL');
      }

      return { url: session.url };
    },
    'STRIPE_CHECKOUT_ERROR',
    'Failed to create Stripe checkout session',
  );
}
