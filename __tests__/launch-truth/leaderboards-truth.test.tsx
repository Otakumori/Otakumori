import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LeaderboardsTab } from '@/app/community/_components/LeaderboardsTab';

vi.mock('@clerk/nextjs', () => ({ useUser: () => ({ user: null }) }));
vi.mock('@/app/lib/logger', () => ({
  logger: { warn: vi.fn(), error: vi.fn() },
}));

function response(data: unknown, ok = true) {
  return Promise.resolve({ ok, json: () => Promise.resolve(data) } as Response);
}

describe('public leaderboard truth', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('shows an honest empty state when persisted boards are empty', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      response({ ok: true, data: { leaderboard: [] } }),
    );

    render(<LeaderboardsTab />);

    expect(await screen.findByText('Leaderboards are warming up...')).toBeInTheDocument();
    expect(screen.getByText('No game leaderboards available yet')).toBeInTheDocument();
  });

  it('renders exact records returned by the persisted API', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input);
      if (url.includes('/petal-samurai')) {
        return response({
          ok: true,
          data: {
            leaderboard: [
              {
                rank: 1,
                userId: 'u1',
                displayName: 'PersistedPlayer',
                score: 4321,
                category: 'score',
              },
            ],
          },
        });
      }
      return response({ ok: true, data: { leaderboard: [] } });
    });

    render(<LeaderboardsTab />);

    expect(await screen.findByText('PersistedPlayer')).toBeInTheDocument();
    expect(screen.getByText('4,321')).toBeInTheDocument();
    expect(screen.queryByText('PetalMaster')).not.toBeInTheDocument();
  });

  it('shows an error and retries when no leaderboard source is available', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => response({}, false));

    render(<LeaderboardsTab />);

    expect(await screen.findByText('Failed to load leaderboards')).toBeInTheDocument();
    const firstAttemptCalls = fetchMock.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(firstAttemptCalls));
  });
});
