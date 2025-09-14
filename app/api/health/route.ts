import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import Stripe from "stripe";
import { limitApi } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Lightweight rate limit
  try {
    const requestIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || req.ip || 'anon';
    const key = `api:health:${requestIp}`;
    const res = await limitApi(key);
    if (res && !res.success) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }
  } catch {}
  const out: Record<string, any> = {
    db: "down",
    clerk: "unknown",
    stripe: "down",
    printify: "unknown",
    env: "ok",
  };

  // DB check (never throw)
  try {
    await prisma.$queryRaw`SELECT 1`;
    out.db = "up";
  } catch (e) {
    out.db = "down";
  }

  // Clerk check via proxy health if available
  try {
    const url = process.env.NEXT_PUBLIC_CLERK_PROXY_URL
      ? `${process.env.NEXT_PUBLIC_CLERK_PROXY_URL}/health`
      : undefined;
    if (url) {
      const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(1500) });
      out.clerk = res.ok ? "up" : "down";
    } else {
      out.clerk = "unknown";
    }
  } catch {
    out.clerk = "down";
  }

  // Stripe check – list 1 product (test mode ok)
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any });
      await stripe.products.list({ limit: 1 });
      out.stripe = "up";
    } else {
      out.stripe = "unknown";
    }
  } catch {
    out.stripe = "down";
  }

  // Printify check – list shops (mock ok in dev)
  try {
    const apiKey = process.env.PRINTIFY_API_KEY;
    if (apiKey) {
      const res = await fetch(`https://api.printify.com/v1/shops.json`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
        signal: AbortSignal.timeout(2000),
      });
      out.printify = res.ok ? "up" : "down";
    } else {
      // Dev-friendly: mark as mock if no creds
      out.printify = process.env.NODE_ENV === "development" ? "mock" : "unknown";
    }
  } catch {
    out.printify = "down";
  }

  // Basic env presence check (non-fatal)
  try {
    const required = [
      process.env.DATABASE_URL,
      process.env.CLERK_SECRET_KEY,
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      process.env.STRIPE_SECRET_KEY,
    ];
    out.env = required.every(Boolean) ? "ok" : "missing";
  } catch {
    out.env = "unknown";
  }

  out.buildHash = process.env.VERCEL_GIT_COMMIT_SHA || "dev";
  out.commit = out.buildHash?.slice(0, 7);
  out.nodeEnv = process.env.NODE_ENV || "development";
  out.region = process.env.VERCEL_REGION || "local";

  return NextResponse.json(out, { status: 200 });
}
