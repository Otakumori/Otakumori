import type { SVGProps } from 'react';
import MoriIconFrame from './MoriIconFrame';

type PetalWalletIconProps = SVGProps<SVGSVGElement> & {
  compact?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export default function PetalWalletIcon({
  compact = false,
  className = 'h-5 w-5',
  size = 'md',
  ...props
}: PetalWalletIconProps) {
  // Structural placeholder until the final Petal Wallet glyph artwork is approved.
  return (
    <MoriIconFrame size={size} className={className}>
    <svg
      className="h-full w-full"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M7.1 13.2c0-2.1 1.7-3.8 3.8-3.8h12.7c1.5 0 2.7 1.2 2.7 2.7v9.7c0 2-1.6 3.6-3.6 3.6H10.8c-2 0-3.7-1.6-3.7-3.7v-8.5Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M8.2 12.7h14.6c2.2 0 4 1.8 4 4v5c0 2.2-1.8 4-4 4H10.9c-2.2 0-4-1.8-4-4v-7.5c0-.8.6-1.5 1.3-1.5Z"
        fill="#3a2027"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8.9 12.7c.7-3.1 3-5.3 6.5-5.8 3.1-.4 5.8.5 7.2 2.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M21.6 15.8h4.1c1.1 0 2 .9 2 2v2.4c0 1.1-.9 2-2 2h-4.1c-1.8 0-3.2-1.4-3.2-3.2s1.4-3.2 3.2-3.2Z"
        fill="#f2b9c6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="22.1" cy="19" r="1" fill="#4a2530" />
      <path
        d="M10.5 16.1h5.7M10.5 20.8h5"
        stroke="#f8ddcf"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.78"
      />
      {!compact && (
        <>
          <path
            d="M15.9 3.9c1.7 2.4 1.4 4.6-.6 6.1-1.8-1.6-1.8-3.9.6-6.1Z"
            fill="#f5a8ba"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path
            d="M19.5 5.9c.2 2.2-.9 3.7-3.1 4.1-.5-2 .5-3.6 3.1-4.1Z"
            fill="#f4b9c6"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <path
            d="M12.2 6.1c2 .7 3 2.2 2.6 4.1-2-.2-3.1-1.7-2.6-4.1Z"
            fill="#f4c2cd"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </>
      )}
      <path
        d="M13 23.1c.7-1.3 2-1.9 3.4-1.5-.3 1.4-1.6 2.2-3.4 1.5Z"
        fill="#f2b9c6"
        opacity="0.86"
      />
    </svg>
    </MoriIconFrame>
  );
}
