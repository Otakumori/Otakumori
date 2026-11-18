export const PETAL_SAMURAI_ASSETS = {
  arena: {
    id: 'petal_samurai_moonlit_shrine_arena_v1',
    desktop:
      '/assets/games/petal-samurai/environment/petal-samurai-moonlit-shrine-arena-v1-desktop.webp',
    mobile:
      '/assets/games/petal-samurai/environment/petal-samurai-moonlit-shrine-arena-v1-mobile.webp',
  },
  result: {
    id: 'petal_samurai_slice_result_scene_candidate_v1',
    path: '/assets/games/petal-samurai/result/petal-samurai-slice-result-scene-candidate-v1.webp',
  },
  vfx: {
    light: '/assets/games/petal-samurai/vfx/petal-samurai-slash-light-v1.webp',
    heavy: '/assets/games/petal-samurai/vfx/petal-samurai-slash-heavy-v1.webp',
    cross: '/assets/games/petal-samurai/vfx/petal-samurai-slash-cross-v1.webp',
    vertical: '/assets/games/petal-samurai/vfx/petal-samurai-slash-vertical-v1.webp',
    comboRing: '/assets/games/petal-samurai/vfx/petal-samurai-slash-combo-ring-v1.webp',
    perfectBloom: '/assets/games/petal-samurai/vfx/petal-samurai-slash-perfect-bloom-v1.webp',
  },
} as const;

export type PetalSamuraiVfx = keyof typeof PETAL_SAMURAI_ASSETS.vfx;
