import { NextResponse } from "next/server";
import { env } from "@/app/env";

export async function GET() {
  const checks = await Promise.allSettled([
    // Clerk health check
    fetch(`${env.NEXT_PUBLIC_CLERK_PROXY_URL}/health`, { 
      method: "GET",
      signal: AbortSignal.timeout(1500)
    }).then(res => ({ service: "clerk", status: res.ok ? "ok" : "degraded" })).catch(() => ({ service: "clerk", status: "down" })),
    
    // Printify health check
    fetch(`${env.PRINTIFY_API_URL}/shops/${env.PRINTIFY_SHOP_ID}/products.json`, {
      method: "HEAD",
      headers: { Authorization: `Bearer ${env.PRINTIFY_API_KEY}` },
      signal: AbortSignal.timeout(1500)
    }).then(res => ({ service: "printify", status: res.ok ? "ok" : "degraded" })).catch(() => ({ service: "printify", status: "down" })),
    
    // Stripe health check (if we have a test endpoint)
    fetch("https://api.stripe.com/v1/charges?limit=1", {
      method: "GET",
      headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
      signal: AbortSignal.timeout(1500)
    }).then(res => ({ service: "stripe", status: res.ok ? "ok" : "degraded" })).catch(() => ({ service: "stripe", status: "down" })),
  ]);

  const results = checks.map(result => 
    result.status === "fulfilled" ? result.value : { service: "unknown", status: "down" }
  );

  const overall = results.every(r => r.status === "ok") ? "ok" : 
                 results.some(r => r.status === "ok") ? "degraded" : "down";

  return NextResponse.json({
    status: overall,
    timestamp: new Date().toISOString(),
    services: results.reduce((acc, r) => ({ ...acc, [r.service]: r.status }), {}),
  });
}