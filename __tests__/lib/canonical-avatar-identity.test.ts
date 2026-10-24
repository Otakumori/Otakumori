import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  avatarConfigurationPartsToCreatorParts,
  creatorConfigToAvatarConfiguration,
  normalizeAvatarReadResponse,
} from '@/app/lib/avatar/canonical';
import { creatorAvatarFixture } from '../fixtures/creator-avatar';

describe('canonical avatar identity adapter', () => {
  it('keeps visible create and edit links on the canonical Creator route', () => {
    const root = process.cwd();
    const files = [
      'app/components/profile/AvatarDisplay.tsx',
      'app/components/profile/ProfileAvatarCard.tsx',
      'app/community/_components/AvatarCreatorTab.tsx',
      'app/mini-games/_shared/AvatarPresetChoice.tsx',
    ];

    for (const file of files) {
      const source = readFileSync(path.join(root, file), 'utf8');
      expect(source).toContain('/creator');
      expect(source).not.toContain('/character-editor');
    }
  });

  it('normalizes the canonical and historical read envelopes without semantic drift', () => {
    const config = creatorAvatarFixture();
    const canonical = normalizeAvatarReadResponse({ data: { config } });
    const avatarLegacy = normalizeAvatarReadResponse({ data: { avatarConfig: config } });
    const userLegacy = normalizeAvatarReadResponse({ data: { user: { avatarConfig: config } } });

    expect(canonical.config).toEqual(config);
    expect(avatarLegacy.config).toEqual(config);
    expect(userLegacy.config).toEqual(config);
    expect(canonical.avatarId).toBe(config.id);
  });

  it('gives Creator, Profile, and games equivalent renderer semantics', () => {
    const config = creatorAvatarFixture();
    const creator = creatorConfigToAvatarConfiguration(config);
    const profile = creatorConfigToAvatarConfiguration(config);
    const game = creatorConfigToAvatarConfiguration(config);

    expect(profile).toEqual(creator);
    expect(game).toEqual(creator);
    expect(game.parts).toMatchObject({ hair: 'medium_wolf_01', outerwear: 'commander_combat_01' });
    expect(avatarConfigurationPartsToCreatorParts(game.parts)).toMatchObject({
      Hair: 'medium_wolf_01',
      OuterWear: 'commander_combat_01',
    });
    expect(game.baseAssetId).toBe('female_base_v1');
    expect(game.animationSetId).toBe('humanoid_idle_v1');
  });

  it('never treats an adult-content preference as age verification', () => {
    const config = creatorAvatarFixture({
      nsfw: {
        enabled: true,
        features: { anatomyDetail: 1, arousalIndicators: true, interactionLevel: 'explicit' },
      },
      contentPolicy: { profile: 'adult-requested', version: '1' },
    });

    const renderer = creatorConfigToAvatarConfiguration(config);
    expect(renderer.ageVerified).toBe(false);
    expect(renderer.showNsfwContent).toBe(false);
    expect(renderer.contentRating).toBe('sfw');
  });
});
