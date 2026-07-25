import { useAuth, useUser } from '@clerk/nextjs';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider, useAuthContext } from '@/app/contexts/AuthContext';

vi.mock('@/app/components/onboarding/OnboardingModal', () => ({
  OnboardingModal: () => <div data-testid="onboarding-modal" />,
}));

const mockedUseUser = vi.mocked(useUser);
const mockedUseAuth = vi.mocked(useAuth);

function Probe() {
  const auth = useAuthContext();
  return (
    <div>
      <span data-testid="status">{auth.status}</span>
      <span data-testid="loaded">{String(auth.isLoaded)}</span>
      <span data-testid="signed-in">{String(auth.isSignedIn)}</span>
      <span data-testid="loading">{String(auth.isLoading)}</span>
      <span data-testid="error">{auth.authError ?? ''}</span>
    </div>
  );
}

function renderProbe() {
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
}

describe('AuthContext Clerk session state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      isSignedIn: false,
      userId: null,
      signOut: vi.fn(async () => undefined),
    } as ReturnType<typeof useAuth>);
  });

  it('reports loading while Clerk is still resolving', () => {
    mockedUseUser.mockReturnValue({ user: null, isLoaded: false } as ReturnType<typeof useUser>);

    renderProbe();

    expect(screen.getByTestId('status')).toHaveTextContent('loading');
    expect(screen.getByTestId('loaded')).toHaveTextContent('false');
    expect(screen.getByTestId('signed-in')).toHaveTextContent('false');
  });

  it('reports signed-out only after Clerk loaded without a user', () => {
    mockedUseUser.mockReturnValue({ user: null, isLoaded: true } as ReturnType<typeof useUser>);

    renderProbe();

    expect(screen.getByTestId('status')).toHaveTextContent('signed-out');
    expect(screen.getByTestId('loaded')).toHaveTextContent('true');
    expect(screen.getByTestId('signed-in')).toHaveTextContent('false');
  });

  it('reports signed-in when Clerk loaded a user', () => {
    mockedUseUser.mockReturnValue({
      isLoaded: true,
      user: {
        id: 'user_123',
        publicMetadata: {},
        unsafeMetadata: {},
      },
    } as ReturnType<typeof useUser>);

    renderProbe();

    expect(screen.getByTestId('status')).toHaveTextContent('signed-in');
    expect(screen.getByTestId('loaded')).toHaveTextContent('true');
    expect(screen.getByTestId('signed-in')).toHaveTextContent('true');
  });

  it('does not collapse Clerk hook failures into a signed-out loaded state', () => {
    mockedUseUser.mockImplementation(() => {
      throw new Error('clerk hook unavailable');
    });

    renderProbe();

    expect(screen.getByTestId('status')).toHaveTextContent('unavailable');
    expect(screen.getByTestId('loaded')).toHaveTextContent('false');
    expect(screen.getByTestId('signed-in')).toHaveTextContent('false');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('Error');
  });
});
