export type Quest = {
  id: string;
  title: string;
  description: string;
  kind: "petal_collect" | "shop_visit" | "game_play";
  target: number; // e.g., collect N petals
  reward: number; // petals
};

export const DAILY_QUESTS: Quest[] = [
  { id: "daily_petal_10", title: "Gather Petals", description: "Collect 10 petals today.", kind: "petal_collect", target: 10, reward: 30 },
  { id: "daily_shop_1", title: "Scout the Market", description: "Visit the shop once.", kind: "shop_visit", target: 1, reward: 10 },
  { id: "daily_game_1", title: "Warm Up", description: "Play any mini-game once.", kind: "game_play", target: 1, reward: 20 },
];
