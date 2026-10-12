import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SettingsPage from '@/app/settings/page';
import {
  AuthenticationRequiredError,
  LocalUserUnavailableError,
  requireLocalViewer,
} from '@/app/lib/auth/viewer';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';

vi.mock('server-only', () => ({}));

vi.mock('@/app/lib/auth/viewer', () => ({
  AuthenticationRequiredError: class AuthenticationRequiredError extends Error {},
  LocalUserUnavailableError: class LocalUserUnavailableError extends Error {},
  isMissingSchemaError: vi.fn((error: any) => error?.code === 'P2022'),
  requireLocalViewer: vi.fn(),
}));

vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn(),
}));

vi.mock('@/app/lib/db', () => ({
  db: {
    userProfile: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/app/lib/auth/serverAppOrigin', () => ({
  resolveServerAppOrigin: vi.fn().mockResolvedValue('https://www.otaku-mori.com'),
}));

vi.mock('@/app/lib/auth/accountUrls', () => ({
  buildCanonicalSignInUrl: vi.fn(
    (returnUrl: string) => `https://accounts.otaku-mori.com/sign-in?redirect_url=${returnUrl}`,
  ),
}));

vi.mock('@/app/settings/OneTapGamertagWrapper', () => ({
  default: ({ initial }: { initial?: string }) => <div>Gamertag controls for {initial}</div>,
}));

describe('Ritual settings route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the protected boundary and exposes a semantic locked state', async () => {
    vi.mocked(requireLocalViewer).mockRejectedValue(new AuthenticationRequiredError());

    const html = renderToStaticMarkup(await SettingsPage());

    expect(html).toContain('data-mori-archetype="ritual"');
    expect(html).toContain('data-mori-system-state="locked"');
    expect(html).toContain('Settings are locked');
    expect(html).toContain('https://accounts.otaku-mori.com/sign-in');
  });

  it('renders the persistent settings index and real identity controls', async () => {
    vi.mocked(requireLocalViewer).mockResolvedValue({ localUserId: 'local_user' } as any);
    vi.mocked(currentUser).mockResolvedValue({ publicMetadata: {} } as any);
    vi.mocked(db.userProfile.findUnique).mockResolvedValue({ gamertag: 'MoonArchive' } as any);

    const html = renderToStaticMarkup(await SettingsPage());

    expect(html).toContain('data-mori-archetype="ritual"');
    expect(html).toContain('aria-label="Settings sections"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('Gamertag controls for MoonArchive');
  });

  it('bounds local account failures without exposing implementation detail', async () => {
    vi.mocked(requireLocalViewer).mockRejectedValue(
      new LocalUserUnavailableError('sensitive provider detail'),
    );

    const html = renderToStaticMarkup(await SettingsPage());

    expect(html).toContain('data-mori-system-state="unavailable"');
    expect(html).toContain('Settings are temporarily unavailable');
    expect(html).not.toContain('sensitive provider detail');
  });
});
