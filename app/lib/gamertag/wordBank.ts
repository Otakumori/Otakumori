import fs from "node:fs";
import path from "node:path";

type Bank = {
  adjectives: string[];
  nouns: string[];
  adverbs: string[];
  cliches: string[];
  animals: string[];
  verbs: string[];
  concreteNouns: string[];
  containerTypes: string[];
};

const cache: Partial<Bank> = {};

function load(file: string): string[] {
  if (cache[file as keyof Bank]) return cache[file as keyof Bank] as string[];
  const p = path.join(process.cwd(), "public", "data", "gamertag", file);
  const txt = fs.readFileSync(p, "utf8");
  const arr = txt
    .split(/\r?\n/g)
    .map(s => s.trim())
    .filter(Boolean)
    .filter(s => !/[\u{1F300}-\u{1FAFF}]/u.test(s)); // strip emoji just in case
  cache[file as keyof Bank] = arr;
  return arr;
}

export function getBank(): Bank {
  return {
    adjectives: load("adjectives.txt"),
    nouns: load("nouns.txt"),
    adverbs: load("adverbs.txt"),
    cliches: load("cliches.txt"),
    animals: load("animals.txt"),
    verbs: load("verbs.txt"),
    concreteNouns: load("concrete-nouns.txt"),
    containerTypes: load("container-types.txt"),
  };
}
