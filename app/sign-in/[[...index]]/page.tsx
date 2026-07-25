import { redirect } from 'next/navigation';

import { FALLBACK_APP_ORIGIN, buildCanonicalSignInUrl } from '@/app/lib/auth/accountUrls';

type AuthRedirectPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({ searchParams }: AuthRedirectPageProps) {
  const params = (await searchParams) ?? {};
  const returnUrl = firstParam(params.redirect_url) ?? firstParam(params.redirect) ?? '/';

  redirect(buildCanonicalSignInUrl(returnUrl, FALLBACK_APP_ORIGIN));
}
