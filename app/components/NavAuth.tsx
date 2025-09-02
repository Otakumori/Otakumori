"use client";

import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";

export default function NavAuth() {
  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton showName={false} />
      </SignedIn>
    </div>
  );
}
