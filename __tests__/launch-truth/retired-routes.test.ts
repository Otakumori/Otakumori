import { describe, expect, it } from 'vitest';
import { POST as legacyEquip } from '@/app/api/equip/route';
import { POST as legacyProfileEquip } from '@/app/api/profile/equip/route';
import { POST as legacyCoupon } from '@/app/api/checkout/coupons/route';
import { POST as newsletterSignup } from '@/app/api/newsletter/signup/route';
import { GET as legacyProfileGet, PUT as legacyProfilePut } from '@/app/api/user/profile/route';
import { GET as tradeList, POST as tradeCreate } from '@/app/api/trade/route';
import { POST as tradeOffer } from '@/app/api/trade/offer/route';

describe('launch truth compatibility routes', () => {
  it.each([
    ['equip', legacyEquip, 410],
    ['profile equip', legacyProfileEquip, 410],
    ['coupon', legacyCoupon, 410],
    ['profile read', legacyProfileGet, 410],
    ['profile write', legacyProfilePut, 410],
    ['trade list', tradeList, 503],
    ['trade create', tradeCreate, 503],
    ['trade offer', tradeOffer, 503],
  ])('%s cannot report false success', async (_name, handler, status) => {
    const response = await handler();
    const body = await response.json();

    expect(response.status).toBe(status);
    expect(body.ok).toBe(false);
  });

  it('does not claim a newsletter subscription without persistence', async () => {
    const response = await newsletterSignup();
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: 'NEWSLETTER_NOT_AVAILABLE',
    });
  });
});
