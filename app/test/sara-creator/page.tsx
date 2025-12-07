'use client';

/**
 * Sara Model Character Creator
 * Using the Goth Girl Sara Blender model as base
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import model (only client-side)
const SaraModel = dynamic(() => import('./ModelLoader'), { ssr: false });
const SaveModal = dynamic(() => import('../character-creator/SaveModal'), { ssr: false });

// Default config optimized for Sara model
const DEFAULT_CONFIG = {
  name: 'Sara (Blonde Version)',
  height: 1.0,
  breastSize: 1.3,
  hipWidth: 1.2,
  waistSize: 0.85,
  skinTone: '#fde4d0',
  skinGloss: 0.5,
  eyeSize: 1.2,
  showNudity: false,
  jiggleIntensity: 1.2,
  jiggleSpeed: 1.0,
  physicsDamping: 0.5,
  nipplesSize: 1.0,
  nipplesColor: '#f4a6b8',
  hairColor: '#f5deb3', // Blonde override
};

function Slider({ label, value, onChange, min = 0, max = 2, step = 0.05, description }: any) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-white">{label}</label>
        <span className="text-xs text-pink-300 font-mono">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-pink"
      />
      {description && <p className="text-xs text-white/50">{description}</p>}
    </div>

export default function SaraCreatorPage() {
  const [config, setConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sara-character-draft');
      if (saved) {
        try {
          return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
        } catch (e) {
          return DEFAULT_CONFIG;
        }
      }
    }
    return DEFAULT_CONFIG;
  });
  
  const [activeTab, setActiveTab] = useState<'body' | 'face' | 'appearance' | 'physics' | 'nsfw'>('body');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sara-character-draft', JSON.stringify(config));
    }
  }, [config]);
  
  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      <style dangerouslySetInnerHTML={{__html: `
        .slider-pink::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          cursor: pointer;
          box-shadow: 0 0 12px rgba(236, 72, 153, 0.6);
        }
      `}} />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 bg-gradient-to-b from-black/90 to-transparent">
        <h1 className="text-4xl font-bold text-white mb-1">
          ✨ Sara Character Creator (Blender Model)
        </h1>
        <p className="text-pink-200">Real 3D Model • AAA Quality • Full Parametric Control</p>
        {modelError && (
          <div className="mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-200 text-sm">⚠️ {modelError}</p>
            <p className="text-xs text-red-200/70 mt-1">Make sure to export the .blend file to .glb first!</p>
          </div>
        )}
      </div>
      
      {/* Control Panel */}
      <div className="absolute top-32 left-6 z-10 w-80 bg-black/80 backdrop-blur-lg rounded-xl border border-pink-500/30 overflow-hidden">
        <div className="grid grid-cols-5 border-b border-white/20">
          {(['body', 'face', 'appearance', 'physics', 'nsfw'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 py-3 text-xs font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="p-4 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
          {activeTab === 'body' && (
            <>
              <h4 className="text-pink-300 font-semibold text-sm">Body Sliders</h4>
              <Slider label="Height" value={config.height} onChange={(v: number) => updateConfig('height', v)} min={0.7} max={1.3} />
              <Slider label="Breast Size" value={config.breastSize} onChange={(v: number) => updateConfig('breastSize', v)} min={0.5} max={2.5} description="Uses model morphs if available" />
              <Slider label="Hip Width" value={config.hipWidth} onChange={(v: number) => updateConfig('hipWidth', v)} min={0.7} max={1.6} />
              <Slider label="Waist" value={config.waistSize} onChange={(v: number) => updateConfig('waistSize', v)} min={0.6} max={1.4} />
            </>
          )}
          
          {activeTab === 'face' && (
            <>
              <h4 className="text-pink-300 font-semibold text-sm">Facial Features</h4>
              <Slider label="Eye Size" value={config.eyeSize} onChange={(v: number) => updateConfig('eyeSize', v)} min={0.7} max={1.5} />
              <p className="text-xs text-white/60 mt-2">More face controls coming after model loads!</p>
            </>
          )}
          
          {activeTab === 'appearance' && (
            <>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Hair Color</label>
                <div className="flex gap-2">
                  {['#f5deb3', '#8b4513', '#000000', '#ff6b9d'].map(color => (
                    <button
                      key={color}
                      onClick={() => updateConfig('hairColor', color)}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${
                        config.hairColor === color ? 'border-pink-500 scale-110' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <Slider label="Skin Gloss" value={config.skinGloss} onChange={(v: number) => updateConfig('skinGloss', v)} min={0} max={1} />
              
              <div className="pt-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showNudity}
                    onChange={(e) => updateConfig('showNudity', e.target.checked)}
                    className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded"
                  />
                  <span className="text-sm text-white">Show Nudity (18+)</span>
                </label>
              </div>
            </>
          )}
          
          {activeTab === 'physics' && (
            <>
              <h4 className="text-pink-300 font-semibold text-sm">Jiggle Physics</h4>
              <Slider label="Intensity" value={config.jiggleIntensity} onChange={(v: number) => updateConfig('jiggleIntensity', v)} min={0.1} max={2.5} />
              <Slider label="Speed" value={config.jiggleSpeed} onChange={(v: number) => updateConfig('jiggleSpeed', v)} min={0.5} max={2.0} />
              <Slider label="Damping" value={config.physicsDamping} onChange={(v: number) => updateConfig('physicsDamping', v)} min={0} max={1} />
            </>
          )}
          
          {activeTab === 'nsfw' && (
            <>
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg mb-3">
                <p className="text-red-200 text-xs">⚠️ Adult Content (18+)</p>
              </div>
              
              {config.showNudity && (
                <>
                  <Slider label="Nipples Size" value={config.nipplesSize} onChange={(v: number) => updateConfig('nipplesSize', v)} min={0.5} max={2.0} />
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Nipples Color</label>
                    <input
                      type="color"
                      value={config.nipplesColor}
                      onChange={(e) => updateConfig('nipplesColor', e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
        
        <div className="p-4 border-t border-white/20 space-y-2">
          <button
            onClick={() => setShowSaveModal(true)}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg"
          >
            💾 Save Character
          </button>
        </div>
      </div>
      
      {/* 3D Viewport */}
      <div className="h-screen w-full">
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[0, 1, 3]} fov={50} />
          
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
          <pointLight position={[-3, 2, 2]} intensity={0.8} color="#ff69b4" />
          <pointLight position={[3, 2, 2]} intensity={0.8} color="#8b5cf6" />
          <hemisphereLight args={['#87CEEB', '#2d1b4e', 0.6]} />
          
          <Suspense fallback={
            <group>
              <mesh>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial color="#ec4899" wireframe />
              </mesh>
              <mesh position={[0, 1, 0]}>
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshBasicMaterial color="#8b5cf6" wireframe />
              </mesh>
            </group>
          }>
            <SaraModel config={config} />
            <Environment preset="sunset" />
          </Suspense>
          
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#2d1b4e" />
          </mesh>
          
          <OrbitControls
            enablePan={false}
            minDistance={1.5}
            maxDistance={5}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
          />
        </Canvas>
      </div>
      
      <div className="absolute bottom-6 right-6 z-10 bg-black/80 backdrop-blur-lg rounded-xl px-6 py-3 border border-pink-500/30">
        <div className="flex items-center space-x-4 text-sm">
          <div className="text-white/60">Model: <span className="text-pink-300">Goth Girl Sara v1.2</span></div>
          <div className="w-px h-4 bg-white/20" />
          <div className="text-white/60">Status: <span className="text-green-400">✓ Loaded</span></div>
        </div>
      </div>
      
      {showSaveModal && <SaveModal config={config} onClose={() => setShowSaveModal(false)} />}
    </div>
  );
}

