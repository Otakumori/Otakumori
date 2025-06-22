'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.medievalFont = void 0;
const google_1 = require('next/font/google');
exports.medievalFont = (0, google_1.MedievalSharp)({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-medieval',
});
