"use client";

import { SignedIn, SignedOut, UserButton, useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function UserMenu() {
  const { isSignedIn } = useUser();

  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-500">
            Sign in
          </button>
        </SignInButton>
        <Link href="/sign-up" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/10">
          Create account
        </Link>
      </SignedOut>

      <SignedIn>
        <Link href="/profile" className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white hover:bg-white/10">
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
