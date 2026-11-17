import { pathToFileURL } from 'node:url';

export const CLERK_BINDING_EXPECTATIONS = Object.freeze({
  instanceId: 'ins_2x3IPWufjRP2tOvQNm5YjuHXa8c',
  environmentType: 'development',
  frontendHost: 'pet-skylark-83.clerk.accounts.dev',
  gitBranch: 'codex/unified-public-launch-readiness',
});

const FAILURE_PREFIX = 'CLERK_BINDING_FAILED:';

export function isIntendedPreviewBuild(env) {
  return (
    env.VERCEL === '1' &&
    env.VERCEL_ENV === 'preview' &&
    env.VERCEL_GIT_COMMIT_REF === CLERK_BINDING_EXPECTATIONS.gitBranch
  );
}

export function decodeClerkFrontendHost(publishableKey) {
  if (typeof publishableKey !== 'string' || !publishableKey.startsWith('pk_test_')) {
    return null;
  }

  const encodedHost = publishableKey.slice('pk_test_'.length);
  if (!encodedHost) return null;

  try {
    const normalized = encodedHost.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = Buffer.from(normalized, 'base64').toString('utf8');
    const host = decoded.endsWith('$') ? decoded.slice(0, -1) : decoded;

    if (!host || !/^[a-z0-9.-]+$/i.test(host)) return null;
    return host;
  } catch {
    return null;
  }
}

function fail(code, writeError) {
  writeError(`${FAILURE_PREFIX}${code}`);
  return 1;
}

export async function verifyClerkPreviewBinding({
  env = process.env,
  fetchImpl = globalThis.fetch,
  writeOutput = (message) => console.log(message),
  writeError = (message) => console.error(message),
  timeoutMs = 10_000,
} = {}) {
  // Vercel also runs this command for Production. Outside the single intended
  // Preview branch, this diagnostic must remain inert and must not contact Clerk.
  if (!isIntendedPreviewBuild(env)) return 0;

  const secretKey = env.CLERK_SECRET_KEY;
  const publishableKey = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!secretKey || !publishableKey) return fail('CONFIG_MISSING', writeError);

  const frontendHost = decodeClerkFrontendHost(publishableKey);
  if (frontendHost !== CLERK_BINDING_EXPECTATIONS.frontendHost) {
    return fail('FRONTEND_MISMATCH', writeError);
  }

  if (typeof fetchImpl !== 'function') return fail('REQUEST_UNAVAILABLE', writeError);

  let response;
  try {
    response = await fetchImpl('https://api.clerk.com/v1/instance', {
      method: 'GET',
      redirect: 'error',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${secretKey}`,
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return fail('REQUEST_FAILED', writeError);
  }

  if (!response?.ok) {
    if (response?.status === 401 || response?.status === 403) {
      return fail('UNAUTHORIZED', writeError);
    }
    return fail('HTTP_RESPONSE', writeError);
  }

  let instance;
  try {
    instance = await response.json();
  } catch {
    return fail('MALFORMED_RESPONSE', writeError);
  }

  if (!instance || typeof instance !== 'object' || Array.isArray(instance)) {
    return fail('MALFORMED_RESPONSE', writeError);
  }

  // The raw Backend API response is snake_case. Clerk's SDK maps this field to
  // the camelCase `environmentType` property on its Backend Instance type.
  if (instance.id !== CLERK_BINDING_EXPECTATIONS.instanceId) {
    return fail('INSTANCE_MISMATCH', writeError);
  }
  if (instance.environment_type !== CLERK_BINDING_EXPECTATIONS.environmentType) {
    return fail('ENVIRONMENT_MISMATCH', writeError);
  }

  writeOutput('CLERK_BINDING=VERIFIED');
  return 0;
}

const entryHref = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (entryHref && import.meta.url === entryHref) {
  process.exitCode = await verifyClerkPreviewBinding();
}
