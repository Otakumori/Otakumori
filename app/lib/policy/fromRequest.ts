import { resolvePolicy } from '@om/avatar';

type PolicySource = 'client' | 'server';

export interface ContentPolicy {
  nsfwAllowed: boolean;
  adultVerified: boolean;
  cookieValue: string | null;
  region: string | null;
  source: PolicySource;
}

const NSFW_COOKIE = 'nsfw-preference';
const LEGACY_COOKIE = 'om_age_ok';

const DEFAULT_POLICY: ContentPolicy = {
  nsfwAllowed: false,
  adultVerified: false,
  cookieValue: null,
  region: null,
  source: 'server',
};

function readCookie(cookieString: string | null | undefined, name: string): string | null {
  if (!cookieString) return null;
  const value = cookieString
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!value) return null;
  try {
    return decodeURIComponent(value.split('=').slice(1).join('='));
  } catch {
    return null;
  }
}

function computePolicy(
  source: PolicySource,
  cookieValue: string | null,
  adultVerified: boolean,
  region: string | null,
): ContentPolicy {
  const overrideEnabled =
    typeof process !== 'undefined' && process.env?.NSFW_GLOBAL === 'enabled';

  if (overrideEnabled) {
    return {
      nsfwAllowed: true,
      adultVerified,
      cookieValue,
      region,
      source,
    };
  }

  const context: { adultVerified: boolean; cookieValue?: string } = {
    adultVerified,
  };
  if (cookieValue !== null && cookieValue !== undefined) {
    context.cookieValue = cookieValue;
  }

  const result = resolvePolicy(context);

  return {
    nsfwAllowed: result.nsfwAllowed,
    adultVerified,
    cookieValue,
    region,
    source,
  };
}

export function getPolicyFromRequest(
  request: Request,
  options: { adultVerified?: boolean; region?: string | null } = {},
): ContentPolicy {
  if (!request) {
    return { ...DEFAULT_POLICY };
  }

  const cookieHeader = request.headers.get('cookie');
  const cookieValue =
    readCookie(cookieHeader, NSFW_COOKIE) ?? readCookie(cookieHeader, LEGACY_COOKIE);
  const region =
    options.region ??
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('cf-ipcountry') ??
    null;

  return computePolicy('server', cookieValue, options.adultVerified === true, region);
}

export function getPolicyFromHeaders(
  headers: Headers,
  options: { adultVerified?: boolean; region?: string | null } = {},
): ContentPolicy {
  const cookieHeader = headers.get('cookie');
  const cookieValue =
    readCookie(cookieHeader, NSFW_COOKIE) ?? readCookie(cookieHeader, LEGACY_COOKIE);
  const region =
    options.region ??
    headers.get('x-vercel-ip-country') ??
    headers.get('cf-ipcountry') ??
    null;

  return computePolicy('server', cookieValue, options.adultVerified === true, region);
}

export function getPolicyFromClient(): ContentPolicy {
  if (typeof document === 'undefined') {
    return { ...DEFAULT_POLICY, source: 'client' };
  }

  const cookieString = document.cookie;
  const cookieValue =
    readCookie(cookieString, NSFW_COOKIE) ?? readCookie(cookieString, LEGACY_COOKIE);

  let adultVerified = false;
  try {
    adultVerified =
      window.localStorage?.getItem('adult-verified') === 'true' ||
      window.localStorage?.getItem('nsfw-adult-verified') === 'true';
  } catch {
    adultVerified = false;
  }

  const locale =
    typeof navigator !== 'undefined' && navigator.language
      ? navigator.language.split('-')[1]?.toUpperCase() ?? null
      : null;

  return computePolicy('client', cookieValue, adultVerified, locale);
}
