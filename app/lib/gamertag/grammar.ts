import { getBank } from './wordBank';

export type NumbersMode = 'none' | 'suffix' | 'random';
export type Separator = '-' | '_' | '' | ' ';

export type GenerateOpts = {
  maxLen?: number;
  separator?: Separator;
  numbers?: NumbersMode;
  seed?: number;
};

function titleCase(s: string) {
  return s.replace(/\b([a-z])/g, (_, c) => c.toUpperCase()).replace(/[^A-Za-z0-9]+/g, '');
}

function pick<T>(arr: T[], r: () => number): T | undefined {
  const index = Math.floor(r() * arr.length);
  return arr[index];
}

function rng(seed?: number) {
  let x = seed ?? ((Math.random() * 1e9) | 0);
  return () => (x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

function digits(r: () => number, min: number, max: number) {
  const len = min === max ? min : min + Math.floor(r() * (max - min + 1));
  let s = '';
  for (let i = 0; i < len; i++) s += Math.floor(r() * 10).toString();
  return s;
}

function cleanCandidate(value: string, separator: Separator, max: number) {
  let candidate = value
    .replace(/--+/g, separator)
    .replace(/__+/g, separator)
    .replace(/( |-|_){2,}/g, separator)
    .replace(/[^A-Za-z0-9\-_ ]/g, '')
    .replace(/\s+/g, separator);

  if (candidate.length <= max) return candidate;

  const withoutDigits = candidate.replace(/\d+$/, '');
  if (withoutDigits.length >= 5 && withoutDigits.length <= max) return withoutDigits;

  candidate = candidate.slice(0, max).replace(/[-_ ]+$/, '');
  return candidate;
}

export function generateCandidate(opts: GenerateOpts = {}): string {
  const bank = getBank();
  const { maxLen = 16, separator = '-', numbers = 'suffix', seed } = opts;
  const r = rng(seed);

  const templates: Array<() => string> = [
    () =>
      `${titleCase(pick(bank.adjectives, r) ?? 'mystic')}${separator}${titleCase(pick(bank.concreteNouns, r) ?? 'star')}`,
    () =>
      `${r() < 0.35 ? 'The' + separator : ''}${titleCase(pick(bank.adjectives, r) ?? 'mystic')}${titleCase(pick(bank.concreteNouns, r) ?? 'star')}`,
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
  let base = selectedTemplate?.() ?? 'MoriWanderer';

  if (numbers !== 'none' && (numbers === 'suffix' || (numbers === 'random' && r() < 0.45))) {
    base = `${base}${digits(r, 1, 3)}`;
  }

  base = cleanCandidate(base, separator, maxLen);
  return base || 'MoriWanderer';
}

function readabilityScore(value: string) {
  const digitPenalty = /\d{3,}$/.test(value) ? 4 : /\d+$/.test(value) ? 1 : 0;
  const lengthPenalty = Math.abs(11 - value.length) * 0.18;
  const awkwardEndPenalty = /[-_ ]$/.test(value) ? 8 : 0;
  return digitPenalty + lengthPenalty + awkwardEndPenalty;
}

export function generateMany(opts: GenerateOpts = {}, count = 4): string[] {
  const target = Math.min(8, Math.max(1, count));
  const baseSeed = opts.seed ?? ((Math.random() * 1_000_000_000) | 0);
  const out = new Set<string>();

  for (let i = 0; i < target * 8 && out.size < target; i++) {
    out.add(generateCandidate({ ...opts, seed: baseSeed + i * 7919 + 1 }));
  }

  return [...out].sort((a, b) => readabilityScore(a) - readabilityScore(b) || a.localeCompare(b)).slice(0, target);
}

export function generateBest(opts: GenerateOpts = {}): string {
  return generateMany(opts, 1)[0] ?? 'MoriWanderer';
}
