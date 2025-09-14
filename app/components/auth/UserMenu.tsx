"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function UserMenu() {
  const { isSignedIn } = useUser();
  const [redirectParam, setRedirectParam] = useState<string>("");

  useEffect(() => {
    try {
      const href = window.location.pathname + window.location.search;
      setRedirectParam(`redirect_url=${encodeURIComponent(href)}`);
    } catch {}
  }, []);

  const signInUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in";
    return redirectParam ? `${base}${base.includes("?") ? "&" : "?"}${redirectParam}` : base;
  }, [redirectParam]);

  const signUpUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up";
    return redirectParam ? `${base}${base.includes("?") ? "&" : "?"}${redirectParam}` : base;
  }, [redirectParam]);

  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <a
          href={signInUrl}
          className="rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-500"
        >
          Sign in
        </a>
        <a
          href={signUpUrl}
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/10"
        >
          Create account
        </a>
      </SignedOut>

      <SignedIn>
        <Link
          href="/profile"
          className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white hover:bg-white/10"
        >
          Profile
        </Link>
        <UserButton
          appearance={{ variables: { colorPrimary: "#db2777" } }}
          afterSignOutUrl="/"
        />
      </SignedIn>
    </div>
  );
}
