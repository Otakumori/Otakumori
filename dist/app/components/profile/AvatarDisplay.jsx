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
exports.AvatarDisplay = void 0;
const react_1 = __importStar(require('react'));
const BodyLayer = ({ color }) => <ellipse cx="100" cy="140" rx="60" ry="90" fill={color} />;
const HairLayer = ({ color, style }) =>
  style === 'short' ? (
    <ellipse cx="100" cy="70" rx="50" ry="30" fill={color} />
  ) : (
    <ellipse cx="100" cy="100" rx="55" ry="50" fill={color} />
  );
const EyesLayer = ({ color }) => (
  <>
    <ellipse cx="75" cy="130" rx="10" ry="6" fill={color} />
    <ellipse cx="125" cy="130" rx="10" ry="6" fill={color} />
  </>
);
const OutfitLayer = ({ type }) =>
  type === 'dress' ? <rect x="55" y="170" width="90" height="60" rx="20" fill="#eab0d1" /> : null;
const AvatarDisplay = ({ idle = true }) => {
  const [avatar, setAvatar] = (0, react_1.useState)(null);
  const [breath, setBreath] = (0, react_1.useState)(1);
  (0, react_1.useEffect)(() => {
    const data = localStorage.getItem('otakumori_avatar');
    if (data) setAvatar(JSON.parse(data));
  }, []);
  // Simple breathing animation
  (0, react_1.useEffect)(() => {
    if (!idle) return;
    let frame = 0;
    let anim;
    const animate = () => {
      setBreath(1 + 0.04 * Math.sin(frame / 30));
      frame++;
      anim = requestAnimationFrame(animate);
    };
    anim = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(anim);
  }, [idle]);
  if (!avatar)
    return (
      <div className="flex h-64 w-48 items-center justify-center rounded-lg bg-pink-200/10 text-pink-200">
        No Avatar
      </div>
    );
  return (
    <div className="flex h-64 w-48 items-center justify-center rounded-lg border border-pink-400/30 bg-pink-200/10 shadow-lg">
      <svg width={200} height={260} viewBox="0 0 200 260">
        <g style={{ transform: `scaleY(${breath})`, transformOrigin: '100px 170px' }}>
          <BodyLayer color={avatar.bodyColor} />
          <HairLayer color={avatar.hairColor} style={avatar.hairStyle} />
          <EyesLayer color={avatar.eyeColor} />
          <OutfitLayer type={avatar.outfit} />
        </g>
      </svg>
    </div>
  );
};
exports.AvatarDisplay = AvatarDisplay;
