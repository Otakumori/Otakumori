import {
  VISUAL_QA_AUTH_STATE_HEADER,
  normalizeVisualQaAuthState,
  resolveVisualQaAuthState,
  resolveVisualQaAuthStateFromCookieHeader,
} from './mode';

const visualQaUser = {
  id: 'visual_qa_owner',
  username: 'visual-owner',
  firstName: 'Visual',
  lastName: 'Owner',
  fullName: 'Visual QA Owner',
  imageUrl: '',
  primaryEmailAddress: { emailAddress: 'visual-owner@example.invalid' },
  emailAddresses: [{ emailAddress: 'visual-owner@example.invalid' }],
  publicMetadata: { role: 'admin', username: 'visual-owner' },
  unsafeMetadata: {},
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

async function resolveServerVisualQaAuthState() {
  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    return (
      normalizeVisualQaAuthState(headersList.get(VISUAL_QA_AUTH_STATE_HEADER)) ??
      resolveVisualQaAuthStateFromCookieHeader(headersList.get('cookie')) ??
      resolveVisualQaAuthState()
    );
  } catch {
    return resolveVisualQaAuthState();
  }
}

async function isSignedIn() {
  return (await resolveServerVisualQaAuthState()) === 'signed-in';
}

export async function auth() {
  const signedIn = await isSignedIn();

  return {
    userId: signedIn ? visualQaUser.id : null,
    sessionId: signedIn ? 'visual_qa_session' : null,
    sessionClaims: signedIn ? { sub: visualQaUser.id } : null,
    getToken: async () => null,
  };
}

export async function currentUser() {
  return (await isSignedIn()) ? visualQaUser : null;
}

export function clerkClient() {
  return {};
}

export function createRouteMatcher(patterns: string[]) {
  return (req: { nextUrl?: { pathname?: string }; url?: string } | string) => {
    const pathname =
      typeof req === 'string'
        ? req
        : req.nextUrl?.pathname ?? (req.url ? new URL(req.url).pathname : '');

    return patterns.some((pattern) => {
      if (pattern.endsWith('(.*)')) {
        const prefix = pattern.slice(0, -4);
        return pathname === prefix || pathname.startsWith(`${prefix}/`);
      }

      return pathname === pattern;
    });
  };
}

export function clerkMiddleware(
  handler: (
    authFn: typeof auth,
    req: Parameters<ReturnType<typeof createRouteMatcher>>[0],
    event?: unknown,
  ) => unknown,
) {
  return (req: Parameters<ReturnType<typeof createRouteMatcher>>[0], event?: unknown) =>
    handler(auth, req, event);
}
