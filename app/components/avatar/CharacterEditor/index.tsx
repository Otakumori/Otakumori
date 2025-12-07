'use client';

import React, {
  Suspense,
  useCallback,
  useMemo,
  useState,
  memo,
} from 'react';
import { Canvas } from '@react-three/fiber';

import { AvatarEditor } from '../Avatar3D';
import {
  avatarPartManager,
  NSFW_MORPH_TARGETS,
  type AvatarPartType,
  type AvatarConfiguration,
} from '@/app/lib/3d/avatar-parts';
import { BACKGROUND_PRESETS, POSE_PRESETS } from './constants';
import type {
  BackgroundPreset,
  CharacterEditorProps,
  PosePreset,
  CameraPreset,
} from './types';

import { useCharacterConfiguration } from './hooks/useCharacterConfiguration';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useCameraControls } from './hooks/useCameraControls';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useMobileControls } from './hooks/useMobileControls';

import { CustomizationPanel } from './CustomizationPanel';
import { PartsTab } from './tabs/PartsTab';
import { MorphingTab } from './tabs/MorphingTab';
import { MaterialsTab } from './tabs/MaterialsTab';
import { LightingTab } from './tabs/LightingTab';
import { CameraTab } from './tabs/CameraTab';
import { PosesTab } from './tabs/PosesTab';
import { BackgroundTab } from './tabs/BackgroundTab';
import { RenderingTab } from './tabs/RenderingTab';

import {
  captureScreenshot,
  exportGLB,
  sharePreset,
} from './utils/export';
import { createFilteredPartsFunction } from './utils/filtering';

type TabType =
  | 'parts'
  | 'morphing'
  | 'materials'
  | 'lighting'
  | 'camera'
  | 'poses'
  | 'background'
  | 'rendering';

const TABS: Array<{ id: TabType; label: string; shortcut: string }> = [
  { id: 'parts', label: 'Parts', shortcut: '1' },
  { id: 'morphing', label: 'Morphing', shortcut: '2' },
  { id: 'materials', label: 'Materials', shortcut: '3' },
  { id: 'lighting', label: 'Lighting', shortcut: '4' },
  { id: 'camera', label: 'Camera', shortcut: '5' },
  { id: 'poses', label: 'Poses', shortcut: '6' },
  { id: 'background', label: 'Background', shortcut: '7' },
  { id: 'rendering', label: 'Rendering', shortcut: '8' },
];

type QualityPreset = 'low' | 'medium' | 'high' | 'ultra';

interface CharacterPreviewProps {
  configuration: AvatarConfiguration;
  comparisonConfig: AvatarConfiguration | null;
  showComparison: boolean;
  isAnimating: boolean;
  isMobile: boolean;
  cameraZoom: number;
  currentCamera: CameraPreset;
  backgroundStyle: React.CSSProperties;
  handleTouchStart: React.TouchEventHandler<HTMLDivElement>;
  handleTouchMove: React.TouchEventHandler<HTMLDivElement>;
  handleTouchEnd: React.TouchEventHandler<HTMLDivElement>;
  handleWheel: React.WheelEventHandler<HTMLDivElement>;
  setShowComparison: (value: boolean) => void;

const CharacterPreview = memo(function CharacterPreview({
  configuration,
  comparisonConfig,
  showComparison,
  isAnimating,
  isMobile,
  cameraZoom,
  currentCamera,
  backgroundStyle,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleWheel,
  setShowComparison,
}: CharacterPreviewProps) {
  // Mobile-aware quality defaults
  const defaultQuality: QualityPreset = isMobile ? 'medium' : 'high';
  const quality: QualityPreset =
    (configuration.qualityPreset as QualityPreset) ?? defaultQuality;

  const comparisonQuality: QualityPreset = comparisonConfig
    ? (comparisonConfig.qualityPreset as QualityPreset) ?? defaultQuality
    : defaultQuality;

  // Memoize camera position to prevent unnecessary re-renders
  const cameraPosition = useMemo(
    () => [
      currentCamera.position[0] * cameraZoom,
      currentCamera.position[1] * cameraZoom,
      currentCamera.position[2] * cameraZoom,
    ] as [number, number, number],
    [currentCamera.position, cameraZoom],
  );

  return (
    <div className="flex-1 relative">
      {/* Background */}
      <div className="absolute inset-0" style={backgroundStyle} />

      {/* Main Preview */}
      <div
        className={`${showComparison ? 'w-1/2' : 'w-full'} h-full relative z-10 transition-all duration-300`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <Canvas
          camera={{
            position: cameraPosition,
            fov: currentCamera.fov,
          }}
          gl={{ antialias: true, alpha: true }}
          className="w-full h-full"
        >
          <Suspense fallback={null}>
            <AvatarEditor
              configuration={configuration}
              lighting="studio"
              enableControls
              enableAnimations={isAnimating}
              showOutline
              quality={quality}
              celShadingConfig={configuration.celShadingConfig}
              physicsConfig={configuration.physicsConfig}
            />
          </Suspense>
        </Canvas>

        {/* View Label */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-lg rounded-lg px-3 py-2 text-white text-sm">
          Current View
        </div>

        {/* Mobile Controls Help */}
        {isMobile && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-lg rounded-lg px-3 py-2 text-white text-xs text-center">
            <div className="flex justify-center space-x-4">
              <span>
                <span role="img" aria-label="Pointing up">
                  <span role="img" aria-label="emoji">�</span>�
                </span>{' '}
                Tap to select
              </span>
              <span>
                <span role="img" aria-label="Waving hand">
                  <span role="img" aria-label="emoji">�</span>�
                </span>{' '}
                Swipe to rotate
              </span>
              <span>
                <span role="img" aria-label="Pinching fingers">
                  <span role="img" aria-label="emoji">�</span>�
                </span>{' '}
                Pinch to zoom
              </span>
            </div>
          </div>
        )}

        {/* Performance Info */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-lg rounded-lg px-3 py-2 text-white text-xs">
          <div className="space-y-1">
            <div>Zoom: {(cameraZoom * 100).toFixed(0)}%</div>
            <div>FPS: 60</div>
            <div>Quality: {quality}</div>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-lg rounded-lg px-3 py-2 text-white text-xs max-w-xs">
          <div className="font-semibold mb-2">Keyboard Shortcuts:</div>
          <div className="space-y-1 text-xs">
            <div>Arrow Keys: Rotate camera</div>
            <div>+ / - : Zoom in/out</div>
            <div>R: Reset camera</div>
            <div>Ctrl + Z: Undo</div>
            <div>Ctrl + Y: Redo</div>
            <div>Ctrl + S: Save</div>
            <div>1 - 8: Switch tabs</div>
            <div>P: Screenshot</div>
            <div>C: Toggle compare</div>
          </div>
        </div>

        {/* Comparison View */}
        {showComparison && comparisonConfig && (
          <div className="w-1/2 h-full absolute top-0 right-0 border-l border-white/20">
            <Canvas
              camera={{
                position: cameraPosition,
                fov: currentCamera.fov,
              }}
              gl={{ antialias: true, alpha: true }}
              className="w-full h-full"
            >
              <Suspense fallback={null}>
                <AvatarEditor
                  configuration={comparisonConfig}
                  lighting="studio"
                  enableControls={false}
                  enableAnimations={false}
                  showOutline
                  quality={comparisonQuality}
                  celShadingConfig={comparisonConfig.celShadingConfig}
                  physicsConfig={comparisonConfig.physicsConfig}
                />
              </Suspense>
            </Canvas>

            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-lg rounded-lg px-3 py-2 text-white text-sm">
              Comparison View
            </div>

            <button
              type="button"
              onClick={() => setShowComparison(false)}
              className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
              aria-label="Close comparison"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default function CharacterEditor({
  initialConfiguration,
  onConfigurationChange,
  onSave,
  onUseInGame,
  isGuest = false,
  className = '',
}: CharacterEditorProps) {
  // UI State
  const [activeTab, setActiveTab] = useState<TabType>('parts');
  const [showNsfwContent, setShowNsfwContent] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const [currentBackground, setCurrentBackground] =
    useState<BackgroundPreset>(BACKGROUND_PRESETS[0]);
  const [backgroundIntensity, setBackgroundIntensity] = useState(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<string>('all');

  const [showComparison, setShowComparison] = useState(false);
  const [comparisonConfig, setComparisonConfig] = useState<
    typeof initialConfiguration | null
  >(null);

  const [currentPose] = useState<PosePreset>(POSE_PRESETS[0]);

  // Configuration State
  const {
    configuration,
    setConfiguration,
    updateConfiguration,
  } = useCharacterConfiguration(
    initialConfiguration,
    onConfigurationChange,
  );

  // Undo/Redo System
  const {
    isDirty,
    setIsDirty,
    addToHistory,
    undo: undoHistory,
    redo: redoHistory,
    resetHistory,
    canUndo,
    canRedo,
  } = useUndoRedo(configuration);

  // Camera Controls
  const {
    currentCamera,
    setCurrentCamera,
    cameraZoom,
    setCameraZoom,
    cameraRotation,
    setCameraRotation,
    resetCamera,
  } = useCameraControls();

  // Mobile Controls
  const {
    isMobile,
    isDragging,
    sidebarCollapsed,
    setSidebarCollapsed,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
  } = useMobileControls({
    setCameraRotation,
    setCameraZoom,
  });

  // Configuration Update Handler
  const handleConfigurationUpdate = useCallback(
    (updates: Parameters<typeof updateConfiguration>[0]) => {
      const newConfig = updateConfiguration(updates);
      addToHistory(newConfig);
      return newConfig;
    },
    [updateConfiguration, addToHistory],
  );

  // Undo/Redo Handlers
  const undo = useCallback(() => {
    const config = undoHistory();
    if (config) {
      setConfiguration(config);
      onConfigurationChange?.(config);
    }
  }, [undoHistory, setConfiguration, onConfigurationChange]);

  const redo = useCallback(() => {
    const config = redoHistory();
    if (config) {
      setConfiguration(config);
      onConfigurationChange?.(config);
    }
  }, [redoHistory, setConfiguration, onConfigurationChange]);

  // Action Handlers
  const handleSave = useCallback(() => {
    onSave?.(configuration);
    setIsDirty(false);
  }, [configuration, onSave, setIsDirty]);

  const handleCaptureScreenshot = useCallback(async () => {
    await captureScreenshot();
  }, []);

  const handleExportGLB = useCallback(async () => {
    await exportGLB();
  }, []);

  const handleSharePreset = useCallback(async () => {
    await sharePreset(
      configuration,
      currentCamera,
      currentPose,
      currentBackground,
    );
  }, [configuration, currentCamera, currentPose, currentBackground]);

  const saveForComparison = useCallback(() => {
    setComparisonConfig({ ...configuration });
  }, [configuration]);

  const handleReset = useCallback(() => {
    const newConfig = avatarPartManager.createConfiguration(
      'default-user',
      'female',
    );
    setConfiguration(newConfig);
    resetHistory(newConfig);
    setIsDirty(false);
    onConfigurationChange?.(newConfig);
  }, [setConfiguration, resetHistory, setIsDirty, onConfigurationChange]);

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    setActiveTab: (tab) => setActiveTab(tab as TabType),
    setCameraRotation,
    setCameraZoom,
    resetCamera,
    undo,
    redo,
    handleSave,
    captureScreenshot: handleCaptureScreenshot,
    showComparison,
    comparisonConfig,
    setShowComparison,
  });

  // Filtered Parts Function
  const filteredParts = useMemo(
    () =>
      createFilteredPartsFunction(
        searchQuery,
        selectedCategory,
        showNsfwContent,
        ageVerified,
      ),
    [searchQuery, selectedCategory, showNsfwContent, ageVerified],
  );

  // Part Update Handlers
  const updateMorphTarget = useCallback(
    (targetName: string, value: number) => {
      const morphTarget = NSFW_MORPH_TARGETS[targetName];
      if (!morphTarget) return;

      const clampedValue = Math.max(
        morphTarget.min,
        Math.min(morphTarget.max, value),
      );

      handleConfigurationUpdate({
        morphTargets: {
          ...configuration.morphTargets,
          [targetName]: clampedValue,
        },
      });
    },
    [configuration.morphTargets, handleConfigurationUpdate],
  );

  const updatePart = useCallback(
    (partType: AvatarPartType, partId: string) => {
      handleConfigurationUpdate({
        parts: { ...configuration.parts, [partType]: partId },
      });
    },
    [configuration.parts, handleConfigurationUpdate],
  );

  const updateMaterialOverride = useCallback(
    (slot: string, override: unknown) => {
      handleConfigurationUpdate({
        materialOverrides: {
          ...configuration.materialOverrides,
          [slot]: override as typeof configuration.materialOverrides[string],
        },
      });
    },
    [configuration.materialOverrides, handleConfigurationUpdate],
  );

  // Background Style
  const backgroundStyle = useMemo(() => {
    if (
      currentBackground.type === 'gradient' ||
      currentBackground.type === 'color'
    ) {
      return {
        background: currentBackground.value,
        opacity: backgroundIntensity,
      };
    }

    return {
      background:
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      opacity: backgroundIntensity,
    };
  }, [currentBackground, backgroundIntensity]);

  return (
    <div
      className={`flex h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black ${isDragging ? 'cursor-grabbing touch-manipulation' : ''} ${className}`}
      role="main"
      aria-label="Character Editor"
    >
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="fixed top-4 left-4 z-50 bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-lg shadow-lg transition-colors"
          aria-label="Toggle menu"
          aria-expanded={!sidebarCollapsed ? 'true' : 'false'}
        >
          {sidebarCollapsed ? '☰' : '✕'}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`${isMobile
          ? `fixed top-0 left-0 h-full w-80 z-40 transform transition-transform duration-300 ${sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}`
          : 'w-80'
          } bg-black/20 backdrop-blur-lg border-r border-white/10 overflow-y-auto`}
      >
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Character Editor
        </h1>
        <p className="text-white/60 text-sm">
          Create your perfect avatar
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mt-4 space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search parts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
            aria-label="Search parts"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {['all', 'head', 'body', 'clothing', 'accessories', 'nsfw'].map(
            (category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedCategory === category
                  ? 'bg-pink-500 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                aria-pressed={selectedCategory === category ? 'true' : 'false'}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Content Settings */}
      <CustomizationPanel title="Content Settings" defaultCollapsed>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showNsfwContent}
              onChange={(e) => {
                setShowNsfwContent(e.target.checked);
                handleConfigurationUpdate({
                  showNsfwContent: e.target.checked,
                });
              }}
              className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
              aria-label="Show NSFW content"
            />
            <span className="text-sm text-white/80">Show NSFW Content</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={ageVerified}
              onChange={(e) => {
                setAgeVerified(e.target.checked);
                handleConfigurationUpdate({
                  ageVerified: e.target.checked,
                });
              }}
              className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
              aria-label="Age verified 18+"
            />
            <span className="text-sm text-white/80">Age Verified(18+)</span>
          </label>
        </div>
      </CustomizationPanel>

      {/* Tab Navigation */}
      <div
        className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-white/10 p-1"
        role="tablist"
        aria-label="Character editor sections"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-md py-2 px-3 text-sm font-medium transition-all ${activeTab === tab.id
              ? 'bg-pink-500 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            aria-label={`${tab.label} tab (${tab.shortcut})`}
            aria-selected={activeTab === tab.id ? 'true' : 'false'}
            role="tab"
            id={`tab-${tab.id}`}
            aria-controls={`panel-${tab.id}`}
          >
            {tab.label}
            <span className="ml-1 text-xs opacity-60">
              ({tab.shortcut})
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'parts' && (
        <PartsTab
          configuration={configuration}
          updateConfiguration={handleConfigurationUpdate}
          updatePart={updatePart}
          showNsfwContent={showNsfwContent}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          filteredParts={filteredParts}
          onConfigurationChange={onConfigurationChange}
        />
      )}

      {activeTab === 'morphing' && (
        <MorphingTab
          configuration={configuration}
          updateMorphTarget={updateMorphTarget}
          showNsfwContent={showNsfwContent}
          ageVerified={ageVerified}
        />
      )}

      {activeTab === 'materials' && (
        <MaterialsTab
          configuration={configuration}
          updateMaterialOverride={updateMaterialOverride}
        />
      )}

      {activeTab === 'lighting' && <LightingTab />}

      {activeTab === 'camera' && (
        <CameraTab
          currentCamera={currentCamera}
          setCurrentCamera={setCurrentCamera}
          cameraZoom={cameraZoom}
          setCameraZoom={setCameraZoom}
          cameraRotation={cameraRotation}
          setCameraRotation={setCameraRotation}
          resetCamera={resetCamera}
        />
      )}

      {activeTab === 'poses' && (
        <PosesTab
          showNsfwContent={showNsfwContent}
          onAnimationChange={setIsAnimating}
        />
      )}

      {activeTab === 'background' && (
        <BackgroundTab
          currentBackground={currentBackground}
          setCurrentBackground={setCurrentBackground}
          backgroundIntensity={backgroundIntensity}
          setBackgroundIntensity={setBackgroundIntensity}
        />
      )}

      {activeTab === 'rendering' && (
        <RenderingTab
          configuration={configuration}
          updateConfiguration={handleConfigurationUpdate}
        />
      )}

      {/* Undo/Redo Controls */}
      <div className="mt-4 flex space-x-2">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="flex-1 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/40 text-white py-2 px-3 rounded-lg transition-colors text-sm disabled:cursor-not-allowed"
          aria-label="Undo"
        >
          ↶ Undo
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className="flex-1 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/40 text-white py-2 px-3 rounded-lg transition-colors text-sm disabled:cursor-not-allowed"
          aria-label="Redo"
        >
          ↷ Redo
        </button>
      </div>

      {/* Comparison Controls */}
      <div className="mt-4 flex space-x-2">
        <button
          type="button"
          onClick={saveForComparison}
          className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg transition-colors text-sm"
          aria-label="Save for comparison"
        >
          <span role="img" aria-label="Camera">
            <span role="img" aria-label="emoji">�</span>�
          </span>{' '}
          Save for Compare
        </button>
        <button
          type="button"
          onClick={() => setShowComparison(!showComparison)}
          disabled={!comparisonConfig}
          className="flex-1 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/40 text-white py-2 px-3 rounded-lg transition-colors text-sm disabled:cursor-not-allowed"
          aria-label={showComparison ? 'Hide comparison' : 'Show comparison'}
        >
          {showComparison ? 'Hide' : 'Show'} Compare
        </button>
      </div>

      {/* Export Controls */}
      <div className="mt-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCaptureScreenshot}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
            title="Capture screenshot"
            aria-label="Capture screenshot"
          >
            <span role="img" aria-label="Camera">
              <span role="img" aria-label="emoji">�</span>�
            </span>{' '}
            Screenshot
          </button>
          <button
            type="button"
            onClick={handleExportGLB}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
            title="Export as GLB"
            aria-label="Export as GLB"
          >
            <span role="img" aria-label="Package">
              <span role="img" aria-label="emoji">�</span>�
            </span>{' '}
            Export GLB
          </button>
        </div>
        <button
          type="button"
          onClick={handleSharePreset}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
          title="Share preset"
          aria-label="Share preset"
        >
          <span role="img" aria-label="Link">
            <span role="img" aria-label="emoji">�</span>�
          </span>{' '}
          Share Preset
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        {onUseInGame && (
          <button
            type="button"
            onClick={() => onUseInGame(configuration)}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            aria-label="Use character in game"
          >
            <span role="img" aria-label="Game controller">
              <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
            </span>{' '}
            Use in Game
          </button>
        )}

        <button
          type="button"
          onClick={handleSave}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          aria-label="Save character"
        >
          <span role="img" aria-label="Floppy disk">
            <span role="img" aria-label="emoji">�</span>�
          </span>{' '}
          {isDirty
            ? 'Save Character*'
            : isGuest
              ? 'Save Temporarily'
              : 'Save Character'}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-colors border border-white/20"
          aria-label="Reset to default"
        >
          <span role="img" aria-label="Reset">
            <span role="img" aria-label="emoji">�</span>�
          </span>{' '}
          Reset to Default
        </button>
      </div>
      </div>
    </div>

    {/* 3D Preview Area */}
    <CharacterPreview
      configuration={configuration}
      comparisonConfig={comparisonConfig ?? null}
      showComparison={showComparison}
      isAnimating={isAnimating}
      isMobile={isMobile}
      cameraZoom={cameraZoom}
      currentCamera={currentCamera}
      backgroundStyle={backgroundStyle}
      handleTouchStart={handleTouchStart}
      handleTouchMove={handleTouchMove}
      handleTouchEnd={handleTouchEnd}
      handleWheel={handleWheel}
      setShowComparison={setShowComparison}
    />
  </div>
  );
}
