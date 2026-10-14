import type { AvatarConfig } from '@/app/lib/avatar/schema';
import type { AvatarProfile } from '@om/avatar-engine/types/avatar';

export type ActiveGameAvatar = {
  avatarId: string | null;
  displayName: string | null;
  config: AvatarConfig;
  model3dUrl: string | null;
  spritesheetUrl: string | null;
  version: number;
};

export function toGameAvatarProfile(avatar: ActiveGameAvatar): AvatarProfile | null {
  if (!avatar.avatarId) return null;

  const profile: AvatarProfile = {
    id: avatar.avatarId,
    head: 'head_default',
    torso: 'torso_default',
    legs: 'legs_default',
    colorPalette: { ...avatar.config.colors },
  };

  const accessory = avatar.config.accessories[0];
  return accessory ? { ...profile, accessory } : profile;
}
