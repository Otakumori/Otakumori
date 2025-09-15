import { type CanonicalRuneId } from '@/types/runes';

// Material Symbols names for each rune (approximate thematic match)
export const MATERIAL_RUNE_ICONS: Record<CanonicalRuneId, string> = {
  rune_a: 'spa', // blossom
  rune_b: 'dark_mode', // moon/night
  rune_c: 'star',
  rune_d: 'water_drop',
  rune_e: 'terrain', // earth/rock
  rune_f: 'cyclone', // wind swirl
  rune_g: 'bolt',
  rune_h: 'ac_unit', // snowflake
  rune_i: 'local_fire_department', // flame
  rune_j: 'eco', // leaf
  rune_k: 'emoji_objects', // candle-like (bulb)
  rune_l: 'auto_awesome', // magic/orb
  rune_m: 'style', // card-like
  rune_n: 'stars', // sparkles
  rune_o: 'swords', // crossed swords
  rune_p: 'bedroom_lamp', // lantern-like
  rune_q: 'wind_power', // chime/air
  rune_r: 'menu_book', // scroll/book
  rune_s: 'landscape', // mountain
  rune_t: 'explore', // compass
};

export function getMaterialIcon(id: CanonicalRuneId): string | undefined {
  return MATERIAL_RUNE_ICONS[id];
}
