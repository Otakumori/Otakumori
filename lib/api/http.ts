// DEPRECATED: This component is a duplicate. Use app\lib\http.ts instead.
import { type z } from 'zod';

type FetchOpts = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
  cache?: RequestCache;
};

export async function httpFetch<T>(
  url: string,
  schema: z.ZodType<T>,
  opts: FetchOpts = {},
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeoutMs = 12000,
    retries = 2,
    cache = 'no-store',
  } = opts;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeoutMs);

    try {
      const requestHeaders: Record<string, string> = body
        ? { 'content-type': 'application/json', ...headers }
        : { ...headers };

      const requestInit: RequestInit = {
        method,
        headers: requestHeaders,
        signal: ctrl.signal,
        cache: method === 'GET' ? cache : 'no-store',
      };

      if (body !== undefined) {
        requestInit.body = JSON.stringify(body);
      }

      const res = await fetch(url, requestInit);

      clearTimeout(id);

      if (!res.ok) {
        if ([429, 500, 502, 503, 504].includes(res.status) && attempt < retries) {
          await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
          continue;
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const parsed = schema.safeParse(json);

      if (!parsed.success) {
        console.error('Schema validation failed:', parsed.error);
        throw new Error('Schema validation failed');
      }

      return parsed.data;
    } catch (e: any) {
      clearTimeout(id);

      if (attempt === retries) {
        console.error(`HTTP fetch failed after ${retries + 1} attempts:`, e);
        throw e;
      }

      await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
    }
  }

  throw new Error('Unreachable');
}

// Convenience methods
export const http = {
  get: <T>(url: string, schema: z.ZodType<T>, opts?: Omit<FetchOpts, 'method'>) =>
    httpFetch(url, schema, { ...opts, method: 'GET' }),

  post: <T>(
    url: string,
    schema: z.ZodType<T>,
    body: unknown,
    opts?: Omit<FetchOpts, 'method' | 'body'>,
  ) => httpFetch(url, schema, { ...opts, method: 'POST', body }),

  put: <T>(
    url: string,
    schema: z.ZodType<T>,
    body: unknown,
    opts?: Omit<FetchOpts, 'method' | 'body'>,
  ) => httpFetch(url, schema, { ...opts, method: 'PUT', body }),

  patch: <T>(
    url: string,
    schema: z.ZodType<T>,
    body: unknown,
    opts?: Omit<FetchOpts, 'method' | 'body'>,
  ) => httpFetch(url, schema, { ...opts, method: 'PATCH', body }),

  delete: <T>(url: string, schema: z.ZodType<T>, opts?: Omit<FetchOpts, 'method'>) =>
    httpFetch(url, schema, { ...opts, method: 'DELETE' }),
};
