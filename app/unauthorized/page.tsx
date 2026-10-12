'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { RitualStatePage } from '@/app/components/system/RitualStatePage';

export default function UnauthorizedPage() {
  const { isSignedIn } = useUser();

  return (
    <RitualStatePage
      description="You do not have permission to access this area. Your account and current session have not been changed."
      eyebrow="Access boundary"
      state="locked"
      title="Access denied"
      action={
        !isSignedIn ? (
            <Link
              href="/sign-in"
              className="mori-button-primary"
            >
              Sign In
            </Link>
          ) : (
            <Link
              href="/"
              className="mori-button-secondary"
            >
              Return Home
            </Link>
          )
      }
    />
  );
}
