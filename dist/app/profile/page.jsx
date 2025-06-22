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
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = ProfilePage;
const react_1 = __importStar(require('react'));
const ProfileHeader_1 = require('../components/profile/ProfileHeader');
const ProfileStats_1 = require('../components/profile/ProfileStats');
const AvatarDisplay_1 = require('../components/profile/AvatarDisplay');
const AvatarSettingsModal_1 = require('../components/profile/AvatarSettingsModal');
const placeholderUser = {
  displayName: 'Adi',
  tier: 7,
  status: 'Online',
  tagline: 'The petals whisper: do you love me?',
  fontStyle: 'clean',
  backgroundUrl: undefined, // Add a background image if desired
};
function ProfilePage() {
  const [fontStyle, setFontStyle] = (0, react_1.useState)(placeholderUser.fontStyle);
  const [modalOpen, setModalOpen] = (0, react_1.useState)(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d2233] to-[#3a2a3f] px-2 py-12 md:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        {/* Header */}
        <ProfileHeader_1.ProfileHeader
          displayName={placeholderUser.displayName}
          tier={placeholderUser.tier}
          status={placeholderUser.status}
          tagline={placeholderUser.tagline}
          fontStyle={fontStyle}
          onFontToggle={() => setFontStyle(f => (f === 'clean' ? 'runic' : 'clean'))}
          backgroundUrl={placeholderUser.backgroundUrl}
        />
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Left: Stats */}
          <div className="md:col-span-2">
            <ProfileStats_1.ProfileStats />
          </div>
          {/* Right: Avatar + Settings */}
          <div className="flex flex-col items-center gap-4">
            <AvatarDisplay_1.AvatarDisplay />
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 rounded bg-pink-400/20 px-4 py-2 font-bold text-pink-100 transition hover:bg-pink-400/40"
            >
              Edit Avatar
            </button>
          </div>
        </div>
      </div>
      <AvatarSettingsModal_1.AvatarSettingsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
