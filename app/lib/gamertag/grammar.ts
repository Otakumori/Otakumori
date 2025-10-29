import { getBank } from './wordBank';

export type NumbersMode = 'none' | 'suffix' | 'random';
export type Separator = '-' | '_' | '' | ' ';

export type GenerateOpts = {
  maxLen?: number;
  separator?: Separator;
  numbers?: NumbersMode;
  seed?: number; // optional for deterministic UX
};

function titleCase(s: string) {
  return s.replace(/\b([a-z])/g, (_, c) => c.toUpperCase()).replace(/[^A-Za-z0-9]+/g, '');
}
function pick<T>(arr: T[], r: () => number): T | undefined {
  const index = Math.floor(r() * arr.length);
  return arr[index];
}
function rng(seed?: number) {
  let x = seed ? seed : (Math.random() * 1e9) | 0;
  return () => (x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296;
}
function digits(r: () => number, min: number, max: number) {
  const len = min === max ? min : min + Math.floor(r() * (max - min + 1));
  let s = '';
  for (let i = 0; i < len; i++) s += Math.floor(r() * 10).toString();
  return s;
}
function ensureMaxLen(s: string, max: number) {
  return s.length <= max ? s : s.slice(0, max);
}

export function generateCandidate(opts: GenerateOpts = {}): string {
  const bank = getBank();
  const { maxLen = 16, separator = '-', numbers = 'suffix', seed } = opts;

  const r = rng(seed);

  // A small set of weighted templates derived from your Perchance rules
  // (no emoji, DS tone, punchy)
  const templates: Array<() => string> = [
    () =>
      `${titleCase(pick(bank.adjectives, r) ?? 'mystic')}${separator}${titleCase(pick(bank.concreteNouns, r) ?? 'star')}`,
    () =>
      `${r() < 0.5 ? 'The' + separator : ''}${titleCase(pick(bank.adjectives, r) ?? 'mystic')}${titleCase(pick(bank.concreteNouns, r) ?? 'star')}`,
    () =>
      `${titleCase(pick(bank.verbs, r) ?? 'forge')}${titleCase(pick(bank.concreteNouns, r) ?? 'star')}`,
    () =>
      `${titleCase(pick(bank.animals, r) ?? 'fox')}${separator}${titleCase(pick(bank.containerTypes, r) ?? 'void')}`,
    () =>
      `${titleCase(pick(bank.adverbs, r) ?? 'lunar')}${separator}${titleCase(pick(bank.adjectives, r) ?? 'mystic')}`,
    () =>
      `${titleCase(pick(bank.adjectives, r) ?? 'mystic')}${titleCase(pick(bank.nouns, r) ?? 'star')}`,
  ];

  const selectedTemplate = templates[Math.floor(r() * templates.length)];
  let base = selectedTemplate?.() ?? 'mystic-star';

  // Optional numeric garnish
  if (numbers !== 'none') {
    if (numbers === 'suffix' || (numbers === 'random' && r() < 0.5)) {
      const tag = digits(r, 1, 4);
      base = `${base}${tag}`;
    }
  }

  base = base
    .replace(/--+/g, separator)
    .replace(/__+/g, separator)
    .replace(/( |-|_){2,}/g, separator);
  base = base.replace(/[^A-Za-z0-9\-_ ]/g, ''); // strict
  base = base.replace(/\s+/g, separator);
  base = ensureMaxLen(base, maxLen);

  // never empty
  if (!base) base = 'MoriWanderer';
  return base;
}

export function generateBest(opts: GenerateOpts = {}): string {
  // Try a handful and pick the most readable (shortest first, then alpha)
  const tries = 8;
  const out = new Set<string>();
  for (let i = 0; i < tries; i++)
    out.add(generateCandidate({ ...opts, seed: (opts.seed ?? 0) + i + 1 }));
  return [...out].sort((a, b) => a.length - b.length || a.localeCompare(b))[0]!;
}
