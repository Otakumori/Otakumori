import { describe, it, expect } from "vitest";
import { generateBest } from "@/app/lib/gamertag/grammar";

describe("Gamertag generator", () => {
  it("generates readable name <= 16 chars, no emoji", () => {
    const s = generateBest({ maxLen: 16, separator: "-", numbers: "suffix", seed: 42 });
    expect(s.length).toBeLessThanOrEqual(16);
    expect(/[^\p{Emoji}]/u.test(s)).toBeTruthy();
    expect(/^[A-Za-z0-9\-_]+$/.test(s)).toBeTruthy();
  });
});
