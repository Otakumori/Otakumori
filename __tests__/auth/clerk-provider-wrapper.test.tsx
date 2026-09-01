import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ClerkProviderWrapper from '@/app/providers/ClerkProviderWrapper';

const clerkProviderSpy = vi.fn();

vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: (props: any) => {
    clerkProviderSpy(props);
    return <div data-testid="clerk-provider">{props.children}</div>;
  },
}));

describe('ClerkProviderWrapper homepage auth origin continuity', () => {
  beforeEach(() => {
    clerkProviderSpy.mockClear();
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_homepage_origin_parity';
    process.env.NEXT_PUBLIC_CLERK_DOMAIN = 'accounts.otaku-mori.com';
    process.env.NEXT_PUBLIC_CLERK_PROXY_URL = 'https://accounts.otaku-mori.com';
    delete process.env.OTM_VISUAL_QA_AUTH;
    delete process.env.NEXT_PUBLIC_OTM_VISUAL_QA_AUTH;
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_CLERK_DOMAIN;
    delete process.env.NEXT_PUBLIC_CLERK_PROXY_URL;
    delete process.env.OTM_VISUAL_QA_AUTH;
    delete process.env.NEXT_PUBLIC_OTM_VISUAL_QA_AUTH;
  });

  it('uses same-origin auth shims for local development hosts', () => {
    render(
      <ClerkProviderWrapper requestHost="localhost:3102">
        <span>home</span>
      </ClerkProviderWrapper>,
    );

    expect(screen.getByTestId('clerk-provider')).toHaveTextContent('home');
    expect(clerkProviderSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        signInUrl: '/sign-in',
        signUpUrl: '/sign-up',
      }),
    );
    expect(clerkProviderSpy.mock.calls.at(-1)?.[0]).not.toEqual(
      expect.objectContaining({
        signInUrl: 'https://accounts.otaku-mori.com/sign-in',
      }),
    );
  });

  it('uses same-origin auth shims for Vercel Preview hosts', () => {
    render(
      <ClerkProviderWrapper requestHost="otaku-mori-git-branch-otaku-mori-babe.vercel.app">
        <span>preview</span>
      </ClerkProviderWrapper>,
    );

    expect(clerkProviderSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        signInUrl: '/sign-in',
        signUpUrl: '/sign-up',
      }),
    );
  });

  it('uses the production Account Portal only on production hosts', () => {
    render(
      <ClerkProviderWrapper requestHost="www.otaku-mori.com">
        <span>production</span>
      </ClerkProviderWrapper>,
    );

    expect(clerkProviderSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        signInUrl: 'https://accounts.otaku-mori.com/sign-in',
        signUpUrl: 'https://accounts.otaku-mori.com/sign-up',
        domain: 'accounts.otaku-mori.com',
        proxyUrl: 'https://accounts.otaku-mori.com',
      }),
    );
  });

  it('can bypass Clerk only for the explicit local visual QA harness', () => {
    process.env.OTM_VISUAL_QA_AUTH = '1';
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    render(
      <ClerkProviderWrapper requestHost="localhost:3102">
        <span>visual qa</span>
      </ClerkProviderWrapper>,
    );

    expect(screen.getByText('visual qa')).toBeInTheDocument();
    expect(screen.queryByTestId('clerk-provider')).not.toBeInTheDocument();
    expect(clerkProviderSpy).not.toHaveBeenCalled();
  });

  it('can use the public visual QA marker after Next local bundling', () => {
    process.env.NEXT_PUBLIC_OTM_VISUAL_QA_AUTH = '1';
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    render(
      <ClerkProviderWrapper requestHost="localhost:3102">
        <span>public visual qa</span>
      </ClerkProviderWrapper>,
    );

    expect(screen.getByText('public visual qa')).toBeInTheDocument();
    expect(screen.queryByTestId('clerk-provider')).not.toBeInTheDocument();
    expect(clerkProviderSpy).not.toHaveBeenCalled();
  });
});
