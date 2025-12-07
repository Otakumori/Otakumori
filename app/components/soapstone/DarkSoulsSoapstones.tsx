'use client';

import { logger } from '@/app/lib/logger';
import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  type ApiSoapstoneUser,
  getUserDisplayName,
  getUserAvatarUrl,
  getUserInitials,
} from '@/app/lib/soapstone-user-utils';

interface SoapstoneMessage {
  id: string;
  text: string;
  x: number | null;
  y: number | null;
  appraises: number;
  createdAt: string;
  user?: ApiSoapstoneUser;

interface DarkSoulsSoapstonesProps {
  initialMessages?: SoapstoneMessage[];
  maxSoapstones?: number;
  refreshInterval?: number;
}

/**
 * Dark Souls-style soapstone system
 * Displays soapstone messages that glow and pulse, positioned randomly on the background
 */
export default function DarkSoulsSoapstones({
  initialMessages = [],
  maxSoapstones = 20,
  refreshInterval = 30000, // 30 seconds
}: DarkSoulsSoapstonesProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [soapstones, setSoapstones] = useState<SoapstoneMessage[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Update container size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width || window.innerWidth,
          height: rect.height || window.innerHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [pathname]);

  // Fetch soapstone messages
  const fetchSoapstones = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/soapstone?limit=${maxSoapstones}`);
      if (!response.ok) return;

      const result = await response.json();
      if (result.ok && result.data?.items) {
        const messages = result.data.items.slice(0, maxSoapstones);
        // Map API response to component format
        const mappedMessages = messages.map(
          (msg: {
            id: string;
            text?: string;
            body?: string;
            x?: number | null;
            y?: number | null;
            appraises?: number;
            createdAt: string;
            user?: ApiSoapstoneUser | null;
          }): SoapstoneMessage => ({
            id: msg.id,
            text: msg.text || msg.body || '',
            x: msg.x ?? null,
            y: msg.y ?? null,
            appraises: msg.appraises || 0,
            createdAt: msg.createdAt || new Date().toISOString(),
            user: msg.user
              ? {
                  id: msg.user.id,
                  displayName: msg.user.displayName,
                  avatarUrl: msg.user.avatarUrl,
                }
              : undefined,
          }),
        );
        // Assign random positions if x/y not set
        const positionedMessages = mappedMessages.map((msg: SoapstoneMessage) => {
          if (msg.x === null || msg.y === null) {
            const padding = 50;
            const maxX = Math.max(0, containerSize.width - 300);
            const maxY = Math.max(0, containerSize.height - 150);
            return {
              ...msg,
              x: containerSize.width > 0 ? padding + Math.random() * maxX : null,
              y: containerSize.height > 0 ? padding + Math.random() * maxY : null,
            };
          }
          return msg;
        });
        setSoapstones(positionedMessages);
      }
    } catch (error) {
      logger.warn('[DarkSoulsSoapstones] Failed to fetch soapstones:', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
    }
  }, [maxSoapstones, containerSize]);

  // Initial load
  useEffect(() => {
    if (initialMessages.length > 0) {
      const positioned = initialMessages.map((msg) => {
        if (msg.x === null || msg.y === null) {
          const padding = 50;
          const maxX = Math.max(0, containerSize.width - 300);
          const maxY = Math.max(0, containerSize.height - 150);
          return {
            ...msg,
            x: containerSize.width > 0 ? padding + Math.random() * maxX : null,
            y: containerSize.height > 0 ? padding + Math.random() * maxY : null,
          };
        }
        return msg;
      });
      setSoapstones(positioned);
    } else if (containerSize.width > 0 && containerSize.height > 0) {
      fetchSoapstones();
    }
  }, [initialMessages, containerSize, fetchSoapstones]);

  // Refresh soapstones periodically
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchSoapstones, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchSoapstones, refreshInterval]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-30 pointer-events-none"
      aria-label="Soapstone messages layer"
    >
      {soapstones
        .filter((stone) => stone.x !== null && stone.y !== null)
        .map((stone) => (
          <SoapstoneMarker
            key={stone.id}
            id={stone.id}
            text={stone.text}
            x={stone.x!}
            y={stone.y!}
            appraises={stone.appraises}
            createdAt={stone.createdAt}
            user={stone.user}
          />
        ))}
    </div>
  );
}

interface SoapstoneMarkerProps {
  id: string;
  text: string;
  x: number;
  y: number;
  appraises: number;
  createdAt: string;
  user?: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

function SoapstoneMarker({ text, x, y, appraises, createdAt, user }: SoapstoneMarkerProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isGlowing, setIsGlowing] = useState(true);
  const rotation = useRef(Math.random() * 12 - 6); // -6° to +6°

  // Pulse glow effect - like Dark Souls
  useEffect(() => {
    const interval = setInterval(
      () => {
        setIsGlowing((prev) => !prev);
      },
      2000 + Math.random() * 1000,
    ); // 2-3 second pulse

    return () => clearInterval(interval);
  }, []);

  // Calculate age-based glow intensity
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  const glowIntensity = Math.max(0.3, 1 - ageHours / 48); // Fade over 48 hours

  const handleClick = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      // Auto-hide after 8 seconds
      setTimeout(() => setIsRevealed(false), 8000);
    } else {
      setIsRevealed(false);
    }
  };

  return (
    <div
      className="soapstone-marker absolute pointer-events-auto"
      style={
        {
          left: `${x}px`,
          top: `${y}px`,
          transform: `rotate(${rotation.current}deg)`,
          '--glow-intensity': glowIntensity.toString(),
          '--glow-active': isGlowing ? '1' : '0',
        } as React.CSSProperties & { '--glow-intensity': string; '--glow-active': string }
      }
    >
      {!isRevealed ? (
        // Collapsed state - Dark Souls soapstone with overlay (text hidden)
        <button
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
          className={`soapstone-marker-collapsed relative cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
            isGlowing ? 'soapstone-pulse-glow' : ''
          }`}
          style={{ opacity: 0.7 + glowIntensity * 0.3 }}
          aria-label="Reveal soapstone message"
        >
          {/* Soapstone card with overlay - text is hidden by CSS ::after overlay */}
          <div className="soapstone-card w-[120px] h-[80px] flex items-center justify-center relative">
            {/* Overlay is applied via CSS .soapstone-marker-collapsed .soapstone-card::after */}
            {/* Praise/appraises count badge - visible on overlay */}
            {appraises > 0 && (
              <div className="absolute -top-1 -right-1 z-10 text-xs font-bold text-yellow-300 bg-yellow-900/70 rounded-full w-6 h-6 flex items-center justify-center border border-yellow-400/50 shadow-lg">
                {appraises}
              </div>
            )}
          </div>
        </button>
      ) : (
        // Revealed state - Full message card (overlay removed, text visible)
        <button
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
          className="soapstone-message-revealed max-w-[260px] min-w-[200px] cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label="Hide soapstone message"
        >
          <div className="soapstone-card soapstone-enter bg-zinc-950/95 border border-pink-400/30 rounded-lg p-4 shadow-2xl">
            {/* No overlay ::after in revealed state - text is visible */}
            <div className="flex items-start gap-2 mb-2">
              {getUserAvatarUrl(user) ? (
                <img
                  src={getUserAvatarUrl(user)!}
                  alt={getUserDisplayName(user)}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-pink-500/30 flex items-center justify-center">
                  <span className="text-xs text-pink-300">{getUserInitials(user)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-pink-200 truncate">
                  {getUserDisplayName(user)}
                </p>
                <p className="text-xs text-pink-200/50">{formatTimeAgo(createdAt)}</p>
              </div>
              {appraises > 0 && (
                <div className="flex items-center gap-1 text-xs text-yellow-300">
                  <span>★</span>
                  <span>{appraises}</span>
                </div>
              )}
            </div>
            <p className="text-sm leading-relaxed text-pink-100 mb-2 whitespace-pre-wrap break-words">
              {text}
            </p>
            <p className="text-xs text-pink-200/40 text-center mt-2">Tap to hide</p>
          </div>
        </button>
      )}
    </div>
  );
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
