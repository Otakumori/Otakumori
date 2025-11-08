import Stripe from 'stripe';
import { env } from '@/env/server';

// Remove hardcoded apiVersion to stay compatible with Dashboard preview versions
export const stripe = new Stripe((env as any).STRIPE_SECRET_KEY!);
export type StripeEvent = Stripe.Event;

