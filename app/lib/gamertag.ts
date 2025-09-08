const ADJ = [
  "Crimson","Runic","Silent","Petaled","Lunar","Abyssal","Ivory","Phantom","Obsidian","Violet",
  "Umbral","Arcane","Gilded","Ebon","Feral","Sable","Spectral","Nocturne","Ashen","Velvet"
];
const NOUN = [
  "Sakura","Warden","Blade","Lotus","Oath","Revenant","Vortex","Sentinel","Mori","Echo",
  "Chalice","Spire","Cipher","Petal","Monarch","Bloom","Relic","Sigil","Shade","Aegis"
];
const SUFFIX = ["", "", "", "", String(Math.floor(100+Math.random()*900)), "X", "IX", "VII", "V2", "Prime"];

export function generateGamertag(seed = Date.now()) {
  const rng = mulberry32(seed);
  const adj = ADJ[Math.floor(rng()*ADJ.length)];
  const noun = NOUN[Math.floor(rng()*NOUN.length)];
  const suf = SUFFIX[Math.floor(rng()*SUFFIX.length)];
  return [adj, noun, suf].filter(Boolean).join("");
}

function mulberry32(a: number) {
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
