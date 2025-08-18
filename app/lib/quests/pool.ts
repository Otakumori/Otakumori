// Quest definitions - easily editable without code deploy
export type QuestDef = {
  key: string; 
  title: string; 
  description: string;
  kind: "browse"|"review"|"minigame"|"purchase";
  target: number; 
  basePetals: number; 
  bonusPetals: number;
};

export const QUEST_POOL: QuestDef[] = [
  { 
    key: "view-3-products", 
    title: "Scout the Bazaar", 
    description: "View 3 product pages to discover new treasures.",
    kind: "browse", 
    target: 3, 
    basePetals: 20, 
    bonusPetals: 10 
  },
  { 
    key: "add-1-review", 
    title: "Leave a Rune", 
    description: "Write & submit 1 product review (image optional).",
    kind: "review", 
    target: 1, 
    basePetals: 30, 
    bonusPetals: 15 
  },
  { 
    key: "roll-gacha", 
    title: "Try Your Fate", 
    description: "Spin the Lucky Draw once to test your fortune.",
    kind: "minigame", 
    target: 1, 
    basePetals: 15, 
    bonusPetals: 10 
  },
  { 
    key: "complete-purchase", 
    title: "Seal a Pact", 
    description: "Complete 1 order to strengthen your arsenal.",
    kind: "purchase", 
    target: 1, 
    basePetals: 50, 
    bonusPetals: 20 
  },
  { 
    key: "visit-checkout", 
    title: "Approach the Gate", 
    description: "Visit the checkout page to see the path ahead.",
    kind: "browse", 
    target: 1, 
    basePetals: 10, 
    bonusPetals: 5 
  },
  { 
    key: "browse-collections", 
    title: "Explore the Archives", 
    description: "Browse 2 different product collections or categories.",
    kind: "browse", 
    target: 2, 
    basePetals: 25, 
    bonusPetals: 12 
  }
];
