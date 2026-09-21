const canonicalGamePresentations = {
  'bubble-ragdoll': {
    displayName: 'Bubble Ragdoll',
    cover: '/assets/games/covers/game-bubble-ragdoll-cover.webp',
    hub: '/assets/games/hub/game-bubble-ragdoll-hub.webp',
    hubContainsTitle: true,
  },
  'maid-cafe-manager': {
    displayName: 'Maid Café Manager',
    cover: '/assets/games/covers/game-maid-cafe-manager-cover.webp',
    hub: '/assets/games/hub/game-maid-cafe-manager-hub.webp',
    hubContainsTitle: true,
  },
  'dungeon-of-desire': {
    displayName: 'Dungeon of Desire',
    cover: '/assets/games/covers/game-dungeon-of-desire-cover.webp',
    hub: '/assets/games/hub/game-dungeon-of-desire-hub.webp',
    hubContainsTitle: true,
  },
  'thigh-colosseum': {
    displayName: 'Thigh Colosseum',
    cover: '/assets/games/covers/game-thigh-colosseum-cover.webp',
    hub: '/assets/games/hub/game-thigh-colosseum-hub.webp',
    hubContainsTitle: false,
  },
  'puzzle-reveal': {
    displayName: 'Puzzle Reveal',
    cover: '/assets/games/covers/game-puzzle-reveal-cover.webp',
    hub: '/assets/games/hub/game-puzzle-reveal-hub.webp',
    hubContainsTitle: true,
  },
} as const;

/** Maps current runtime identifiers to normalized presentation identities; it creates no routes. */
export const approvedGamePresentationAliases = {
  'bubble-girl': 'bubble-ragdoll',
  'thigh-coliseum': 'thigh-colosseum',
} as const;

export const approvedVisualAssets = {
  emptyStates: {
    cart: '/assets/ui/mori/empty-states/mori-empty-cart-kinchaku.webp',
    wishlist: '/assets/ui/mori/empty-states/mori-empty-wishlist.webp',
    messages: '/assets/ui/mori/empty-states/mori-empty-messages.webp',
    collection: '/assets/ui/mori/empty-states/mori-empty-collection.webp',
    search: '/assets/ui/mori/empty-states/mori-empty-search-results.webp',
  },
  destinations: {
    orders: '/assets/ui/mori/destinations/mori-destination-orders.webp',
    admin: '/assets/ui/mori/destinations/mori-destination-admin.webp',
    achievements: '/assets/ui/mori/destinations/mori-destination-achievements.webp',
    trade: '/assets/ui/mori/destinations/mori-destination-trade-center.webp',
    music: '/assets/ui/mori/destinations/mori-destination-music-player.webp',
  },
  avatar: {
    presentation: {
      stage: '/assets/avatar/creator/presentation/avatar-creator-stage-plinth.webp',
      backplate: '/assets/avatar/creator/presentation/avatar-creator-backplate-arch.webp',
      equipmentSlotFrame: '/assets/avatar/creator/presentation/avatar-creator-equipment-slot-frame.webp',
      cosmeticToken: '/assets/avatar/creator/presentation/avatar-creator-cosmetic-token.webp',
      groundingRing: '/assets/avatar/creator/presentation/avatar-creator-grounding-ring.webp',
      presetReliquary: '/assets/avatar/creator/presentation/avatar-creator-preset-reliquary.webp',
    },
    categories: {
      body: '/assets/avatar/creator/controls/avatar-category-body.webp',
      face: '/assets/avatar/creator/controls/avatar-category-face.webp',
      eyes: '/assets/avatar/creator/controls/avatar-category-eyes.webp',
      hair: '/assets/avatar/creator/controls/avatar-category-hair.webp',
      outfit: '/assets/avatar/creator/controls/avatar-category-outfit.webp',
      accessories: '/assets/avatar/creator/controls/avatar-category-accessories.webp',
      weaponProp: '/assets/avatar/creator/controls/avatar-category-weapon-prop.webp',
    },
    actions: {
      colorMaterial: '/assets/avatar/creator/controls/avatar-action-color-material.webp',
      presets: '/assets/avatar/creator/controls/avatar-action-presets.webp',
      randomize: '/assets/avatar/creator/controls/avatar-action-randomize.webp',
      reset: '/assets/avatar/creator/controls/avatar-action-undo-reset.webp',
      save: '/assets/avatar/creator/controls/avatar-action-save.webp',
      preview: '/assets/avatar/creator/controls/avatar-action-preview.webp',
    },
  },
  games: canonicalGamePresentations,
} as const;

export type ApprovedGameSlug = keyof typeof approvedVisualAssets.games;

export function getApprovedGamePresentation(slug: string) {
  const canonicalSlug =
    slug in approvedGamePresentationAliases
      ? approvedGamePresentationAliases[slug as keyof typeof approvedGamePresentationAliases]
      : slug;

  if (canonicalSlug in approvedVisualAssets.games) {
    return approvedVisualAssets.games[canonicalSlug as ApprovedGameSlug];
  }

  return undefined;
}
