import React, { useState } from 'react';

// Placeholder SVG layers for demo
const BodyLayer = ({ color }: { color: string }) => (
  <ellipse cx="100" cy="140" rx="60" ry="90" fill={color} />
);
const HairLayer = ({ color, style }: { color: string; style: 'short' | 'long' }) =>
  style === 'short' ? (
    <ellipse cx="100" cy="70" rx="50" ry="30" fill={color} />
  ) : (
    <ellipse cx="100" cy="100" rx="55" ry="50" fill={color} />
  );
const EyesLayer = ({ color }: { color: string }) => (
  <>
    <ellipse cx="75" cy="130" rx="10" ry="6" fill={color} />
    <ellipse cx="125" cy="130" rx="10" ry="6" fill={color} />
  </>
);
const OutfitLayer = ({ type }: { type: 'dress' | 'nude' }) =>
  type === 'dress' ? <rect x="55" y="170" width="90" height="60" rx="20" fill="#eab0d1" /> : null;

interface AvatarState {
  bodyColor: string;
  hairColor: string;
  hairStyle: 'short' | 'long';
  eyeColor: string;
  outfit: 'dress' | 'nude';
  nsfw: boolean;
}

const defaultState: AvatarState = {
  bodyColor: '#f7c6d9',
  hairColor: '#2d2233',
  hairStyle: 'long',
  eyeColor: '#5b4d6c',
  outfit: 'dress',
  nsfw: false,
};

export const AvatarCreator: React.FC = () => {
  const [avatar, setAvatar] = useState<AvatarState>(defaultState);
  const [age, setAge] = useState('');
  const [ageVerified, setAgeVerified] = useState(false);

  const handleSlider = (key: keyof AvatarState, value: any) => {
    setAvatar((prev) => ({ ...prev, [key]: value }));
  };

  const handleAgeCheck = () => {
    if (parseInt(age) >= 18) setAgeVerified(true);
    else alert('You must be 18+ to access NSFW options.');
  };

  const handleSave = () => {
    localStorage.setItem('otakumori_avatar', JSON.stringify(avatar));
    alert('Avatar saved!');
  };
  const handleLoad = () => {
    const data = localStorage.getItem('otakumori_avatar');
    if (data) setAvatar(JSON.parse(data));
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-xl border border-pink-400/30 bg-[#2d2233] p-6 shadow-lg">
      <div className="flex flex-col items-center">
        <svg width={200} height={260} viewBox="0 0 200 260" className="mb-4">
          <BodyLayer color={avatar.bodyColor} />
          <HairLayer color={avatar.hairColor} style={avatar.hairStyle} />
          <EyesLayer color={avatar.eyeColor} />
          <OutfitLayer type={avatar.outfit} />
        </svg>
        <div className="mt-2 flex gap-4">
          <button
            onClick={handleSave}
            className="rounded bg-pink-400/20 px-3 py-1 text-pink-100 transition hover:bg-pink-400/40"
          >
            Save
          </button>
          <button
            onClick={handleLoad}
            className="rounded bg-pink-400/20 px-3 py-1 text-pink-100 transition hover:bg-pink-400/40"
          >
            Load
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <label className="font-cormorant-garamond text-pink-200">
          Body Color
          <input
            type="color"
            value={avatar.bodyColor}
            onChange={(e) => handleSlider('bodyColor', e.target.value)}
            className="ml-2"
          />
        </label>
        <label className="font-cormorant-garamond text-pink-200">
          Hair Color
          <input
            type="color"
            value={avatar.hairColor}
            onChange={(e) => handleSlider('hairColor', e.target.value)}
            className="ml-2"
          />
        </label>
        <label className="font-cormorant-garamond text-pink-200">
          Hair Style
          <select
            value={avatar.hairStyle}
            onChange={(e) => handleSlider('hairStyle', e.target.value as 'short' | 'long')}
            className="ml-2 rounded bg-pink-400/10 text-pink-100"
            aria-label="Select"
          >
            <option value="short">Short</option>
            <option value="long">Long</option>
          </select>
        </label>
        <label className="font-cormorant-garamond text-pink-200">
          Eye Color
          <input
            type="color"
            value={avatar.eyeColor}
            onChange={(e) => handleSlider('eyeColor', e.target.value)}
            className="ml-2"
          />
        </label>
        <label className="font-cormorant-garamond text-pink-200">
          Outfit
          <select
            value={avatar.outfit}
            onChange={(e) => handleSlider('outfit', e.target.value as 'dress' | 'nude')}
            className="ml-2 rounded bg-pink-400/10 text-pink-100"
            disabled={!avatar.nsfw}
            aria-label="Select"
          >
            <option value="dress">Dress</option>
            <option value="nude">Nude</option>
          </select>
        </label>
        {/* NSFW Toggle with Age Check */}
        {!avatar.nsfw ? (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-16 rounded bg-pink-400/10 px-2 text-pink-100"
            />
            <button
              onClick={handleAgeCheck}
              className="rounded bg-pink-400/20 px-2 py-1 text-pink-100 transition hover:bg-pink-400/40"
            >
              Verify Age
            </button>
            <button
              onClick={() => setAvatar((a) => ({ ...a, nsfw: ageVerified }))}
              disabled={!ageVerified}
              className="rounded bg-pink-400/20 px-2 py-1 text-pink-100 transition hover:bg-pink-400/40 disabled:opacity-50"
            >
              Enable NSFW
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAvatar((a) => ({ ...a, nsfw: false, outfit: 'dress' }))}
            className="rounded bg-pink-400/20 px-2 py-1 text-pink-100 transition hover:bg-pink-400/40"
          >
            Disable NSFW
          </button>
        )}
      </div>
    </div>
  );
};
