import { type CanonicalRuneId } from '@/types/runes';

// Noto Emoji (monochrome) friendly defaults for rune glyphs
export const DEFAULT_RUNE_DISPLAYS: Record<CanonicalRuneId, { name: string; glyph: string }> = {
  rune_a: { name: 'Rune I', glyph: '' },
  rune_b: { name: 'Rune II', glyph: '' },
  rune_c: { name: 'Rune III', glyph: '' },
  rune_d: { name: 'Rune IV', glyph: '' },
  rune_e: { name: 'Rune V', glyph: '' },
  rune_f: { name: 'Rune VI', glyph: '' },
  rune_g: { name: 'Rune VII', glyph: '' },
  rune_h: { name: 'Rune VIII', glyph: '️' },
  rune_i: { name: 'Rune IX', glyph: '' },
  rune_j: { name: 'Rune X', glyph: '' },
  rune_k: { name: 'Rune XI', glyph: '️' },
  rune_l: { name: 'Rune XII', glyph: '' },
  rune_m: { name: 'Rune XIII', glyph: '' },
  rune_n: { name: 'Rune XIV', glyph: '' },
  rune_o: { name: 'Rune XV', glyph: '' },
  rune_p: { name: 'Rune XVI', glyph: '' },
  rune_q: { name: 'Rune XVII', glyph: '' },
  rune_r: { name: 'Rune XVIII', glyph: '' },
  rune_s: { name: 'Rune XIX', glyph: '' },
  rune_t: { name: 'Rune XX', glyph: '' },
};

export function getDefaultRuneDisplay(id: CanonicalRuneId) {
  return DEFAULT_RUNE_DISPLAYS[id];
}
