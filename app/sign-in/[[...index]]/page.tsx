'use client';

import { SignIn } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { paths } from '@/lib/paths';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || paths.home();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-6">
        <SignIn
          routing="path"
          path={paths.signIn()}
          signUpUrl={paths.signUp()}
          fallbackRedirectUrl={redirectUrl}
        />
      </div>
    </div>
  );
}
