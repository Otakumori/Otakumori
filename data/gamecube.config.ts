import { GameCubeConfig } from "@/types/gamecube";

const config: GameCubeConfig = {
  faces: [
    {
      slot: 4,
      key: "top-trade",
      type: "trade",
      label: "Trade Center",
      slug: "trade",
      enabled: true,
      faceTooltip: "Shop • Trading Hub"
    },
    {
      slot: 3,
      key: "left-games",
      type: "games",
      label: "Mini-Games",
      slug: "mini-games",
      enabled: true,
      faceTooltip: "Seasonal • Arcade"
    },
    {
      slot: 1,
      key: "right-community",
      type: "community",
      label: "Avatar / Community Hub",
      slug: "community",
      enabled: true,
      faceTooltip: "Avatars • Social"
    },
    {
      slot: 2,
      key: "down-music",
      type: "music",
      label: "Music / Extras",
      slug: "music",
      enabled: true,
      faceTooltip: "OST • Bonus"
    },
    {
      slot: 0,
      key: "front-about",
      type: "about",
      label: "About",
      slug: "about",
      enabled: true
    },
  ],
  games: [
    {
      slug: "samurai-petal-slice",
      title: "Samurai Petal Slice",
      componentKey: "samurai_petal_slice",
      shortPrompt: "Draw the Tetsusaiga's arc…",
      enabled: true
    },
    {
      slug: "anime-memory-match",
      title: "Anime Memory Match",
      componentKey: "anime_memory_match",
      shortPrompt: "Recall the faces bound by fate.",
      enabled: true
    },
    {
      slug: "bubble-pop-gacha",
      title: "Bubble-Pop Gacha",
      componentKey: "bubble_pop_gacha",
      shortPrompt: "Pop for spy-craft secrets…",
      enabled: true
    },
    {
      slug: "rhythm-beat-em-up",
      title: "Rhythm Beat-Em-Up",
      componentKey: "rhythm_beat_em_up",
      shortPrompt: "Sync to the Moon Prism's pulse.",
      enabled: true
    },
  ],
};

export default config;
