'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { tierPreset, getTierMotionDuration, getTierOpacity } from '@/lib/progression/tier-map';

export type TierFrameProps = {
  tier: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  size?: number; // px box, default 96
  hueBase?: number; // default 325 (purple-pink family)
  children?: React.ReactNode; // centered content (e.g., AchievementBadge)
  animate?: boolean; // respect prefers-reduced-motion internally
  className?: string;
  ariaLabel?: string; // a11y label for the combined framed badge
};

export default function TierFrame({
  tier,
  size = 96,
  hueBase = 325,
  children,
  animate = true,
  className,
  ariaLabel,
}: TierFrameProps) {
  const preset = tierPreset(tier);
  const motionDuration = getTierMotionDuration(preset.motion);
  const opacity = getTierOpacity(tier);

  // Respect reduced motion preference
  const shouldAnimate = animate && preset.motion !== 'none';

  const frameId = `tier-frame-${tier}`;
  const gradientId = `tier-gradient-${tier}`;
  const patternId = `tier-pattern-${tier}`;

  // Generate tier-specific visual elements
  const getTierElements = () => {
    const elements: React.ReactElement[] = [];
    const center = size / 2;
    const radius = (size - 20) / 2;

    // Base ring
    elements.push(
      <circle
        key="base-ring"
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={preset.thickness}
        opacity={opacity}
      />,
    );

    // Tier-specific motifs
    switch (tier) {
      case 1:
        // Thin ring, 1-2 petal glyphs
        elements.push(
          <path
            key="petal-1"
            d={`M ${center} ${center - radius * 0.7} Q ${center + 8} ${center - radius * 0.5} ${center} ${center - radius * 0.3} Q ${center - 8} ${center - radius * 0.5} ${center} ${center - radius * 0.7} Z`}
            fill={`hsl(${preset.hue} 60% 70% / 0.3)`}
          />,
        );
        break;

      case 2:
        // Ring with tiny buds every 45°
        for (let i = 0; i < 8; i++) {
          const angle = (i * 45 * Math.PI) / 180;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          elements.push(
            <circle
              key={`bud-${i}`}
              cx={x}
              cy={y}
              r={2}
              fill={`hsl(${preset.hue} 60% 70% / 0.4)`}
            />,
          );
        }
        break;

      case 3:
        // Blossom outline segments + soft pink pulse
        for (let i = 0; i < 5; i++) {
          const angle = (i * 72 * Math.PI) / 180;
          const x1 = center + Math.cos(angle) * radius * 0.8;
          const y1 = center + Math.sin(angle) * radius * 0.8;
          const x2 = center + Math.cos(angle) * radius * 1.1;
          const y2 = center + Math.sin(angle) * radius * 1.1;
          elements.push(
            <line
              key={`blossom-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={`hsl(${preset.hue} 60% 70% / 0.5)`}
              strokeWidth={1.5}
            />,
          );
        }
        break;

      case 4:
        // Metallic gradient stroke + subtle bevel
        elements.push(
          <circle
            key="inner-bevel"
            cx={center}
            cy={center}
            r={radius - 2}
            fill="none"
            stroke={`hsl(${preset.hue} 40% 50% / 0.3)`}
            strokeWidth={0.5}
          />,
        );
        break;

      case 5:
        // Root interlace pattern mask on ring
        for (let i = 0; i < 6; i++) {
          const angle = (i * 60 * Math.PI) / 180;
          const x1 = center + Math.cos(angle) * radius * 0.7;
          const y1 = center + Math.sin(angle) * radius * 0.7;
          const x2 = center + Math.cos(angle + Math.PI / 3) * radius * 0.7;
          const y2 = center + Math.sin(angle + Math.PI / 3) * radius * 0.7;
          elements.push(
            <path
              key={`root-${i}`}
              d={`M ${x1} ${y1} Q ${center} ${center} ${x2} ${y2}`}
              fill="none"
              stroke={`hsl(${preset.hue} 50% 60% / 0.4)`}
              strokeWidth={1}
            />,
          );
        }
        break;

      case 6:
        // Petal rays radiating from corners
        const corners = [
          { x: center - radius, y: center - radius },
          { x: center + radius, y: center - radius },
          { x: center - radius, y: center + radius },
          { x: center + radius, y: center + radius },
        ];
        corners.forEach((corner, i) => {
          elements.push(
            <path
              key={`ray-${i}`}
              d={`M ${corner.x} ${corner.y} Q ${center} ${center} ${corner.x + (corner.x > center ? -20 : 20)} ${corner.y + (corner.y > center ? -20 : 20)}`}
              fill="none"
              stroke={`hsl(${preset.hue} 60% 70% / 0.3)`}
              strokeWidth={1}
            />,
          );
        });
        break;

      case 7:
        // Veil overlay (feathered mask)
        elements.push(
          <circle
            key="veil"
            cx={center}
            cy={center}
            r={radius}
            fill={`url(#${patternId})`}
            opacity={0.2}
          />,
        );
        break;

      case 8:
        // Thorn overlays (4 cardinal points)
        const thorns = [
          { x: center, y: center - radius },
          { x: center + radius, y: center },
          { x: center, y: center + radius },
          { x: center - radius, y: center },
        ];
        thorns.forEach((thorn, i) => {
          elements.push(
            <path
              key={`thorn-${i}`}
              d={`M ${thorn.x} ${thorn.y} L ${thorn.x + (i % 2 === 0 ? 0 : 8)} ${thorn.y + (i % 2 === 0 ? 8 : 0)} L ${thorn.x - (i % 2 === 0 ? 0 : 8)} ${thorn.y - (i % 2 === 0 ? 8 : 0)} Z`}
              fill={`hsl(${preset.hue} 50% 60% / 0.6)`}
            />,
          );
        });
        break;

      case 9:
        // Starfield speckle in stroke (noise mask)
        for (let i = 0; i < 12; i++) {
          const angle = (i * 30 * Math.PI) / 180;
          const x = center + Math.cos(angle) * radius * (0.8 + Math.random() * 0.4);
          const y = center + Math.sin(angle) * radius * (0.8 + Math.random() * 0.4);
          elements.push(
            <circle
              key={`star-${i}`}
              cx={x}
              cy={y}
              r={0.5 + Math.random() * 1}
              fill={`hsl(${preset.hue} 80% 80% / 0.7)`}
            />,
          );
        }
        break;

      case 10:
        // Eclipse rim (inner dark, outer glow)
        elements.push(
          <circle
            key="eclipse-inner"
            cx={center}
            cy={center}
            r={radius - 4}
            fill="none"
            stroke={`hsl(${preset.hue} 30% 30% / 0.8)`}
            strokeWidth={2}
          />,
          <circle
            key="eclipse-outer"
            cx={center}
            cy={center}
            r={radius + 4}
            fill="none"
            stroke={`hsl(${preset.hue} 80% 90% / 0.6)`}
            strokeWidth={1}
          />,
        );
        break;
    }

    return elements;
  };

  const FrameContent = () => (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn('absolute inset-0', className)}
      style={
        {
          '--om-tier-hue': preset.hue,
          '--om-tier-alpha': opacity,
          '--om-tier-accent': `hsl(${preset.hue} 60% 70%)`,
        } as React.CSSProperties
      }
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%">
          <stop offset="0%" stopColor={`hsl(${preset.hue} 70% 80% / ${opacity})`} />
          <stop offset="100%" stopColor={`hsl(${preset.hue} 50% 60% / ${opacity * 0.7})`} />
        </radialGradient>

        {tier === 7 && (
          <pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="8">
            <circle cx="4" cy="4" r="1" fill={`hsl(${preset.hue} 40% 70% / 0.3)`} />
          </pattern>
        )}
      </defs>

      {getTierElements()}
    </svg>
  );

  const content = (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {shouldAnimate ? (
        <motion.div
          animate={
            preset.motion === 'high'
              ? {
                  rotate: [0, 360],
                }
              : preset.motion === 'med'
                ? {
                    opacity: [opacity * 0.8, opacity, opacity * 0.8],
                  }
                : {}
          }
          transition={{
            duration: motionDuration,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <FrameContent />
        </motion.div>
      ) : (
        <FrameContent />
      )}

      {/* Children content centered */}
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );

  if (ariaLabel) {
    return (
      <figure aria-label={ariaLabel}>
        {content}
        <figcaption className="sr-only">
          Tier {tier} — {preset.description}
        </figcaption>
      </figure>
    );
  }

  return content;
}
