 
 
import React, { useEffect, useState } from 'react';

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

interface AvatarDisplayProps {
  idle?: boolean; // If true, animate breathing
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ idle = true }) => {
  const [avatar, setAvatar] = useState<AvatarState | null>(null);
  const [breath, setBreath] = useState(1);

  useEffect(() => {
    const data = localStorage.getItem('otakumori_avatar');
    if (data) setAvatar(JSON.parse(data));
  }, []);

  // Simple breathing animation
  useEffect(() => {
    if (!idle) return;
    let frame = 0;
    let anim: number;
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
