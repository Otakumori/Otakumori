import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

type Recommendation = {
  surface: string;
  candidates: Array<{
    rightsStatus: string;
    runtimePreparation: string;
    sourceAssetId: string;
  }>;
};

const review = JSON.parse(
  readFileSync('docs/design/reviews/audio-placement-recommendations-v1.json', 'utf8'),
) as {
  authority: string;
  publicationState: string;
  recommendations: Recommendation[];
};

describe('audio placement recommendations', () => {
  it('keeps all seven surface shortlists owner-gated and unpublished', () => {
    expect(review.authority).toBe('OWNER_AUDITION_REQUIRED');
    expect(review.publicationState).toBe('NOT_AUTHORIZED');
    expect(review.recommendations.map(({ surface }) => surface)).toEqual([
      'Home',
      'Navigation',
      'Commander',
      'Petal Samurai',
      'Bubble Ragdoll',
      'Puzzle Reveal',
      'Otaku Beat-em-up',
    ]);
  });

  it('records traceable source IDs, rights states, and runtime preparation', () => {
    for (const recommendation of review.recommendations) {
      expect(recommendation.candidates.length).toBeGreaterThan(0);
      expect(recommendation.candidates.length).toBeLessThanOrEqual(3);
      for (const candidate of recommendation.candidates) {
        expect(candidate.sourceAssetId).toMatch(/^audio_[a-f0-9]{16}$/);
        expect(candidate.rightsStatus).toMatch(
          /^(LICENSE_VERIFIED|ATTRIBUTION_REQUIRED|OWNER_AUTHORED_RIGHTS_CONFIRMED)$/,
        );
        expect(candidate.runtimePreparation).not.toBe('');
      }
    }
  });
});
