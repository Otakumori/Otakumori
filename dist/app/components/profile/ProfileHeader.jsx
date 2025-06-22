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
exports.ProfileHeader = void 0;
const react_1 = __importStar(require('react'));
const framer_motion_1 = require('framer-motion');
const image_1 = __importDefault(require('next/image'));
const ProfileHeader = ({
  displayName,
  tier,
  status,
  tagline,
  fontStyle,
  onFontToggle,
  backgroundUrl,
}) => {
  const [pulse, setPulse] = (0, react_1.useState)(false);
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-pink-400/30 bg-gradient-to-br from-[#2d2233] to-[#3a2a3f] shadow-lg"
      style={{ minHeight: 180 }}
    >
      {/* Dynamic background */}
      {backgroundUrl && (
        <image_1.default
          src={backgroundUrl}
          alt="Profile background"
          fill
          className="pointer-events-none select-none object-cover opacity-30"
        />
      )}
      {/* Subtle petal drift overlay (placeholder, can be replaced with animation) */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* TODO: Add animated petals here */}
      </div>
      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-between gap-4 px-8 py-6 md:flex-row md:items-end">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {/* Petal Tier Badge */}
            <framer_motion_1.motion.div
              animate={{ scale: pulse ? [1, 1.15, 1] : 1 }}
              transition={{ duration: 0.5 }}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-pink-400 bg-pink-200/20 shadow-lg shadow-pink-200/30"
            >
              <image_1.default
                src={`/assets/achievements/tier-${tier}-petal.png`}
                alt={`Petal Tier ${tier}`}
                width={40}
                height={40}
                className="animate-pulse"
              />
            </framer_motion_1.motion.div>
            {/* Display Name */}
            <framer_motion_1.motion.h1
              onClick={() => {
                setPulse(true);
                setTimeout(() => setPulse(false), 500);
              }}
              animate={{ scale: pulse ? [1, 1.08, 1] : 1 }}
              transition={{ duration: 0.5 }}
              className={`cursor-pointer select-none text-3xl font-bold ${fontStyle === 'runic' ? 'font-unifraktur-cook' : 'font-roboto-condensed'} text-white`}
            >
              {displayName}
            </framer_motion_1.motion.h1>
            {/* Font toggle */}
            <button
              onClick={onFontToggle}
              className="ml-2 rounded bg-pink-400/20 px-2 py-1 text-xs font-semibold text-pink-200 transition hover:bg-pink-400/40"
            >
              {fontStyle === 'runic' ? 'Runic' : 'Clean'}
            </button>
          </div>
          {/* Status & Tagline */}
          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            <span className="font-roboto-condensed text-sm capitalize text-pink-200">{status}</span>
            <span className="mx-2 text-pink-400">•</span>
            <span className="font-cormorant-garamond text-base italic text-pink-200">
              {tagline}
            </span>
          </div>
        </div>
      </div>
      {/* Decorative border overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-30 rounded-xl border-2 border-pink-400/20"
        style={{ boxShadow: '0 0 32px 0 #f7c6d933' }}
      />
    </div>
  );
};
exports.ProfileHeader = ProfileHeader;
