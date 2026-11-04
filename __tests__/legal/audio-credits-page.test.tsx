import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import CreditsPage from '@/app/credits/page';
import audioAttributions from '@/docs/legal/audio-attributions.json';
import publicCredits from '@/public/assets/credits.json';

describe('audio credits and asset acknowledgments', () => {
  it('renders only bounded public provenance without private intake paths', () => {
    const html = renderToStaticMarkup(<CreditsPage />);

    expect(html).toContain('Credits &amp; Asset Acknowledgments');
    expect(html).toContain('Free Fantasy 200 SFX Pack');
    expect(html).toContain('Super Dialogue Audio Pack v1');
    expect(html).toContain('Bubble Pops');
    expect(html).toContain('rel="license noopener noreferrer"');
    expect(html).not.toContain('C:\\Users\\');
    expect(html).not.toContain('OWNER_SFX_LIBRARY');
  });

  it('keeps public credits tied to exact source and license records', () => {
    const publicEntries = audioAttributions.entries.filter(({ publicCredit }) => publicCredit);

    expect(publicEntries).toHaveLength(19);
    expect(
      publicEntries.every(
        ({ creator, licenseUrl, sourceUrl }) =>
          creator.length > 0 &&
          licenseUrl.startsWith('https://') &&
          sourceUrl.startsWith('https://'),
      ),
    ).toBe(true);

    const audioCredits = publicCredits.filter(({ kind }) => kind === 'audio');
    expect(audioCredits).toHaveLength(publicEntries.length);
    expect(audioCredits.some(({ source }) => source === 'https://freesound.org/')).toBe(false);
    expect(audioCredits.some(({ source }) => source === 'https://incompetech.com/')).toBe(false);
  });
});
