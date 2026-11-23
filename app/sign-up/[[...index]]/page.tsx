import { SignUp } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import {
  buildCanonicalSignUpUrl,
  resolveClerkRouting,
  safeReturnUrl,
} from '@/app/lib/auth/accountUrls';
import { resolveServerAppOrigin } from '@/app/lib/auth/serverAppOrigin';

type AuthRedirectPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignUpPage({ searchParams }: AuthRedirectPageProps) {
  const params = (await searchParams) ?? {};
  const returnUrl = firstParam(params.redirect_url) ?? firstParam(params.redirect) ?? '/';
  const appOrigin = await resolveServerAppOrigin();
  const routing = resolveClerkRouting(appOrigin);

  if (routing.mode === 'blocked') {
    return <main role="alert">Authentication is temporarily unavailable.</main>;
  }

  if (routing.mode === 'production-hosted') {
    redirect(buildCanonicalSignUpUrl(returnUrl, appOrigin));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-10">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl={safeReturnUrl(returnUrl, appOrigin)}
      />
    </main>
  );
}
