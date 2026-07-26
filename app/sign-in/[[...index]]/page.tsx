import { redirect } from 'next/navigation';

import { buildCanonicalSignInUrl } from '@/app/lib/auth/accountUrls';
import { resolveServerAppOrigin } from '@/app/lib/auth/serverAppOrigin';

type AuthRedirectPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignInPage({ searchParams }: AuthRedirectPageProps) {
  const params = (await searchParams) ?? {};
  const returnUrl = firstParam(params.redirect_url) ?? firstParam(params.redirect) ?? '/';

  redirect(buildCanonicalSignInUrl(returnUrl, await resolveServerAppOrigin()));
}
