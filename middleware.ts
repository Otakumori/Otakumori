import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { env } from "@/server/env";

const isPublic = createRouteMatcher([
  "/",
  "/about",
  "/shop(.*)",
  "/blog(.*)",
  "/mini-games(.*)",
  "/games(.*)",
  "/community",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/images(.*)",
  "/overlay(.*)",
  "/public(.*)",
]);

const isDev = env.NODE_ENV !== "production";

export default clerkMiddleware(
  async (auth, req) => {
    const url = req.nextUrl.clone();
    const host = req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
    const isApi = url.pathname.startsWith("/api/");

    // Enforce canonical domain (exclude accounts subdomain)
    const isApex = host === "otaku-mori.com";
    const isAccounts = host.startsWith("accounts.");
    if (!isAccounts && isApex) {
      url.host = `www.otaku-mori.com`;
      return NextResponse.redirect(url, 308);
    }

    // Enforce HTTPS on primary domains
    const isPrimary = host.endsWith("otaku-mori.com");
    if (isPrimary && proto !== "https") {
      url.protocol = "https:";
      return NextResponse.redirect(url, 308);
    }

    // Protect non-public pages
    if (!isPublic(req)) await auth.protect();

    const res = NextResponse.next();

    // Correlation ID header
    const reqId =
      req.headers.get("x-request-id") ||
      req.headers.get("x-correlation-id") ||
      `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    res.headers.set("X-Request-ID", reqId);

    // Security headers
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    return res;
  },
  {
    contentSecurityPolicy: isDev
      ? {
          strict: false,
          directives: {
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:", "data:"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "img-src": ["*", "data:"],
            "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
            "connect-src": ["*"],
          },
        }
      : {
          strict: true,
          directives: {
            // Clerk handles script-src with nonce + strict-dynamic automatically
            "connect-src": [
              "'self'",
              "https://api.clerk.com",
              "https://clerk.otaku-mori.com",
              "https://accounts.otaku-mori.com",
              "https://clerk-telemetry.com",
              "https://*.clerk-telemetry.com",
              "https://api.stripe.com",
              // env.NEXT_PUBLIC_CLERK_PROXY_URL, // Optional
              "https://api.printify.com",
              "https://*.printify.com",
              "https://*.ingest.sentry.io",
              "https://o4509520271114240.ingest.us.sentry.io",
              "https://*.sentry.io",
              "https://sentry.io",
              "https://vitals.vercel-insights.com",
              "https://www.otaku-mori.com",
              "https://otaku-mori.com",
              "https://*.vercel-blob.com",
            ],
            "img-src": [
              "'self'",
              "data:",
              "https://*.printify.com",
              "https://images.printify.com",
              "https://*.cloudinary.com",
              "https://*.vercel-blob.com",
              "https:",
            ],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
            "frame-src": [
              "'self'",
              "https://*.clerk.com",
              "https://clerk.otaku-mori.com",
              "https://accounts.otaku-mori.com",
              "https://js.stripe.com",
              "https://checkout.stripe.com",
            ],
          },
        },
  }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
