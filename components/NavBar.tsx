'use client';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export function NavBar() {
  return (
    <nav className="flex items-center justify-between bg-gray-900 px-4 py-3 text-white">
      <div className="flex gap-4">
        <Link href="/" className="transition-colors hover:text-pink-400">
          Home
        </Link>
        <Link href="/shop" className="transition-colors hover:text-pink-400">
          Shop
        </Link>
        <Link href="/mini-games" className="transition-colors hover:text-pink-400">
          Mini-Games
        </Link>
        <Link href="/blog" className="transition-colors hover:text-pink-400">
          Blog
        </Link>
        <Link href="/about" className="transition-colors hover:text-pink-400">
          About
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton>
            <button className="rounded-md bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton appearance={{ elements: { avatarBox: 'rounded-full' } }} />
        </SignedIn>
        <Link href="/cart" aria-label="Cart" className="transition-colors hover:text-pink-400">
          <span id="cart-icon" className="text-xl">
            🛒
          </span>
        </Link>
      </div>
    </nav>
  );
}
