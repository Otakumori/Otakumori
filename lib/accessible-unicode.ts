/**
 * Simple Black & White Unicode Characters
 *
 * Just basic Unicode characters that render as black and white text.
 * No fancy VS15 stuff, just clean, accessible characters.
 */

export const UNICODE = {
  // Hearts
  HEART: '♥',
  HEART_OUTLINE: '♡',

  // Stars
  STAR: '★',
  STAR_OUTLINE: '☆',

  // Arrows
  ARROW_RIGHT: '→',
  ARROW_LEFT: '←',
  ARROW_UP: '↑',
  ARROW_DOWN: '↓',
  DOUBLE_ARROW_RIGHT: '⇒',
  DOUBLE_ARROW_LEFT: '⇐',

  // Checkmarks
  CHECK: '✓',
  CHECK_BOLD: '✔',
  CROSS: '✗',
  CROSS_BOLD: '✘',

  // Symbols
  EXCLAMATION: '!',
  WARNING: '⚠',
  INFO: 'ℹ',
  QUESTION: '?',

  // Play controls
  PLAY: '▶',
  PAUSE: '⏸',
  STOP: '⏹',

  // Shapes
  CIRCLE: '●',
  SQUARE: '■',
  TRIANGLE: '▲',
  DIAMOND: '♦',

  // Currency
  DOLLAR: '$',
  EURO: '€',
  POUND: '£',
  YEN: '¥',

  // Time
  CLOCK: '⏰',
  HOURGLASS: '⌛',

  // Weather
  SUN: '☀',
  CLOUD: '☁',
  SNOW: '❄',

  // Tools
  GEAR: '⚙',
  SCISSORS: '✂',

  // Cards
  SPADE: '♠',
  CLUB: '♣',

  // Faces
  SMILE: '☺',
  FROWN: '☹',

  // Special for Otakumori
  PETAL: '🏵',
  GAME: '🎮',
  MAGIC: '✨',
  CRYSTAL: '🔮',
  INFINITY: '∞',
  LIGHTNING: '⚡',
  FIRE: '⽕',
} as const;

// Type for better TypeScript support
export type UnicodeKey = keyof typeof UNICODE;

/**
 * Get a Unicode character by key
 */
export function getUnicode(key: UnicodeKey): string {
  return UNICODE[key];
}
