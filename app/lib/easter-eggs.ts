/**
 * Easter Egg System
 *
 * Hidden interactions and secrets that reward exploration
 */

export type EasterEggTrigger = 'click_sequence' | 'keyboard' | 'scroll' | 'time' | 'url';

export interface EasterEgg {
  id: string;
  trigger: EasterEggTrigger;
  pattern: string | number[];
  reward: 'achievement' | 'unlock' | 'message' | 'feature';
  message: string;
  oneTimeOnly: boolean;
  enabled: boolean;
}

/**
 * Easter Egg Registry
 */
export const EASTER_EGGS: EasterEgg[] = [
  {
    id: 'konami_code',
    trigger: 'keyboard',
    pattern:
      'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,KeyB,KeyA',
    reward: 'feature',
    message: 'Developer mode unlocked!',
    oneTimeOnly: false,
    enabled: true,
  },
  {
    id: 'logo_clicks',
    trigger: 'click_sequence',
    pattern: [10], // 10 clicks
    reward: 'message',
    message: 'Thanks for exploring! Check the console for developer credits.',
    oneTimeOnly: true,
    enabled: true,
  },
  {
    id: 'petal_pattern',
    trigger: 'click_sequence',
    pattern: [3, 1, 4, 1, 5], // Pi sequence
    reward: 'unlock',
    message: 'Hidden game unlocked!',
    oneTimeOnly: true,
    enabled: true,
  },
  {
    id: 'midnight_visit',
    trigger: 'time',
    pattern: '23:11', // 11:11 PM
    reward: 'message',
    message: 'The petals glow brighter at midnight...',
    oneTimeOnly: false,
    enabled: true,
  },
];

/**
 * Track discovered easter eggs (stored in localStorage)
 */
export function markEasterEggDiscovered(eggId: string): void {
  if (typeof window === 'undefined') return;

  const discovered = getDiscoveredEasterEggs();
  discovered.add(eggId);
  localStorage.setItem('otm-easter-eggs', JSON.stringify(Array.from(discovered)));
}

/**
 * Get list of discovered easter eggs
 */
export function getDiscoveredEasterEggs(): Set<string> {
  if (typeof window === 'undefined') return new Set();

  try {
    const stored = localStorage.getItem('otm-easter-eggs');
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (error) {
    console.warn('Failed to read discovered easter eggs:', error);
  }

  return new Set();
}

/**
 * Check if easter egg is already discovered
 */
export function isEasterEggDiscovered(eggId: string): boolean {
  return getDiscoveredEasterEggs().has(eggId);
}

/**
 * Find easter egg by trigger pattern
 */
export function findEasterEggByPattern(
  trigger: EasterEggTrigger,
  pattern: string | number[],
): EasterEgg | null {
  return (
    EASTER_EGGS.find(
      (egg) =>
        egg.enabled &&
        egg.trigger === trigger &&
        JSON.stringify(egg.pattern) === JSON.stringify(pattern),
    ) || null
  );
}
