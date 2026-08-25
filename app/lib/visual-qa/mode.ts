export type VisualQaAuthState = 'signed-out' | 'signed-in';

export const VISUAL_QA_AUTH_STATE_COOKIE = 'otm_visual_qa_auth_state';
export const VISUAL_QA_AUTH_STATE_HEADER = 'x-otm-visual-qa-auth-state';

function getNodeEnv(): NodeJS.ProcessEnv {
  return globalThis.process?.env ?? {};
}

function getBrowserHost() {
  return typeof window !== 'undefined' ? window.location.hostname : undefined;
}

function hasBrowserVisualQaShellMarker() {
  return (
    typeof document !== 'undefined' &&
    document.body?.getAttribute('data-visual-qa-auth') === 'true'
  );
}

export function isVisualQaHostAllowed(host: string | null | undefined) {
  if (!host) return true;
  const normalized = host.split(':')[0]?.trim().toLowerCase();
  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '[::1]' ||
    normalized === '::1'
  );
}

export function isVisualQaAuthEnabled(
  env: NodeJS.ProcessEnv = getNodeEnv(),
  host: string | null | undefined = getBrowserHost(),
) {
  const nodeEnv = getNodeEnv();
  if (!isVisualQaHostAllowed(host)) return false;

  const enabled =
    env.OTM_VISUAL_QA_AUTH === '1' ||
    env.NEXT_PUBLIC_OTM_VISUAL_QA_AUTH === '1' ||
    nodeEnv.OTM_VISUAL_QA_AUTH === '1' ||
    nodeEnv.NEXT_PUBLIC_OTM_VISUAL_QA_AUTH === '1';
  const hasBrowserVisualAuthState =
    typeof window !== 'undefined' &&
    Boolean(
      normalizeVisualQaAuthState(new URLSearchParams(window.location.search).get('visualAuth')) ||
        readBrowserVisualQaAuthStateCookie() ||
        normalizeVisualQaAuthState(window.sessionStorage.getItem('otm-visual-qa-auth-state')),
    );
  const hasVisualQaShellMarker = hasBrowserVisualQaShellMarker();
  const nodeEnvName = env.NODE_ENV ?? nodeEnv.NODE_ENV;
  const vercel = env.VERCEL ?? nodeEnv.VERCEL;

  return (
    (enabled || hasBrowserVisualAuthState || hasVisualQaShellMarker) &&
    nodeEnvName !== 'production' &&
    vercel !== '1'
  );
}

export function normalizeVisualQaAuthState(
  value: string | null | undefined,
): VisualQaAuthState | null {
  return value === 'signed-in' || value === 'signed-out' ? value : null;
}

export function resolveVisualQaAuthStateFromCookieHeader(
  cookieHeader: string | null | undefined,
): VisualQaAuthState | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [rawName, ...rawValueParts] = cookie.trim().split('=');
    if (rawName !== VISUAL_QA_AUTH_STATE_COOKIE) continue;
    return normalizeVisualQaAuthState(decodeURIComponent(rawValueParts.join('=')));
  }
  return null;
}

function persistBrowserVisualQaAuthState(state: VisualQaAuthState) {
  window.sessionStorage.setItem('otm-visual-qa-auth-state', state);
  document.cookie = `${VISUAL_QA_AUTH_STATE_COOKIE}=${state}; Path=/; SameSite=Lax`;
}

function readBrowserVisualQaAuthStateCookie() {
  return resolveVisualQaAuthStateFromCookieHeader(document.cookie);
}

export function resolveVisualQaAuthState(env: NodeJS.ProcessEnv = getNodeEnv()): VisualQaAuthState {
  if (typeof window !== 'undefined') {
    const queryState = normalizeVisualQaAuthState(
      new URLSearchParams(window.location.search).get('visualAuth'),
    );
    if (queryState) {
      persistBrowserVisualQaAuthState(queryState);
      return queryState;
    }

    const cookieState = readBrowserVisualQaAuthStateCookie();
    if (cookieState) return cookieState;

    const storedState = normalizeVisualQaAuthState(
      window.sessionStorage.getItem('otm-visual-qa-auth-state'),
    );
    if (storedState) return storedState;
  }

  return normalizeVisualQaAuthState(env.NEXT_PUBLIC_OTM_VISUAL_QA_AUTH_STATE) ?? 'signed-out';
}
