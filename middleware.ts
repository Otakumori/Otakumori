import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
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
    if (req.nextUrl.pathname.startsWith("/api/")) return;
    if (!isPublic(req)) await auth.protect();
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
              // env.NEXT_PUBLIC_CLERK_PROXY_URL, // Optional
              "https://api.printify.com",
              "https://*.printify.com",
              "https://*.ingest.sentry.io",
              "https://o4509520271114240.ingest.us.sentry.io",
              "https://*.sentry.io",
              "https://sentry.io",
              "https://vitals.vercel-insights.com",
              "https://www.otaku-mori.com",
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
            "frame-src": ["'self'", "https://*.clerk.com"],
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
