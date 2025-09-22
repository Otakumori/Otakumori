import { env } from '@/env.mjs';

export const _FLAGS = {
  CUBE_HUB: env.NEXT_PUBLIC_FEATURE_CUBE_HUB === 'true',
  PETALS_ABOUT: env.NEXT_PUBLIC_FEATURE_PETALS_ABOUT !== 'false',
};
