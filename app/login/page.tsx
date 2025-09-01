 
 
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function LoginPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        // User is already signed in, redirect to home
        router.push('/');
      } else {
        // User is not signed in, redirect to Clerk's sign-in
        window.location.href = '/sign-in';
      }
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while redirecting
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-gray-600">Please wait while we redirect you to the sign-in page.</p>
      </div>
    </main>
  );
}
