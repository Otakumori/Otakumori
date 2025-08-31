/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { lazy } from 'react';

export const gamesRegistry = {
  samurai_petal_slice: lazy(() => import('./SamuraiPetalSlice')),
  anime_memory_match: lazy(() => import('./AnimeMemoryMatch')),
  bubble_pop_gacha: lazy(() => import('./BubblePopGacha')),
  rhythm_beat_em_up: lazy(() => import('./RhythmBeatEmUp')),
  waifu_trials: lazy(() => import('./WaifuTrials')),
  otaku_memo: lazy(() => import('./OtakuMemo')),
  petal_clicker: lazy(() => import('./PetalClicker')),
  shadow_path: lazy(() => import('./ShadowPath')),
} as const;
