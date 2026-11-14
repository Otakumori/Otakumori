import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

type Candidate = {
  acquisitionState: string;
  id: string;
  licenseEvidenceState: string;
  sourceUrl: string;
};

const candidates = JSON.parse(
  readFileSync('docs/design/production-authority/blossomware-external-candidates.json', 'utf8'),
) as { candidates: Candidate[]; requiredAcquisitionState: string };

describe('Blossomware external candidate research', () => {
  it('keeps every external candidate unacquired and outside production authority', () => {
    expect(candidates.requiredAcquisitionState).toBe('CANDIDATE_NOT_ACQUIRED');
    expect(candidates.candidates).toHaveLength(19);
    expect(new Set(candidates.candidates.map(({ id }) => id)).size).toBe(19);

    for (const candidate of candidates.candidates) {
      expect(candidate.acquisitionState).toBe('CANDIDATE_NOT_ACQUIRED');
      expect(candidate.licenseEvidenceState).not.toBe('LICENSE_CLEARED');
      expect(candidate.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it('does not leak unused research candidates into public audio credits', () => {
    const publicCredits = readFileSync('public/assets/credits.json', 'utf8');

    for (const candidate of candidates.candidates) {
      expect(publicCredits).not.toContain(candidate.sourceUrl);
    }
  });

  it('keeps the Retro Windows GUI candidate blocked on license evidence', () => {
    const candidate = candidates.candidates.find(
      ({ id }) => id === 'comp3interactive_retro_windows_gui',
    );

    expect(candidate).toMatchObject({
      acquisitionState: 'CANDIDATE_NOT_ACQUIRED',
      licenseEvidenceState: 'LICENSE_VERIFICATION_REQUIRED',
    });
  });
});
