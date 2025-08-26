/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export function NavBar() {
  return (
    <nav className="flex items-center justify-between bg-otm-ink/95 backdrop-blur-sm border-b border-otm-pink/20 px-4 py-3 text-white shadow-otm-glow">
      <div className="flex gap-4">
        <Link href="/" className="transition-colors hover:text-otm-pink font-medium">
          Home
        </Link>
        <Link href="/shop" className="transition-colors hover:text-otm-pink font-medium">
          Shop
        </Link>
        <Link href="/mini-games" className="transition-colors hover:text-otm-pink font-medium">
          Mini-Games
        </Link>
        <Link href="/blog" className="transition-colors hover:text-otm-pink font-medium">
          Blog
        </Link>
        <Link href="/about" className="transition-colors hover:text-otm-pink font-medium">
          About
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton>
            <button className="rounded-md bg-otm-pink hover:bg-otm-pink-dark px-4 py-2 text-white transition-all duration-200 shadow-otm-glow hover:shadow-otm-glow-strong">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton appearance={{ elements: { avatarBox: 'rounded-full' } }} />
        </SignedIn>
        <Link href="/cart" aria-label="Cart" className="transition-colors hover:text-otm-pink">
          <span id="cart-icon" className="text-xl">
            🛒
          </span>
        </Link>
      </div>
    </nav>
  );
}
