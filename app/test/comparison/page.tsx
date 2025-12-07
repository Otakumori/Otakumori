'use client';

/**
 * Character Comparison Page
 * See all versions side-by-side
 */

export default function ComparisonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black p-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        🔥 Character Creator Versions
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Simple 3D Test */}
        <a href="/test/simple-3d" className="block group">
          <div className="bg-black/50 backdrop-blur-lg rounded-xl border border-pink-500/30 p-6 hover:border-pink-500 transition-all">
            <h3 className="text-2xl font-bold text-white mb-2">🧪 Simple 3D Test</h3>
            <p className="text-pink-200 text-sm mb-4">
              Minimal test page with basic cube
            </p>
            <div className="space-y-2 text-xs text-white/60">
              <div>✅ Tests Three.js setup</div>
              <div>✅ One slider</div>
              <div>✅ Debug tool</div>
            </div>
            <div className="mt-4 px-4 py-2 bg-pink-500/20 rounded-lg text-pink-300 text-sm text-center group-hover:bg-pink-500/30 transition-colors">
              Open Test →
            </div>
          </div>
        </a>
        
        {/* Basic Character Creator */}
        <a href="/test/character-3d" className="block group">
          <div className="bg-black/50 backdrop-blur-lg rounded-xl border border-pink-500/30 p-6 hover:border-pink-500 transition-all">
            <h3 className="text-2xl font-bold text-white mb-2">🎮 Basic Creator</h3>
            <p className="text-pink-200 text-sm mb-4">
              First version with physics test
            </p>
            <div className="space-y-2 text-xs text-white/60">
              <div>✅ Spring physics</div>
              <div>✅ Mouse interaction</div>
              <div>✅ Basic character</div>
            </div>
            <div className="mt-4 px-4 py-2 bg-pink-500/20 rounded-lg text-pink-300 text-sm text-center group-hover:bg-pink-500/30 transition-colors">
              Open Creator →
            </div>
          </div>
        </a>
        
        {/* Ultimate Creator */}
        <a href="/test/ultimate-creator" className="block group">
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl border-2 border-pink-500 p-6 hover:border-pink-400 transition-all shadow-lg shadow-pink-500/20">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold text-white">✨ Ultimate Creator</h3>
              <span className="px-2 py-1 bg-pink-500 text-white text-xs rounded-full">BEST</span>
            </div>
            <p className="text-pink-200 text-sm mb-4">
              Enhanced procedural with AAA quality
            </p>
            <div className="space-y-2 text-xs text-white/80">
              <div>✨ <strong>Smooth high-poly meshes</strong></div>
              <div>✨ <strong>Detailed anime eyes</strong></div>
              <div>✨ <strong>3D nose & lips</strong></div>
              <div>✨ <strong>Layered blonde hair</strong></div>
              <div>✨ <strong>White & gold bikini</strong></div>
              <div>✨ <strong>Teardrop breasts</strong></div>
              <div>✨ <strong>60+ sliders</strong></div>
            </div>
            <div className="mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-white text-sm text-center font-semibold group-hover:from-pink-600 group-hover:to-purple-700 transition-all">
              Open Ultimate Creator →
            </div>
          </div>
        </a>
        
        {/* Sara Model Creator */}
        <a href="/test/sara-creator" className="block group md:col-span-3">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-lg rounded-xl border-2 border-purple-500 p-8 hover:border-purple-400 transition-all shadow-lg shadow-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-3xl font-bold text-white">🎨 Sara Model Creator</h3>
              <span className="px-3 py-1 bg-purple-500 text-white text-sm rounded-full">BLENDER MODEL</span>
              <span className="px-3 py-1 bg-yellow-500 text-black text-sm rounded-full">EXPORT FIRST</span>
            </div>
            <p className="text-purple-200 mb-6">
              Uses your Goth Girl Sara Blender model • Real AAA topology • All sliders control actual mesh
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-semibold mb-3">Features:</h4>
                <div className="space-y-2 text-sm text-white/80">
                  <div>🎭 Real 3D model from Blender</div>
                  <div>💎 Professional topology</div>
                  <div>🎨 Morph targets for sliders</div>
                  <div>💀 Bone-based physics</div>
                  <div>✨ Auto-blonde hair conversion</div>
                  <div>🔥 Male morphing system</div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Export Instructions:</h4>
                <div className="space-y-2 text-sm text-purple-200">
                  <div>1. Open Blender</div>
                  <div>2. File → Export → glTF 2.0</div>
                  <div>3. Format: <strong>glTF Binary (.glb)</strong></div>
                  <div>4. Enable: Shape Keys, Skinning</div>
                  <div>5. Save to: <code className="text-xs bg-black/50 px-2 py-1 rounded">public/models/goth-girl-sara.glb</code></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg text-white text-center font-semibold group-hover:from-purple-600 group-hover:to-pink-700 transition-all">
              Open Sara Creator →
            </div>
          </div>
        </a>
      </div>
      
      {/* Bottom instructions */}
      <div className="mt-12 max-w-4xl mx-auto bg-black/50 backdrop-blur-lg rounded-xl border border-pink-500/30 p-8">
        <h3 className="text-2xl font-bold text-white mb-4">🎯 Recommended Testing Order:</h3>
        <div className="space-y-4 text-white/80">
          <div className="flex items-start gap-3">
            <span className="text-2xl">1️⃣</span>
            <div>
              <strong className="text-pink-300">Ultimate Creator</strong> - Test this NOW! It looks WAY better with the enhanced character.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">2️⃣</span>
            <div>
              <strong className="text-purple-300">Export Sara model</strong> - Follow EXPORT_BLENDER_INSTRUCTIONS.md
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">3️⃣</span>
            <div>
              <strong className="text-pink-300">Sara Creator</strong> - Once GLB is exported, this will be PERFECT!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

