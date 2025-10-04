import { getRuntimeOrigin } from '../../lib/runtimeOrigin';

export const appUrl = getRuntimeOrigin();

export function getCanonicalUrl(path: string = '') {
  const baseUrl = appUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

export function getAbsoluteUrl(path: string = '') {
  return getCanonicalUrl(path);
}
