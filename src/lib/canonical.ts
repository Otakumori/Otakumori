import { env } from '../../app/env';

export const appUrl = env.NEXT_PUBLIC_SITE_URL || env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function getCanonicalUrl(path: string = '') {
  const baseUrl = appUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

export function getAbsoluteUrl(path: string = '') {
  return getCanonicalUrl(path);
}


