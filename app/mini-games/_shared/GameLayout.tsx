/**
 * Standardized Game Layout Component
 *
 * Provides a consistent responsive layout pattern for all games:
 * - Desktop: Left/center = game canvas, right = controls/instructions panel
 * - Mobile: Game first, then instructions/controls stacked below
 */

'use client';

import { type ReactNode } from 'react';

export interface GameLayoutProps {
  children: ReactNode;
  gameCanvas: ReactNode;
  controlsPanel?: ReactNode;
  instructionsPanel?: ReactNode;
  className?: string;
}

/**
 * Standardized game layout component
 * Ensures consistent responsive layout across all games
 */
export function GameLayout({
  children,
  gameCanvas,
  controlsPanel,
  instructionsPanel,
  className = '',
}: GameLayoutProps) {
  return (
    <div className={`min-h-screen w-full ${className}`}>
      {/* Desktop Layout: Side-by-side */}
      <div className="hidden lg:flex h-screen">
        {/* Left/Center: Game Canvas */}
        <div className="flex-1 relative overflow-hidden">{gameCanvas}</div>

        {/* Right: Controls and Instructions Panel */}
        {(controlsPanel || instructionsPanel) && (
          <div className="w-80 border-l border-white/10 bg-black/20 backdrop-blur-sm overflow-y-auto">
            <div className="p-4 space-y-4">
              {instructionsPanel && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  {instructionsPanel}
                </div>
              )}
              {controlsPanel && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  {controlsPanel}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Layout: Stacked */}
      <div className="lg:hidden flex flex-col min-h-screen">
        {/* Game Canvas - Full Width */}
        <div className="flex-1 relative min-h-[60vh]">{gameCanvas}</div>

        {/* Instructions and Controls - Stacked Below */}
        {(controlsPanel || instructionsPanel) && (
          <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="p-4 space-y-4">
              {instructionsPanel && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  {instructionsPanel}
                </div>
              )}
              {controlsPanel && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  {controlsPanel}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Additional children (overlays, modals, etc.) */}
      {children}
    </div>
  );
}

/**
 * Simplified game layout for games that only need canvas
 * No side panels, just the game area
 */
export function SimpleGameLayout({
  children,
  gameCanvas,
  className = '',
}: {
  children?: ReactNode;
  gameCanvas: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen w-full relative ${className}`}>
      {gameCanvas}
      {children}
    </div>
  );
}

