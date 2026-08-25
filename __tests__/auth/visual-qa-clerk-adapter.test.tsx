import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  VISUAL_QA_AUTH_STATE_COOKIE,
  isVisualQaAuthEnabled,
  resolveVisualQaAuthStateFromCookieHeader,
  resolveVisualQaAuthState,
} from '@/app/lib/visual-qa/mode';
import {
  SignedIn,
  SignedOut,
  VisualQaAuthProvider,
  useAuth,
  useUser,
} from '@/app/lib/visual-qa/clerk-nextjs';
import { auth, currentUser } from '@/app/lib/visual-qa/clerk-server';

describe('visual QA Clerk adapter', () => {
  afterEach(() => {
    delete process.env.OTM_VISUAL_QA_AUTH;
    delete process.env.NEXT_PUBLIC_OTM_VISUAL_QA_AUTH;
    delete process.env.NEXT_PUBLIC_OTM_VISUAL_QA_AUTH_STATE;
    document.body.removeAttribute('data-visual-qa-auth');
    window.sessionStorage.clear();
    document.cookie = `${VISUAL_QA_AUTH_STATE_COOKIE}=; Max-Age=0; Path=/`;
    window.history.replaceState({}, '', '/');
  });

  it('cannot be enabled in Production or Vercel builds', () => {
    expect(
      isVisualQaAuthEnabled({
        OTM_VISUAL_QA_AUTH: '1',
        NODE_ENV: 'production',
      } as NodeJS.ProcessEnv),
    ).toBe(false);
    expect(
      isVisualQaAuthEnabled({
        OTM_VISUAL_QA_AUTH: '1',
        NODE_ENV: 'development',
        VERCEL: '1',
      } as NodeJS.ProcessEnv),
    ).toBe(false);
    expect(
      isVisualQaAuthEnabled({
        OTM_VISUAL_QA_AUTH: '1',
        NODE_ENV: 'development',
      } as NodeJS.ProcessEnv),
    ).toBe(true);
    expect(
      isVisualQaAuthEnabled({
        NEXT_PUBLIC_OTM_VISUAL_QA_AUTH: '1',
        NODE_ENV: 'development',
      } as NodeJS.ProcessEnv),
    ).toBe(true);
    expect(
      isVisualQaAuthEnabled(
        {
          OTM_VISUAL_QA_AUTH: '1',
          NODE_ENV: 'development',
        } as NodeJS.ProcessEnv,
        'www.otaku-mori.com',
      ),
    ).toBe(false);
    expect(
      isVisualQaAuthEnabled(
        {
          OTM_VISUAL_QA_AUTH: '1',
          NODE_ENV: 'development',
        } as NodeJS.ProcessEnv,
        '127.0.0.1:3102',
      ),
    ).toBe(true);
  });

  it('honors the local visual QA shell marker without enabling Production or Vercel', () => {
    document.body.setAttribute('data-visual-qa-auth', 'true');

    expect(isVisualQaAuthEnabled({ NODE_ENV: 'development' } as NodeJS.ProcessEnv)).toBe(true);
    expect(
      isVisualQaAuthEnabled({
        NODE_ENV: 'production',
      } as NodeJS.ProcessEnv),
    ).toBe(false);
    expect(
      isVisualQaAuthEnabled({
        NODE_ENV: 'development',
        VERCEL: '1',
      } as NodeJS.ProcessEnv),
    ).toBe(false);
    expect(
      isVisualQaAuthEnabled({ NODE_ENV: 'development' } as NodeJS.ProcessEnv, 'www.otaku-mori.com'),
    ).toBe(false);
  });

  it('defaults to signed-out state', () => {
    expect(resolveVisualQaAuthState({} as NodeJS.ProcessEnv)).toBe('signed-out');

    function Probe() {
      const authState = useAuth();
      const userState = useUser();
      return (
        <span>
          {authState.isSignedIn ? 'auth-signed-in' : 'auth-signed-out'}
          {' / '}
          {userState.user ? userState.user.id : 'no-user'}
        </span>
      );
    }

    render(
      <>
        <Probe />
        <SignedIn>signed in</SignedIn>
        <SignedOut>signed out</SignedOut>
      </>,
    );

    expect(screen.getByText('auth-signed-out / no-user')).toBeInTheDocument();
    expect(screen.queryByText('signed in')).not.toBeInTheDocument();
    expect(screen.getByText('signed out')).toBeInTheDocument();
  });

  it('returns deterministic non-secret signed-in identity when requested', async () => {
    process.env.NEXT_PUBLIC_OTM_VISUAL_QA_AUTH_STATE = 'signed-in';

    function Probe() {
      const authState = useAuth();
      const userState = useUser();
      return (
        <span>
          {authState.isLoaded ? 'loaded' : 'loading'}
          {' / '}
          {authState.isSignedIn ? authState.userId : 'signed-out'}
          {' / '}
          {userState.user?.username ?? 'no-user'}
        </span>
      );
    }

    render(<Probe />);

    expect(screen.getByText('loaded / visual_qa_owner / visual-owner')).toBeInTheDocument();
    await expect(auth()).resolves.toEqual(
      expect.objectContaining({
        userId: 'visual_qa_owner',
      }),
    );
    await expect(currentUser()).resolves.toEqual(
      expect.objectContaining({
        id: 'visual_qa_owner',
      }),
    );
  });

  it('allows browser QA to switch auth state by safe query string', () => {
    window.history.replaceState({}, '', '/?visualAuth=signed-in');
    expect(isVisualQaAuthEnabled()).toBe(true);
    expect(resolveVisualQaAuthState()).toBe('signed-in');
    expect(window.sessionStorage.getItem('otm-visual-qa-auth-state')).toBe('signed-in');
    expect(document.cookie).toContain(`${VISUAL_QA_AUTH_STATE_COOKIE}=signed-in`);

    window.history.replaceState({}, '', '/');
    expect(resolveVisualQaAuthState()).toBe('signed-in');

    window.history.replaceState({}, '', '/?visualAuth=signed-out');
    expect(resolveVisualQaAuthState()).toBe('signed-out');
  });

  it('parses signed-in state from the non-secret visual QA cookie', () => {
    expect(
      resolveVisualQaAuthStateFromCookieHeader(
        `theme=dark; ${VISUAL_QA_AUTH_STATE_COOKIE}=signed-in; other=value`,
      ),
    ).toBe('signed-in');
    expect(
      resolveVisualQaAuthStateFromCookieHeader(`${VISUAL_QA_AUTH_STATE_COOKIE}=invalid`),
    ).toBeNull();
  });

  it('uses a server-provided initial auth state during visual QA rendering', () => {
    function Probe() {
      const { isSignedIn, userId } = useAuth();
      return <span>{isSignedIn ? userId : 'signed-out'}</span>;
    }

    render(
      <VisualQaAuthProvider initialState="signed-in">
        <Probe />
        <SignedIn>server signed in</SignedIn>
        <SignedOut>server signed out</SignedOut>
      </VisualQaAuthProvider>,
    );

    expect(screen.getByText('visual_qa_owner')).toBeInTheDocument();
    expect(screen.getByText('server signed in')).toBeInTheDocument();
    expect(screen.queryByText('server signed out')).not.toBeInTheDocument();
  });
});
