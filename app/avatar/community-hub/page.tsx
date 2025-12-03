/**
 * Avatar Community Hub - Main page
 * Standalone avatar creator with procedural generation
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { CharacterConfig } from './lib/character-state';
import { createDefaultConfig } from './lib/character-state';
import CharacterCanvas from './components/CharacterCanvas';
import UIControls from './components/UIControls';
import { ErrorBoundary } from './components/ErrorBoundary';
import type * as THREE from 'three';

// Dynamically import to avoid SSR issues with Three.js
const DynamicCanvas = dynamic(() => Promise.resolve(CharacterCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
        <p className="text-sm text-gray-400">Loading 3D Renderer...</p>
      </div>
    </div>
  ),
});

);
}
export default function AvatarCommunityHubPage() {
  const [config, setConfig] = useState<CharacterConfig>(createDefaultConfig());
  const sceneRef = useRef<THREE.Group | null>(null);

  const handleSceneReady = useCallback((scene: THREE.Group) => {
    sceneRef.current = scene;
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-purple-900 via-purple-800 to-black">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/40 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4">
            <h1 className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
              Avatar Creator
            </h1>
            <p className="mt-1 text-xs text-white/70 md:text-sm">
              Create your unique anime-style avatar with procedural generation
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          {/* Canvas - Right Side (Mobile: Full, Desktop: Left) */}
          <div className="flex-1 lg:order-2">
            <ErrorBoundary
              fallback={
                <div className="flex h-full items-center justify-center bg-black/80 p-8">
                  <div className="text-center">
                    <p className="text-white/70">Failed to load 3D renderer</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 rounded-lg bg-pink-500 px-4 py-2 text-sm text-white"
                    >
                      Reload
                    </button>
                  </div>
                </div>
              }
            >
              <DynamicCanvas
                config={config}
                showOutline={true}
                onSceneReady={handleSceneReady}
              />
            </ErrorBoundary>
          </div>

          {/* Controls - Left Side (Mobile: Bottom, Desktop: Right) */}
          <div className="h-96 w-full border-t border-white/10 lg:h-auto lg:w-96 lg:border-l lg:border-t-0">
            <ErrorBoundary
              fallback={
                <div className="flex h-full items-center justify-center p-4">
                  <p className="text-sm text-white/70">Failed to load controls</p>
                </div>
              }
            >
              <UIControls config={config} onConfigChange={setConfig} sceneRef={sceneRef} />
            </ErrorBoundary>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="border-t border-white/10 bg-black/40 backdrop-blur-lg px-4 py-2">
          <p className="text-xs text-white/50">
            No sign-in required • All processing happens in your browser • Export your avatar as
            JSON, GLB, or ZIP
          </p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

