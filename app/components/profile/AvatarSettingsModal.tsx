/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';

interface AvatarSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const poseOptions = [
  { value: 'idle', label: 'Idle/Neutral', nsfw: false },
  { value: 'wait', label: 'Wait for Touch', nsfw: false },
  { value: 'knees', label: 'On Knees', nsfw: true },
  { value: 'arch', label: 'Arch Back and Watch', nsfw: true },
  { value: 'still', label: 'Linger in Stillness', nsfw: false },
];

const outfitOptions = [
  { value: 'dress', label: 'Dress', nsfw: false },
  { value: 'nude', label: 'Nude', nsfw: true },
];

export const AvatarSettingsModal: React.FC<AvatarSettingsModalProps> = ({ isOpen, onClose }) => {
  const [pose, setPose] = useState('idle');
  const [outfit, setOutfit] = useState('dress');
  const [deepAccess, setDeepAccess] = useState(false);
  const [age, setAge] = useState('');
  const [ageVerified, setAgeVerified] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      // Load current avatar settings
      const data = localStorage.getItem('otakumori_avatar');
      if (data) {
        const avatar = JSON.parse(data);
        setPose(avatar.pose || 'idle');
        setOutfit(avatar.outfit || 'dress');
        setDeepAccess(!!avatar.deepAccess);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    const data = localStorage.getItem('otakumori_avatar');
    if (data) {
      const avatar = JSON.parse(data);
      avatar.pose = pose;
      avatar.outfit = outfit;
      avatar.deepAccess = deepAccess;
      localStorage.setItem('otakumori_avatar', JSON.stringify(avatar));
    }
    onClose();
  };

  const handleAgeCheck = () => {
    if (parseInt(age) >= 18) setAgeVerified(true);
    else alert('You must be 18+ to access Deep Access or NSFW options.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-md rounded-xl border border-pink-400/30 bg-[#2d2233] p-8 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-xl text-pink-200 hover:text-pink-400"
        >
          ×
        </button>
        <h2 className="font-cormorant-garamond mb-6 text-2xl text-pink-200">Avatar Settings</h2>
        {/* Pose Selection */}
        <div className="mb-4">
          <label className="font-cormorant-garamond mb-2 block text-pink-200">Pose</label>
          <select
            value={pose}
            onChange={e => setPose(e.target.value)}
            className="w-full rounded bg-pink-400/10 p-2 text-pink-100"
          >
            {poseOptions.map(opt => (
              <option key={opt.value} value={opt.value} disabled={opt.nsfw && !deepAccess}>
                {opt.label} {opt.nsfw ? '(NSFW)' : ''}
              </option>
            ))}
          </select>
        </div>
        {/* Outfit Selection */}
        <div className="mb-4">
          <label className="font-cormorant-garamond mb-2 block text-pink-200">Outfit</label>
          <select
            value={outfit}
            onChange={e => setOutfit(e.target.value)}
            className="w-full rounded bg-pink-400/10 p-2 text-pink-100"
          >
            {outfitOptions.map(opt => (
              <option key={opt.value} value={opt.value} disabled={opt.nsfw && !deepAccess}>
                {opt.label} {opt.nsfw ? '(NSFW)' : ''}
              </option>
            ))}
          </select>
        </div>
        {/* Deep Access Toggle */}
        <div className="mb-6">
          {!deepAccess ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="w-16 rounded bg-pink-400/10 px-2 text-pink-100"
              />
              <button
                onClick={handleAgeCheck}
                className="rounded bg-pink-400/20 px-2 py-1 text-pink-100 transition hover:bg-pink-400/40"
              >
                Verify Age
              </button>
              <button
                onClick={() => setDeepAccess(ageVerified)}
                disabled={!ageVerified}
                className="rounded bg-pink-400/20 px-2 py-1 text-pink-100 transition hover:bg-pink-400/40 disabled:opacity-50"
              >
                Enable Deep Access
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeepAccess(false)}
              className="rounded bg-pink-400/20 px-2 py-1 text-pink-100 transition hover:bg-pink-400/40"
            >
              Disable Deep Access
            </button>
          )}
        </div>
        <button
          onClick={handleSave}
          className="w-full rounded bg-pink-400/30 py-2 font-bold text-pink-100 transition hover:bg-pink-400/50"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};
