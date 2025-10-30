// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { env } from '@/env';
import { prisma } from '@/app/lib/prisma';
import { getPrintifyService } from '@/app/lib/printify/service';
import Stripe from 'stripe';

export const runtime = 'nodejs';

function ms(start: number) {
  return Math.round(performance.now() - start);
}

export async function GET() {
  const started = performance.now();
  const checks: Record<string, { ok: boolean; ms: number; error?: string }> = {};

  // Env validation (server only)
  const envStart = performance.now();
  try {
    // Accessing env will throw at import time if invalid; here we just touch keys
    const needed = [
      env.DATABASE_URL,
      env.STRIPE_SECRET_KEY,
      env.CLERK_SECRET_KEY,
      env.PRINTIFY_API_KEY,
      env.PRINTIFY_SHOP_ID,
      env.UPSTASH_REDIS_REST_URL,
      env.UPSTASH_REDIS_REST_TOKEN,
    ];
    if (needed.some((x) => !x)) throw new Error('missing envs');
    checks.env = { ok: true, ms: ms(envStart) };
  } catch (e: any) {
    checks.env = { ok: false, ms: ms(envStart), error: e?.message };
  }

  // Prisma / DB
  const dbStart = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.prisma = { ok: true, ms: ms(dbStart) };
  } catch (e: any) {
    checks.prisma = { ok: false, ms: ms(dbStart), error: e?.message };
  }

  // Stripe
  const stripeStart = performance.now();
  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    });
    await stripe.prices.list({ limit: 1 });
    checks.stripe = { ok: true, ms: ms(stripeStart) };
  } catch (e: any) {
    checks.stripe = { ok: false, ms: ms(stripeStart), error: e?.message };
  }

  // Printify
  const printifyStart = performance.now();
  try {
    const svc = getPrintifyService();
    const ok = await svc.testConnection();
    if (!ok.success) throw new Error(ok.error || 'printify test failed');
    checks.printify = { ok: true, ms: ms(printifyStart) };
  } catch (e: any) {
    checks.printify = { ok: false, ms: ms(printifyStart), error: e?.message };
  }

  // Redis (ioredis)
  const redisStart = performance.now();
  try {
    const { redis } = await import('@/lib/redis');
    await redis.get('otakumori_healthcheck');
    checks.redis = { ok: true, ms: ms(redisStart) };
  } catch (e: any) {
    checks.redis = { ok: false, ms: ms(redisStart), error: e?.message };
  }

  return NextResponse.json({
    ok: Object.values(checks).every((c) => c.ok),
    took: ms(started),
    checks,
  });
}
