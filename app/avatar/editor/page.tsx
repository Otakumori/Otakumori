/**
 * Avatar Editor Page
 * Full-featured avatar customization with 3D preview
 */

'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import AvatarEditorPanel from '../../components/avatar/AvatarEditorPanel';

// Dynamically import 3D renderer to avoid SSR issues
const AvatarRenderer3D = dynamic(() => import('@/app/components/avatar/AvatarRenderer3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-b from-gray-900 to-black">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
        <p className="text-sm text-gray-400">Loading 3D Renderer...</p>
      </div>
    </div>
  ),
});

export default function AvatarEditorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl p-4 md:p-8"
      >
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-5xl font-bold text-transparent">
            Avatar Creator
          </h1>
          <p className="text-lg text-gray-300">
            Design your unique anime-style avatar with advanced customization
          </p>
        </div>

        {/* Main Editor Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 3D Preview */}
          <div className="order-2 lg:order-1">
            <div className="sticky top-4">
              <Suspense
                fallback={
                  <div className="flex h-[600px] w-full items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-b from-gray-900 to-black">
                    <div className="text-center">
                      <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
                      <p className="text-sm text-gray-400">Loading Preview...</p>
                    </div>
                  </div>
                }
              >
                <AvatarRenderer3D
                  height={600}
                  enableControls
                  autoRotate={false}
                  className="shadow-2xl"
                />
              </Suspense>

              {/* Quick Actions */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10">
                  <span role="img" aria-label="Camera">
                    <span role="img" aria-label="emoji">�</span>�
                  </span>{' '}
                  Take Screenshot
                </button>
                <button className="rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10">
                  <span role="img" aria-label="Movie camera">
                    <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
                  </span>{' '}
                  Record Animation
                </button>
              </div>

              {/* Context Adaptation Preview */}
              <div className="mt-4 rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-lg">
                <h3 className="mb-3 text-sm font-bold text-white">Context Preview</h3>
                <div className="grid grid-cols-4 gap-2">
                  {['Default', 'Game', 'Combat', 'Social'].map((context) => (
                    <button
                      key={context}
                      className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white transition-colors hover:bg-pink-500/30"
                    >
                      {context}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Editor Panel */}
          <div className="order-1 lg:order-2">
            <div className="h-[800px] overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-lg shadow-2xl">
              <AvatarEditorPanel />
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-white/20 bg-white/5 p-6 backdrop-blur-lg">
            <div className="mb-3 text-3xl">
              <span role="img" aria-label="Art palette">
                <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
              </span>
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">Procedural Textures</h3>
            <p className="text-sm text-gray-400">
              Unique textures generated on-the-fly using advanced algorithms
            </p>
          </div>

          <div className="rounded-xl border border-white/20 bg-white/5 p-6 backdrop-blur-lg">
            <div className="mb-3 text-3xl">
              <span role="img" aria-label="Theater masks">
                <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
              </span>
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">Context Adaptation</h3>
            <p className="text-sm text-gray-400">
              Avatar changes appearance based on game environment and situation
            </p>
          </div>

          <div className="rounded-xl border border-white/20 bg-white/5 p-6 backdrop-blur-lg">
            <div className="mb-3 text-3xl">
              <span role="img" aria-label="Lock">
                <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
              </span>
            </div>
            <h3 className="mb-2 text-lg font-bold text-white">NSFW Support</h3>
            <p className="text-sm text-gray-400">
              Age-gated mature content options with privacy controls
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
