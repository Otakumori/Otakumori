// DEPRECATED: This component is a duplicate. Use app\fonts.ts instead.
import localFont from 'next/font/local';

export const optimusPrinceps = localFont({
  src: [
    { path: '../public/fonts/optimusprinceps/OptimusPrinceps.ttf', weight: '400', style: 'normal' },
    {
      path: '../public/fonts/optimusprinceps/OptimusPrincepsSemiBold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-optimus-princeps',
  display: 'swap',
});
