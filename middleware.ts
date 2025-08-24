import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANON = (process.env.NEXT_PUBLIC_CANONICAL_ORIGIN || "https://otaku-mori.com").replace(/\/$/, "");

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";

  // Only redirect preview hosts in production, not during deployment
  const isPreviewHost = host.endsWith(".vercel.app");
  const isProduction = process.env.NODE_ENV === "production";
  const isVercelPreview = process.env.VERCEL_ENV === "preview";
  
  // Don't redirect if we're in a Vercel preview environment
  if (isProduction && isPreviewHost && !isVercelPreview) {
    const canonical = new URL(url.pathname + url.search, CANON);
    return NextResponse.redirect(canonical, 308);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
