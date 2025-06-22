'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
require('~/styles/globals.css');
const google_1 = require('next/font/google');
const react_1 = require('~/trpc/react');
const SoundSettings_1 = require('@/components/SoundSettings');
exports.metadata = {
  title: 'Otakumori',
  description: 'Your anime merchandise destination',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};
const robotoCondensed = (0, google_1.Roboto_Condensed)({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-roboto-condensed',
});
function RootLayout({ children }) {
  return (
    <html lang="en" className={`${robotoCondensed.variable}`}>
      <body className="font-sans">
        <react_1.TRPCReactProvider>{children}</react_1.TRPCReactProvider>
        <SoundSettings_1.SoundSettings />
      </body>
    </html>
  );
}
