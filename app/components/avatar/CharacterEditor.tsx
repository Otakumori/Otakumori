'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import * as THREE from 'three';
import { AvatarEditor } from './Avatar3D';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import {
  avatarPartManager,
  type AvatarPartType,
  NSFW_MORPH_TARGETS,
} from '@/app/lib/3d/avatar-parts';

interface CharacterEditorProps {
  initialConfiguration?: AvatarConfiguration;
  onConfigurationChange?: (config: AvatarConfiguration) => void;
  onSave?: (config: AvatarConfiguration) => void;
  onUseInGame?: (config: AvatarConfiguration) => void;
  isGuest?: boolean;
  className?: string;
}

interface CameraPreset {
  id: string;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

interface PosePreset {
  id: string;
  name: string;
  animation: string;
  description: string;
  category: 'idle' | 'action' | 'emote' | 'dance' | 'nsfw';
}

interface BackgroundPreset {
  id: string;
  name: string;
  type: 'color' | 'gradient' | 'environment' | 'studio';
  value: string;
  hdrUrl?: string;
}

interface CustomizationPanelProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

function CustomizationPanel({
  title,
  children,
  collapsible = false,
  defaultCollapsed = false,
}: CustomizationPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <section className="mb-4 rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-lg">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="mb-3 flex w-full items-center justify-between text-left"
          aria-expanded={!isCollapsed}
        >
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className="text-xl text-white/60" aria-hidden="true">
            {isCollapsed ? 'â–¼' : 'â–²'}
          </span>
        </button>
      ) : (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}
      {!isCollapsed && <div className="space-y-3">{children}</div>}
    </section>
  );
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}

function SliderControl({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  format,
}: SliderControlProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-white/80">{label}</label>
        <span className="text-sm text-white/60 font-mono">
          {format ? format(value) : value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.2) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.2) 100%)`,
        }}
      />
    </div>
  );
}

interface ColorPickerProps {
  label: string;
  value: THREE.Color;
  onChange: (color: THREE.Color) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = new THREE.Color(e.target.value);
    onChange(color);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-white/80">{label}</label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={`#${value.getHexString()}`}
          onChange={handleColorChange}
          className="w-12 h-8 rounded border border-white/20 cursor-pointer"
        />
        <span className="text-sm text-white/60 font-mono">#{value.getHexString()}</span>
      </div>
    </div>
  );
}

interface PartSelectorProps {
  label: string;
  partType: AvatarPartType;
  currentPartId?: string;
  onPartChange: (partId: string) => void;
  showNsfwContent: boolean;
}

function PartSelector({
  label,
  partType,
  currentPartId,
  onPartChange,
  showNsfwContent,
  searchQuery = '',
  selectedCategory = 'all',
  resolveParts,
}: PartSelectorProps & {
  searchQuery?: string;
  selectedCategory?: string;
  resolveParts?: (type: AvatarPartType) => ReturnType<typeof avatarPartManager.getPartsByType>;
}) {
  const parts = useMemo(() => {
    if (resolveParts) {
      return resolveParts(partType);
    }
    const allParts = avatarPartManager.getPartsByType(partType);
    return allParts.filter((part) => {
      const matchesSearch =
        searchQuery === '' ||
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' ||
        part.category === selectedCategory ||
        (selectedCategory === 'nsfw' && part.contentRating !== 'sfw');

      const matchesContent =
        part.contentRating === 'sfw' ||
        (part.contentRating === 'nsfw' && showNsfwContent) ||
        (part.contentRating === 'explicit' && showNsfwContent);

      return matchesSearch && matchesCategory && matchesContent;
    });
  }, [partType, resolveParts, showNsfwContent, searchQuery, selectedCategory]);

  return (
    <div className="space-y-2">
      <label className="text-sm text-white/80">{label}</label>
      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
        {parts.map((part) => (
          <button
            key={part.id}
            onClick={() => onPartChange(part.id)}
            className={`p-2 rounded-lg border transition-all ${
              currentPartId === part.id
                ? 'border-pink-500 bg-pink-500/20 text-pink-100'
                : 'border-white/20 bg-white/5 hover:bg-white/10 text-white/80'
            }`}
          >
            <div className="text-xs font-medium truncate">{part.name}</div>
            <div className="text-xs text-white/60 capitalize">{part.contentRating}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Camera presets
const CAMERA_PRESETS: CameraPreset[] = [
  { id: 'front', name: 'Front View', position: [0, 1.5, 3], target: [0, 1.5, 0], fov: 50 },
  { id: 'side', name: 'Side View', position: [3, 1.5, 0], target: [0, 1.5, 0], fov: 50 },
  { id: 'back', name: 'Back View', position: [0, 1.5, -3], target: [0, 1.5, 0], fov: 50 },
  { id: 'close-up', name: 'Close-up', position: [0, 1.5, 1.5], target: [0, 1.5, 0], fov: 60 },
  { id: 'full-body', name: 'Full Body', position: [0, 2, 4], target: [0, 1, 0], fov: 45 },
  { id: 'low-angle', name: 'Low Angle', position: [0, 0.5, 2], target: [0, 1.5, 0], fov: 55 },
  { id: 'high-angle', name: 'High Angle', position: [0, 3, 2], target: [0, 1.5, 0], fov: 55 },
  { id: 'intimate', name: 'Intimate', position: [0, 1.2, 1], target: [0, 1.2, 0], fov: 70 },
];

// Pose presets
const POSE_PRESETS: PosePreset[] = [
  // Idle poses
  {
    id: 'idle-1',
    name: 'Casual Idle',
    animation: 'idle',
    description: 'Relaxed standing pose',
    category: 'idle',
  },
  {
    id: 'idle-2',
    name: 'Confident Idle',
    animation: 'idle_2',
    description: 'Confident standing pose',
    category: 'idle',
  },
  {
    id: 'idle-3',
    name: 'Shy Idle',
    animation: 'idle_3',
    description: 'Shy, reserved pose',
    category: 'idle',
  },

  // Action poses
  {
    id: 'walk',
    name: 'Walking',
    animation: 'walk',
    description: 'Walking animation',
    category: 'action',
  },
  {
    id: 'run',
    name: 'Running',
    animation: 'run',
    description: 'Running animation',
    category: 'action',
  },
  {
    id: 'jump',
    name: 'Jumping',
    animation: 'jump',
    description: 'Jumping pose',
    category: 'action',
  },
  {
    id: 'victory',
    name: 'Victory',
    animation: 'victory',
    description: 'Victory celebration',
    category: 'action',
  },

  // Emotes
  {
    id: 'happy',
    name: 'Happy',
    animation: 'happy',
    description: 'Happy expression',
    category: 'emote',
  },
  { id: 'wave', name: 'Waving', animation: 'wave', description: 'Waving hello', category: 'emote' },
  { id: 'bow', name: 'Bowing', animation: 'bow', description: 'Polite bow', category: 'emote' },
  {
    id: 'thumbs-up',
    name: 'Thumbs Up',
    animation: 'thumbs_up',
    description: 'Approval gesture',
    category: 'emote',
  },

  // Dance poses
  {
    id: 'dance-1',
    name: 'Dance 1',
    animation: 'dance_1',
    description: 'Energetic dance',
    category: 'dance',
  },
  {
    id: 'dance-2',
    name: 'Dance 2',
    animation: 'dance_2',
    description: 'Smooth dance',
    category: 'dance',
  },
  {
    id: 'dance-3',
    name: 'Dance 3',
    animation: 'dance_3',
    description: 'Sensual dance',
    category: 'dance',
  },

  // NSFW poses (only shown when appropriate)
  {
    id: 'nsfw-seductive',
    name: 'Seductive',
    animation: 'nsfw_seductive',
    description: 'Seductive pose',
    category: 'nsfw',
  },
  {
    id: 'nsfw-intimate',
    name: 'Intimate',
    animation: 'nsfw_intimate',
    description: 'Intimate pose',
    category: 'nsfw',
  },
];

// Background presets
const BACKGROUND_PRESETS: BackgroundPreset[] = [
  { id: 'studio-white', name: 'Studio White', type: 'color', value: '#FFFFFF' },
  { id: 'studio-gray', name: 'Studio Gray', type: 'color', value: '#808080' },
  { id: 'studio-black', name: 'Studio Black', type: 'color', value: '#000000' },
  {
    id: 'gradient-purple',
    name: 'Purple Gradient',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'gradient-pink',
    name: 'Pink Gradient',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: 'gradient-blue',
    name: 'Blue Gradient',
    type: 'gradient',
    value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    id: 'environment-sunset',
    name: 'Sunset Environment',
    type: 'environment',
    value: 'sunset',
    hdrUrl: '/assets/hdr/sunset.hdr',
  },
  {
    id: 'environment-sky',
    name: 'Sky Environment',
    type: 'environment',
    value: 'sky',
    hdrUrl: '/assets/hdr/sky.hdr',
  },
  { id: 'environment-studio', name: 'Studio Environment', type: 'studio', value: 'studio' },
];

export default function CharacterEditor({
  initialConfiguration,
  onConfigurationChange,
  onSave,
  onUseInGame,
  isGuest = false,
  className = '',
}: CharacterEditorProps) {
  const [configuration, setConfiguration] = useState<AvatarConfiguration>(() => {
    if (initialConfiguration) return initialConfiguration;

    // Create default configuration
    return avatarPartManager.createConfiguration('default-user', 'female');
  });

  const [activeTab, setActiveTab] = useState<
    'parts' | 'morphing' | 'materials' | 'lighting' | 'camera' | 'poses' | 'background'
  >('parts');
  const [showNsfwContent, setShowNsfwContent] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);

  // Camera and view controls
  const [currentCamera, setCurrentCamera] = useState<CameraPreset>(CAMERA_PRESETS[0]);
  const [cameraZoom, setCameraZoom] = useState(1);
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0 });

  // Pose controls
  const [currentPose, setCurrentPose] = useState<PosePreset>(POSE_PRESETS[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Background controls
  const [currentBackground, setCurrentBackground] = useState<BackgroundPreset>(
    BACKGROUND_PRESETS[0],
  );
  const [backgroundIntensity, setBackgroundIntensity] = useState(1);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Undo/Redo system
  const [history, setHistory] = useState<AvatarConfiguration[]>([configuration]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  // Comparison view
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonConfig, setComparisonConfig] = useState<AvatarConfiguration | null>(null);

  // Mobile and touch controls
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Update configuration and notify parent
  const updateConfiguration = useCallback(
    (updates: Partial<AvatarConfiguration>) => {
      const newConfig = { ...configuration, ...updates, updatedAt: new Date() };
      setConfiguration(newConfig);
      setIsDirty(true);

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newConfig);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      onConfigurationChange?.(newConfig);
    },
    [configuration, onConfigurationChange, history, historyIndex],
  );

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setConfiguration(history[newIndex]);
      setIsDirty(newIndex !== 0);
    }
  }, [historyIndex, history]);

  // Redo functionality
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setConfiguration(history[newIndex]);
      setIsDirty(newIndex !== history.length - 1);
    }
  }, [historyIndex, history]);

  // Save current state for comparison
  const saveForComparison = useCallback(() => {
    setComparisonConfig({ ...configuration });
  }, [configuration]);

  // Handle save
  const handleSave = useCallback(() => {
    onSave?.(configuration);
  }, [configuration, onSave]);

  // Screenshot capture
  const captureScreenshot = useCallback(async () => {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) return;

      const dataURL = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `avatar-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  }, []);

  // Filter parts based on search and category
  const filteredParts = useCallback(
    (partType: AvatarPartType) => {
      const parts = avatarPartManager.getPartsByType(partType);
      return parts.filter((part) => {
        const matchesSearch =
          searchQuery === '' ||
          part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          part.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === 'all' ||
          part.category === selectedCategory ||
          (selectedCategory === 'nsfw' && part.contentRating !== 'sfw');

        const matchesContent =
          part.contentRating === 'sfw' ||
          (part.contentRating === 'nsfw' && showNsfwContent) ||
          (part.contentRating === 'explicit' && showNsfwContent && ageVerified);

        return matchesSearch && matchesCategory && matchesContent;
      });
    },
    [searchQuery, selectedCategory, showNsfwContent, ageVerified],
  );

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setIsDragging(false);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > 10) {
        setIsDragging(true);

        // Handle camera rotation on touch
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe - rotate Y
          const rotationY = (deltaX / window.innerWidth) * 180;
          setCameraRotation((prev) => ({ ...prev, y: prev.y + rotationY * 0.1 }));
        } else {
          // Vertical swipe - rotate X
          const rotationX = (deltaY / window.innerHeight) * 180;
          setCameraRotation((prev) => ({ ...prev, x: prev.x + rotationX * 0.1 }));
        }
      }
    },
    [touchStart],
  );

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
    setIsDragging(false);
  }, []);

  // Pinch to zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (isMobile) {
        e.preventDefault();
        const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
        setCameraZoom((prev) => Math.max(0.5, Math.min(3, prev + zoomDelta)));
      }
    },
    [isMobile],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        if (
          tagName === 'INPUT' ||
          tagName === 'TEXTAREA' ||
          tagName === 'SELECT' ||
          target.isContentEditable
        ) {
          return;
        }
      }

      if (event.key === 'Tab') {
        return;
      }

      // Camera controls
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setCameraRotation((prev) => ({ ...prev, y: prev.y - 15 }));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setCameraRotation((prev) => ({ ...prev, y: prev.y + 15 }));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setCameraRotation((prev) => ({ ...prev, x: prev.x - 15 }));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setCameraRotation((prev) => ({ ...prev, x: prev.x + 15 }));
      }

      // Zoom controls
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        setCameraZoom((prev) => Math.min(3, prev + 0.1));
      } else if (event.key === '-') {
        event.preventDefault();
        setCameraZoom((prev) => Math.max(0.5, prev - 0.1));
      }

      // Reset controls
      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        setCameraZoom(1);
        setCameraRotation({ x: 0, y: 0 });
      }

      // Undo/Redo
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          undo();
        } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault();
          redo();
        } else if (event.key === 's') {
          event.preventDefault();
          handleSave();
        }
      }

      // Tab switching
      if (event.key >= '1' && event.key <= '7') {
        event.preventDefault();
        const tabIndex = parseInt(event.key, 10) - 1;
        const tabs = [
          'parts',
          'morphing',
          'materials',
          'lighting',
          'camera',
          'poses',
          'background',
        ];
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex] as any);
        }
      }

      // Screenshot
      if (event.key === 'p' || event.key === 'P') {
        event.preventDefault();
        captureScreenshot();
      }

      // Toggle comparison
      if (event.key === 'c' || event.key === 'C') {
        event.preventDefault();
        if (comparisonConfig) {
          setShowComparison(!showComparison);
        }
      }
    },
    [undo, redo, handleSave, captureScreenshot, comparisonConfig, showComparison],
  );

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [handleKeyDown]);

  // GLB export
  const exportGLB = useCallback(async () => {
    try {
      // This would integrate with the model loader to export the current configuration
      // as a GLB file with all parts and materials applied
      console.warn('GLB export functionality would be implemented here');
      alert('GLB export feature coming soon!');
    } catch (error) {
      console.error('Failed to export GLB:', error);
    }
  }, []);

  // Preset sharing
  const sharePreset = useCallback(async () => {
    try {
      const presetData = {
        configuration,
        camera: currentCamera,
        pose: currentPose,
        background: currentBackground,
        timestamp: new Date().toISOString(),
      };

      const shareUrl = `${window.location.origin}/character-editor?preset=${encodeURIComponent(JSON.stringify(presetData))}`;

      if (navigator.share) {
        await navigator.share({
          title: 'My Avatar Preset',
          text: 'Check out my custom avatar!',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Preset link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share preset:', error);
    }
  }, [configuration, currentCamera, currentPose, currentBackground]);

  // Update morph target
  const updateMorphTarget = useCallback(
    (targetName: string, value: number) => {
      const morphTarget = NSFW_MORPH_TARGETS[targetName];
      if (!morphTarget) return;

      const clampedValue = Math.max(morphTarget.min, Math.min(morphTarget.max, value));
      const newMorphTargets = { ...configuration.morphTargets, [targetName]: clampedValue };

      updateConfiguration({ morphTargets: newMorphTargets });
    },
    [configuration.morphTargets, updateConfiguration],
  );

  // Update part selection
  const updatePart = useCallback(
    (partType: AvatarPartType, partId: string) => {
      const newParts = { ...configuration.parts, [partType]: partId };
      updateConfiguration({ parts: newParts });
    },
    [configuration.parts, updateConfiguration],
  );

  // Update material override
  const updateMaterialOverride = useCallback(
    (slot: string, override: any) => {
      const newOverrides = { ...configuration.materialOverrides, [slot]: override };
      updateConfiguration({ materialOverrides: newOverrides });
    },
    [configuration.materialOverrides, updateConfiguration],
  );

  // Filter morph targets based on content settings
  const visibleMorphTargets = useMemo(() => {
    return Object.entries(NSFW_MORPH_TARGETS).filter(([_, morphTarget]) => {
      if (!morphTarget.adultContent) return true;
      return showNsfwContent && ageVerified;
    });
  }, [showNsfwContent, ageVerified]);

  return (
    <div
      className={`flex h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black ${isDragging ? 'cursor-grabbing touch-manipulation' : ''} ${className}`}
      role="main"
      aria-label="Character Editor"
    >
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="fixed top-4 left-4 z-50 bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-lg shadow-lg"
          aria-label="Toggle menu"
        >
          {sidebarCollapsed ? 'â˜°' : 'âœ•'}
        </button>
      )}

      {/* Left Panel - Controls */}
      <div
        className={`${
          isMobile
            ? `fixed top-0 left-0 h-full w-80 z-40 transform transition-transform duration-300 ${
                sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
              }`
            : 'w-80'
        } bg-black/20 backdrop-blur-lg border-r border-white/10 overflow-y-auto`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Character Editor</h1>
            <p className="text-white/60 text-sm">Create your perfect avatar</p>

            {/* Search and Filter */}
            <div className="mt-4 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search parts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    Ã—
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {['all', 'head', 'body', 'clothing', 'accessories', 'nsfw'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Settings */}
          <CustomizationPanel title="Content Settings" defaultCollapsed={true}>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showNsfwContent}
                  onChange={(e) => {
                    setShowNsfwContent(e.target.checked);
                    updateConfiguration({ showNsfwContent: e.target.checked });
                  }}
                  className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-white/80">Show NSFW Content</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageVerified}
                  onChange={(e) => {
                    setAgeVerified(e.target.checked);
                    updateConfiguration({ ageVerified: e.target.checked });
                  }}
                  className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
                />
                <span className="text-sm text-white/80">Age Verified (18+)</span>
              </label>
            </div>
          </CustomizationPanel>

          {/* Tab Navigation */}
          <div
            className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-white/10 p-1"
            role="tablist"
            aria-label="Character editor sections"
          >
            {[
              { id: 'parts', label: 'Parts', shortcut: '1' },
              { id: 'morphing', label: 'Morphing', shortcut: '2' },
              { id: 'materials', label: 'Materials', shortcut: '3' },
              { id: 'lighting', label: 'Lighting', shortcut: '4' },
              { id: 'camera', label: 'Camera', shortcut: '5' },
              { id: 'poses', label: 'Poses', shortcut: '6' },
              { id: 'background', label: 'Background', shortcut: '7' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                type="button"
                className={`rounded-md py-2 px-3 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-pink-500 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                aria-label={`${tab.label} tab (${tab.shortcut})`}
                aria-selected={activeTab === tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls={`panel-${tab.id}`}
              >
                {tab.label}
                <span className="ml-1 text-xs opacity-60">({tab.shortcut})</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'parts' && (
            <div id="panel-parts" role="tabpanel" aria-labelledby="tab-parts" className="space-y-4">
              {/* 90s Anime Presets */}
              <CustomizationPanel title="90s Anime Presets" collapsible defaultCollapsed={false}>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: 'sailor-moon',
                      name: 'Sailor Moon',
                      description: 'Magical girl style',
                      config: {
                        baseModel: 'female' as const,
                        parts: {
                          hair: 'hair_twin_tails',
                          clothing: 'clothing_sailor_uniform',
                        },
                        morphTargets: {
                          eyeSize: 1.5,
                          eyeShape: 1.0,
                          cheekbones: 0.7,
                        },
                        materialOverrides: {
                          hair: { slot: 'hair', type: 'color' as const, value: '#FFD700' },
                          clothing_primary: {
                            slot: 'clothing',
                            type: 'color' as const,
                            value: '#4169E1',
                          },
                        },
                      },
                    },
                    {
                      id: 'sakura-kinomoto',
                      name: 'Sakura',
                      description: 'Cardcaptor style',
                      config: {
                        baseModel: 'female' as const,
                        parts: {
                          hair: 'hair_short_bob',
                          clothing: 'clothing_school_uniform',
                        },
                        morphTargets: {
                          eyeSize: 1.4,
                          eyeShape: 0.9,
                          cheekbones: 0.6,
                        },
                        materialOverrides: {
                          hair: { slot: 'hair', type: 'color' as const, value: '#8B4513' },
                          clothing_primary: {
                            slot: 'clothing',
                            type: 'color' as const,
                            value: '#FF69B4',
                          },
                        },
                      },
                    },
                    {
                      id: 'anime-warrior',
                      name: 'Anime Warrior',
                      description: 'Fierce fighter',
                      config: {
                        baseModel: 'female' as const,
                        parts: {
                          hair: 'hair_long_pink',
                          clothing: 'clothing_samurai',
                        },
                        morphTargets: {
                          eyeSize: 1.3,
                          eyeShape: 0.8,
                          cheekbones: 0.5,
                        },
                        materialOverrides: {
                          hair: { slot: 'hair', type: 'color' as const, value: '#FF69B4' },
                          clothing_primary: {
                            slot: 'clothing',
                            type: 'color' as const,
                            value: '#8B0000',
                          },
                        },
                      },
                    },
                    {
                      id: 'cute-idol',
                      name: 'Cute Idol',
                      description: 'Pop star style',
                      config: {
                        baseModel: 'female' as const,
                        parts: {
                          hair: 'hair_long_flowing',
                          clothing: 'clothing_dance_outfit',
                        },
                        morphTargets: {
                          eyeSize: 1.6,
                          eyeShape: 1.0,
                          cheekbones: 0.8,
                        },
                        materialOverrides: {
                          hair: { slot: 'hair', type: 'color' as const, value: '#FF1493' },
                          clothing_primary: {
                            slot: 'clothing',
                            type: 'color' as const,
                            value: '#9370DB',
                          },
                        },
                      },
                    },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        const newConfig = {
                          ...configuration,
                          ...preset.config,
                          parts: { ...configuration.parts, ...preset.config.parts },
                          morphTargets: {
                            ...configuration.morphTargets,
                            ...preset.config.morphTargets,
                          },
                          materialOverrides: {
                            ...configuration.materialOverrides,
                            ...preset.config.materialOverrides,
                          },
                        };
                        setConfiguration(newConfig);
                        setIsDirty(true);
                        onConfigurationChange?.(newConfig);
                      }}
                      className="p-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-left transition-colors"
                    >
                      <div className="text-sm font-medium text-white">{preset.name}</div>
                      <div className="text-xs text-white/60 mt-1">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </CustomizationPanel>

              <CustomizationPanel title="Base Model">
                <div className="space-y-2">
                  {(['male', 'female'] as const).map((model) => (
                    <label key={model} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="baseModel"
                        value={model}
                        checked={configuration.baseModel === model}
                        onChange={(e) =>
                          updateConfiguration({ baseModel: e.target.value as 'male' | 'female' })
                        }
                        className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 focus:ring-pink-500"
                      />
                      <span className="text-sm text-white/80 capitalize">{model}</span>
                    </label>
                  ))}
                </div>
              </CustomizationPanel>

              <CustomizationPanel title="Head & Face">
                <PartSelector
                  label="Head"
                  partType="head"
                  currentPartId={configuration.parts.head}
                  onPartChange={(partId) => updatePart('head', partId)}
                  showNsfwContent={showNsfwContent}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  resolveParts={filteredParts}
                />
                <PartSelector
                  label="Hair"
                  partType="hair"
                  currentPartId={configuration.parts.hair}
                  onPartChange={(partId) => updatePart('hair', partId)}
                  showNsfwContent={showNsfwContent}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  resolveParts={filteredParts}
                />
              </CustomizationPanel>

              <CustomizationPanel title="Body">
                <PartSelector
                  label="Body"
                  partType="body"
                  currentPartId={configuration.parts.body}
                  onPartChange={(partId) => updatePart('body', partId)}
                  showNsfwContent={showNsfwContent}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  resolveParts={filteredParts}
                />
              </CustomizationPanel>

              <CustomizationPanel title="Clothing">
                <PartSelector
                  label="Clothing"
                  partType="clothing"
                  currentPartId={configuration.parts.clothing}
                  onPartChange={(partId) => updatePart('clothing', partId)}
                  showNsfwContent={showNsfwContent}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  resolveParts={filteredParts}
                />
                {showNsfwContent && (
                  <PartSelector
                    label="Lingerie"
                    partType="lingerie"
                    currentPartId={configuration.parts.lingerie}
                    onPartChange={(partId) => updatePart('lingerie', partId)}
                    showNsfwContent={showNsfwContent}
                    searchQuery={searchQuery}
                    selectedCategory={selectedCategory}
                    resolveParts={filteredParts}
                  />
                )}
              </CustomizationPanel>

              <CustomizationPanel title="Accessories">
                <PartSelector
                  label="Accessories"
                  partType="accessories"
                  currentPartId={configuration.parts.accessories}
                  onPartChange={(partId) => updatePart('accessories', partId)}
                  showNsfwContent={showNsfwContent}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  resolveParts={filteredParts}
                />
                {showNsfwContent && (
                  <PartSelector
                    label="Intimate Accessories"
                    partType="intimate_accessories"
                    currentPartId={configuration.parts.intimate_accessories}
                    onPartChange={(partId) => updatePart('intimate_accessories', partId)}
                    showNsfwContent={showNsfwContent}
                    searchQuery={searchQuery}
                    selectedCategory={selectedCategory}
                    resolveParts={filteredParts}
                  />
                )}
              </CustomizationPanel>
            </div>
          )}

          {activeTab === 'morphing' && (
            <div
              id="panel-morphing"
              role="tabpanel"
              aria-labelledby="tab-morphing"
              className="space-y-4"
            >
              {visibleMorphTargets.map(([targetName, morphTarget]) => (
                <CustomizationPanel key={targetName} title={morphTarget.name} collapsible>
                  <SliderControl
                    label={morphTarget.name}
                    value={configuration.morphTargets[targetName] ?? morphTarget.defaultValue}
                    min={morphTarget.min}
                    max={morphTarget.max}
                    step={0.01}
                    onChange={(value) => updateMorphTarget(targetName, value)}
                    format={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                </CustomizationPanel>
              ))}
            </div>
          )}

          {activeTab === 'materials' && (
            <div
              id="panel-materials"
              role="tabpanel"
              aria-labelledby="tab-materials"
              className="space-y-4"
            >
              <CustomizationPanel title="Skin Material">
                <ColorPicker
                  label="Skin Tone"
                  value={new THREE.Color(configuration.materialOverrides?.skin?.value || '#FFDBAC')}
                  onChange={(color) =>
                    updateMaterialOverride('skin', { type: 'color', value: color })
                  }
                />
                <SliderControl
                  label="Smoothness"
                  value={
                    typeof configuration.materialOverrides?.skin_smoothness?.value === 'number'
                      ? configuration.materialOverrides.skin_smoothness.value
                      : 0.8
                  }
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterialOverride('skin_smoothness', { type: 'value', value })
                  }
                />
              </CustomizationPanel>

              <CustomizationPanel title="Hair Material">
                <ColorPicker
                  label="Hair Color"
                  value={new THREE.Color(configuration.materialOverrides?.hair?.value || '#8B4513')}
                  onChange={(color) =>
                    updateMaterialOverride('hair', { type: 'color', value: color })
                  }
                />
                <SliderControl
                  label="Shine"
                  value={
                    typeof configuration.materialOverrides?.hair_shine?.value === 'number'
                      ? configuration.materialOverrides.hair_shine.value
                      : 0.6
                  }
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterialOverride('hair_shine', { type: 'value', value })
                  }
                />
              </CustomizationPanel>

              <CustomizationPanel title="Clothing Material">
                <ColorPicker
                  label="Primary Color"
                  value={
                    new THREE.Color(
                      configuration.materialOverrides?.clothing_primary?.value || '#FFFFFF',
                    )
                  }
                  onChange={(color) =>
                    updateMaterialOverride('clothing_primary', { type: 'color', value: color })
                  }
                />
                <SliderControl
                  label="Roughness"
                  value={
                    typeof configuration.materialOverrides?.clothing_roughness?.value === 'number'
                      ? configuration.materialOverrides.clothing_roughness.value
                      : 0.5
                  }
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(value) =>
                    updateMaterialOverride('clothing_roughness', { type: 'value', value })
                  }
                />
              </CustomizationPanel>
            </div>
          )}

          {activeTab === 'lighting' && (
            <div
              id="panel-lighting"
              role="tabpanel"
              aria-labelledby="tab-lighting"
              className="space-y-4"
            >
              <CustomizationPanel title="Lighting Preset">
                <div className="space-y-2">
                  {['studio', 'dramatic', 'soft', 'anime', 'intimate'].map((preset) => (
                    <label key={preset} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="lighting"
                        value={preset}
                        className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 focus:ring-pink-500"
                      />
                      <span className="text-sm text-white/80 capitalize">{preset}</span>
                    </label>
                  ))}
                </div>
              </CustomizationPanel>

              <CustomizationPanel title="Environment">
                <SliderControl
                  label="Environment Intensity"
                  value={0.8}
                  min={0}
                  max={2}
                  step={0.1}
                  onChange={() => {}}
                />
                <SliderControl
                  label="Ambient Light"
                  value={0.3}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={() => {}}
                />
              </CustomizationPanel>
            </div>
          )}

          {activeTab === 'camera' && (
            <div
              id="panel-camera"
              role="tabpanel"
              aria-labelledby="tab-camera"
              className="space-y-4"
            >
              <CustomizationPanel title="Camera Presets">
                <div className="grid grid-cols-2 gap-2">
                  {CAMERA_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setCurrentCamera(preset)}
                      className={`p-2 rounded-lg border transition-all text-left ${
                        currentCamera.id === preset.id
                          ? 'border-pink-500 bg-pink-500/20 text-pink-100'
                          : 'border-white/20 bg-white/5 hover:bg-white/10 text-white/80'
                      }`}
                    >
                      <div className="text-xs font-medium">{preset.name}</div>
                    </button>
                  ))}
                </div>
              </CustomizationPanel>

              <CustomizationPanel title="Camera Controls">
                <SliderControl
                  label="Zoom"
                  value={cameraZoom}
                  min={0.5}
                  max={3}
                  step={0.1}
                  onChange={setCameraZoom}
                  format={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <SliderControl
                  label="Rotation X"
                  value={cameraRotation.x}
                  min={-180}
                  max={180}
                  step={1}
                  onChange={(value) => setCameraRotation((prev) => ({ ...prev, x: value }))}
                  format={(value) => `${value.toFixed(0)}Â°`}
                />
                <SliderControl
                  label="Rotation Y"
                  value={cameraRotation.y}
                  min={-180}
                  max={180}
                  step={1}
                  onChange={(value) => setCameraRotation((prev) => ({ ...prev, y: value }))}
                  format={(value) => `${value.toFixed(0)}Â°`}
                />
              </CustomizationPanel>

              <CustomizationPanel title="Quick Actions">
                <div className="space-y-2">
                  <button
                    onClick={() => setCameraZoom(1)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                  >
                    Reset Zoom
                  </button>
                  <button
                    onClick={() => setCameraRotation({ x: 0, y: 0 })}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                  >
                    Reset Rotation
                  </button>
                </div>
              </CustomizationPanel>
            </div>
          )}

          {activeTab === 'poses' && (
            <div id="panel-poses" role="tabpanel" aria-labelledby="tab-poses" className="space-y-4">
              <CustomizationPanel title="Pose Categories">
                <div className="flex flex-wrap gap-2">
                  {['idle', 'action', 'emote', 'dance', ...(showNsfwContent ? ['nsfw'] : [])].map(
                    (category) => (
                      <button
                        key={category}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          currentPose.category === category
                            ? 'bg-pink-500 text-white'
                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                        }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ),
                  )}
                </div>
              </CustomizationPanel>

              <CustomizationPanel title="Available Poses">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {POSE_PRESETS.filter((pose) => showNsfwContent || pose.category !== 'nsfw').map(
                    (pose) => (
                      <button
                        key={pose.id}
                        onClick={() => {
                          setCurrentPose(pose);
                          setIsAnimating(true);
                          // Auto-stop animation after 3 seconds for looping animations
                          if (
                            ['idle', 'walk', 'run', 'dance_1', 'dance_2', 'dance_3'].includes(
                              pose.animation,
                            )
                          ) {
                            setTimeout(() => setIsAnimating(false), 3000);
                          }
                        }}
                        className={`w-full p-3 rounded-lg border transition-all text-left ${
                          currentPose.id === pose.id
                            ? 'border-pink-500 bg-pink-500/20 text-pink-100'
                            : 'border-white/20 bg-white/5 hover:bg-white/10 text-white/80'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium">{pose.name}</div>
                            <div className="text-xs text-white/60 mt-1">{pose.description}</div>
                          </div>
                          <div className="text-xs text-white/40 capitalize">{pose.category}</div>
                        </div>
                      </button>
                    ),
                  )}
                </div>
              </CustomizationPanel>

              <CustomizationPanel title="Animation Controls">
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnimating}
                      onChange={(e) => setIsAnimating(e.target.checked)}
                      className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm text-white/80">Enable Animation</span>
                  </label>
                  <button
                    onClick={() => setIsAnimating(!isAnimating)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                  >
                    {isAnimating ? 'Stop Animation' : 'Play Animation'}
                  </button>
                </div>
              </CustomizationPanel>
            </div>
          )}

          {activeTab === 'background' && (
            <div
              id="panel-background"
              role="tabpanel"
              aria-labelledby="tab-background"
              className="space-y-4"
            >
              <CustomizationPanel title="Background Presets">
                <div className="grid grid-cols-2 gap-2">
                  {BACKGROUND_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setCurrentBackground(preset)}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        currentBackground.id === preset.id
                          ? 'border-pink-500 bg-pink-500/20 text-pink-100'
                          : 'border-white/20 bg-white/5 hover:bg-white/10 text-white/80'
                      }`}
                    >
                      <div className="text-xs font-medium">{preset.name}</div>
                      <div className="text-xs text-white/60 capitalize mt-1">{preset.type}</div>
                    </button>
                  ))}
                </div>
              </CustomizationPanel>

              <CustomizationPanel title="Background Controls">
                <SliderControl
                  label="Intensity"
                  value={backgroundIntensity}
                  min={0}
                  max={2}
                  step={0.1}
                  onChange={setBackgroundIntensity}
                  format={(value) => `${(value * 100).toFixed(0)}%`}
                />
                <div className="space-y-2">
                  <label className="text-sm text-white/80" htmlFor="background-custom-color">
                    Custom Color
                  </label>
                  <input
                    type="color"
                    id="background-custom-color"
                    value={currentBackground.type === 'color' ? currentBackground.value : '#FFFFFF'}
                    onChange={(e) =>
                      setCurrentBackground({
                        id: 'custom',
                        name: 'Custom Color',
                        type: 'color',
                        value: e.target.value,
                      })
                    }
                    className="w-full h-10 rounded border border-white/20 cursor-pointer"
                  />
                </div>
              </CustomizationPanel>
            </div>
          )}

          {/* Undo/Redo Controls */}
          <div className="mt-4 flex space-x-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="flex-1 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/40 text-white py-2 px-3 rounded-lg transition-colors text-sm disabled:cursor-not-allowed"
            >
              â†¶ Undo
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="flex-1 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/40 text-white py-2 px-3 rounded-lg transition-colors text-sm disabled:cursor-not-allowed"
            >
              â†· Redo
            </button>
          </div>

          {/* Comparison Controls */}
          <div className="mt-4 flex space-x-2">
            <button
              onClick={saveForComparison}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg transition-colors text-sm"
            >
              ðŸ“¸ Save for Compare
            </button>
            <button
              onClick={() => setShowComparison(!showComparison)}
              disabled={!comparisonConfig}
              className="flex-1 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/40 text-white py-2 px-3 rounded-lg transition-colors text-sm disabled:cursor-not-allowed"
            >
              {showComparison ? 'Hide' : 'Show'} Compare
            </button>
          </div>

          {/* Export and Share Buttons */}
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={captureScreenshot}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                title="Capture screenshot"
              >
                ðŸ“¸ Screenshot
              </button>
              <button
                onClick={exportGLB}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                title="Export as GLB"
              >
                ðŸ“¦ Export GLB
              </button>
            </div>
            <button
              onClick={sharePreset}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
              title="Share preset"
            >
              ðŸ”— Share Preset
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            {onUseInGame && (
              <button
                onClick={() => onUseInGame(configuration)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <span role="img" aria-label="Game controller">
                  🎮
                </span>{' '}
                Use in Game
              </button>
            )}
            <button
              onClick={handleSave}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              <span role="img" aria-label="Floppy disk">
                💾
              </span>{' '}
              {isDirty ? 'Save Character*' : isGuest ? 'Save Temporarily' : 'Save Character'}
            </button>
            <button
              onClick={() => {
                const newConfig = avatarPartManager.createConfiguration('default-user', 'female');
                setConfiguration(newConfig);
                setHistory([newConfig]);
                setHistoryIndex(0);
                setIsDirty(false);
                onConfigurationChange?.(newConfig);
              }}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg transition-colors border border-white/20"
            >
              🔄 Reset to Default
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - 3D Preview */}
      <div className="flex-1 relative">
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              currentBackground.type === 'gradient'
                ? currentBackground.value
                : currentBackground.type === 'color'
                  ? currentBackground.value
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            opacity: backgroundIntensity,
          }}
        />

        {/* Main 3D View */}
        <div
          className={`${showComparison ? 'w-1/2' : 'w-full'} h-full relative z-10 transition-all duration-300`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          <Canvas
            camera={{
              position: [
                currentCamera.position[0] * cameraZoom,
                currentCamera.position[1] * cameraZoom,
                currentCamera.position[2] * cameraZoom,
              ],
              fov: currentCamera.fov,
            }}
            gl={{ antialias: true, alpha: true }}
            className="w-full h-full"
          >
            <Suspense fallback={null}>
              <AvatarEditor
                configuration={configuration}
                lighting="studio"
                enableControls={true}
                enableAnimations={isAnimating}
                showOutline={true}
                quality="high"
              />
            </Suspense>
          </Canvas>

          {/* View Label */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-lg rounded-lg px-3 py-2 text-white text-sm">
            Current View
          </div>

          {/* Mobile Touch Instructions */}
          {isMobile && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-lg rounded-lg px-3 py-2 text-white text-xs text-center">
              <div className="flex justify-center space-x-4">
                <span>ðŸ‘† Tap to select</span>
                <span>ðŸ‘‹ Swipe to rotate</span>
                <span>ðŸ” Pinch to zoom</span>
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-lg rounded-lg px-3 py-2 text-white text-xs">
            <div className="space-y-1">
              <div>Zoom: {(cameraZoom * 100).toFixed(0)}%</div>
              <div>FPS: 60</div>
              <div>Quality: high</div>
            </div>
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-lg rounded-lg px-3 py-2 text-white text-xs max-w-xs">
            <div className="font-semibold mb-2">Keyboard Shortcuts:</div>
            <div className="space-y-1 text-xs">
              <div>Arrow Keys: Rotate camera</div>
              <div>+/-: Zoom in/out</div>
              <div>R: Reset camera</div>
              <div>Ctrl+Z: Undo</div>
              <div>Ctrl+Y: Redo</div>
              <div>Ctrl+S: Save</div>
              <div>1-7: Switch tabs</div>
              <div>P: Screenshot</div>
              <div>C: Toggle compare</div>
            </div>
          </div>
        </div>

        {/* Comparison View */}
        {showComparison && comparisonConfig && (
          <div className="w-1/2 h-full absolute top-0 right-0 border-l border-white/20">
            <Canvas
              camera={{
                position: [
                  currentCamera.position[0] * cameraZoom,
                  currentCamera.position[1] * cameraZoom,
                  currentCamera.position[2] * cameraZoom,
                ],
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
                  showOutline={true}
                  quality="high"
                />
              </Suspense>
            </Canvas>

            {/* Comparison Label */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-lg rounded-lg px-3 py-2 text-white text-sm">
              Comparison View
            </div>

            {/* Close Comparison Button */}
            <button
              onClick={() => setShowComparison(false)}
              className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
            >
              Ã—
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
            <div className="text-white text-center">
              <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm">Loading avatar...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
