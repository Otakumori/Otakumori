import { describe, expect, it } from 'vitest';
import {
  hasBetaAccess,
  isBetaCheckoutBlocked,
  isBetaCheckoutPage,
  isBetaPublicPath,
} from '@/app/lib/auth/betaAccess';

describe('closed beta access policy', () => {
  it('allows only server-issued beta claims or admins', () => {
    expect(hasBetaAccess({ public_metadata: { betaAccess: true } })).toBe(true);
    expect(hasBetaAccess({ metadata: { betaAccess: true } })).toBe(true);
    expect(hasBetaAccess({ metadata: { role: 'admin' } })).toBe(true);
    expect(hasBetaAccess({ public_metadata: { betaAccess: false } })).toBe(false);
    expect(hasBetaAccess({ unsafeMetadata: { betaAccess: true } })).toBe(false);
    expect(hasBetaAccess(null)).toBe(false);
  });

  it('keeps only invitation, auth, legal, health, and webhook routes public', () => {
    expect(isBetaPublicPath('/beta-access')).toBe(true);
    expect(isBetaPublicPath('/sign-in/callback')).toBe(true);
    expect(isBetaPublicPath('/privacy')).toBe(true);
    expect(isBetaPublicPath('/api/health/comprehensive')).toBe(true);
    expect(isBetaPublicPath('/api/webhooks/stripe')).toBe(true);
    expect(isBetaPublicPath('/api/v1/games/personal-best')).toBe(false);
    expect(isBetaPublicPath('/mini-games/petal-samurai')).toBe(false);
    expect(isBetaPublicPath('/shop')).toBe(false);
  });

  it('disables purchase mutations but preserves checkout recovery reads and webhooks', () => {
    expect(isBetaCheckoutBlocked('/api/v1/checkout/session', 'POST')).toBe(true);
    expect(isBetaCheckoutBlocked('/api/checkout/session', 'POST')).toBe(true);
    expect(isBetaCheckoutBlocked('/api/v1/checkout/order', 'GET')).toBe(false);
    expect(isBetaCheckoutBlocked('/api/v1/checkout/confirmation', 'GET')).toBe(false);
    expect(isBetaCheckoutBlocked('/api/webhooks/stripe', 'POST')).toBe(false);
    expect(isBetaCheckoutPage('/shop/checkout')).toBe(true);
    expect(isBetaCheckoutPage('/shop/checkout/success')).toBe(false);
  });
});
