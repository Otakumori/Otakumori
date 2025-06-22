'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const google_1 = require('next/font/google');
require('./globals.css');
const CartProvider_1 = require('./components/cart/CartProvider');
const AchievementContext_1 = require('./contexts/AchievementContext');
const Navbar_1 = __importDefault(require('./components/layout/Navbar'));
const fonts_1 = require('./fonts');
const Sentry = __importStar(require('@sentry/react'));
const inter = (0, google_1.Inter)({ subsets: ['latin'] });
exports.metadata = {
  title: 'Otakumori - Your Anime Community',
  description:
    'Join Otakumori, your ultimate destination for anime merchandise, manga, and otaku culture.',
  keywords: 'anime, manga, otaku, community, merchandise, figures, art prints',
};
function RootLayout({ children }) {
  return (
    <Sentry.ErrorBoundary
      fallback={
        <div className="p-8 text-pink-200">An error has occurred. Please try again later.</div>
      }
    >
      <button
        onClick={() => {
          throw new Error('This is your first error!');
        }}
        aria-label="Trigger Sentry test error"
        className="fixed bottom-4 right-4 z-50 rounded bg-pink-400/30 px-4 py-2 text-pink-100 shadow transition hover:bg-pink-400/50"
      >
        Break the world
      </button>
      <html lang="en" className={`${inter.className} ${fonts_1.medievalFont.variable}`}>
        <body className="font-medieval">
          <CartProvider_1.CartProvider>
            <AchievementContext_1.AchievementProvider>
              <Navbar_1.default />
              <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900">
                {children}
              </div>
            </AchievementContext_1.AchievementProvider>
          </CartProvider_1.CartProvider>
        </body>
      </html>
    </Sentry.ErrorBoundary>
  );
}
