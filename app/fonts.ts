import { Marcellus_SC, MedievalSharp } from 'next/font/google';

export const medievalFont = MedievalSharp({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-medieval',
});

/**
 * The display face is loaded through Next's font pipeline so headings do not
 * depend on a render-blocking external stylesheet or an unversioned local copy.
 */
export const marcellusSc = Marcellus_SC({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-marcellus-sc',
});
