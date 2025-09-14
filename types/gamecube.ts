export type FaceKey = 'top-trade' | 'left-games' | 'right-community' | 'down-music' | 'front-about';
export type FaceType = 'trade' | 'games' | 'community' | 'music' | 'about';

export type GameKey =
  | 'samurai_petal_slice'
  | 'anime_memory_match'
  | 'bubble_pop_gacha'
  | 'rhythm_beat_em_up'
  | 'waifu_trials'
  | 'otaku_memo'
  | 'petal_clicker'
  | 'shadow_path';

export interface CubeFace {
  slot: 0 | 1 | 2 | 3 | 4 | 5;
  key: FaceKey;
  type: FaceType;
  label: string;
  slug: string;              // 'trade' | 'mini-games' | 'community' | 'music' | 'about'
  enabled: boolean;
  faceTooltip?: string;
}

export interface MiniGameMeta {
  slug: string;
  title: string;
  componentKey: GameKey;
  shortPrompt: string;
  enabled: boolean;
  sortOrder?: number;
}

export interface GameCubeConfig {
  faces: CubeFace[];
  games: MiniGameMeta[];     // rendered inside Left face panel
}
