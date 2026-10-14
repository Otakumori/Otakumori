import { describe, expect, it } from 'vitest';

import { toGameAvatarProfile } from '@/app/mini-games/_shared/game-avatar-bridge';

const activeAvatar = {
  avatarId: 'avatar_config_123',
  displayName: 'Wanderer',
  config: {
    body: { type: 'default', height: 1, weight: 1, proportions: {} },
    hair: { style: 'default', length: 0.5, color: { primary: '#3d2817' } },
    outfit: { type: 'casual', color: { primary: '#666666' } },
    accessories: ['archive-seal'],
    colors: {
      skin: '#ffdbac',
      hair: '#3d2817',
      eyes: '#4a5568',
      outfit: '#666666',
      accent: '#ab6366',
    },
    nsfwEnabled: false,
    version: 1,
  },
  model3dUrl: null,
  spritesheetUrl: null,
  version: 1,
};

describe('game avatar read bridge', () => {
  it('maps the authenticated safe read model into the existing game profile contract', () => {
    expect(toGameAvatarProfile(activeAvatar)).toEqual({
      id: 'avatar_config_123',
      head: 'head_default',
      torso: 'torso_default',
      legs: 'legs_default',
      accessory: 'archive-seal',
      colorPalette: activeAvatar.config.colors,
    });
  });

  it('keeps the fallback read-only when no active avatar exists', () => {
    expect(toGameAvatarProfile({ ...activeAvatar, avatarId: null })).toBeNull();
  });
});
