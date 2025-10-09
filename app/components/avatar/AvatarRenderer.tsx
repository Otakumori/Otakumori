'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AvatarRenderer as R3FAvatarRenderer } from '../../adults/_components/AvatarRenderer.safe';
import { AvatarCard } from './AvatarCard';

interface AvatarRendererProps {
  config: any;
  mode?: '2d' | '3d' | 'hybrid' | 'auto';
  size?: 'small' | 'medium' | 'large';
  interactions?: boolean;
  physics?: boolean;
  className?: string;
  fallbackTo2D?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function AvatarRenderer({
  config,
  mode = 'auto',
  size = 'medium',
  interactions = true,
  physics = true,
  className = '',
  fallbackTo2D = true,
  onLoad,
  onError,
}: AvatarRendererProps) {
  const [renderMode, setRenderMode] = useState<'2d' | '3d'>(
    mode === 'auto' ? '3d' : mode === 'hybrid' ? '3d' : (mode as '2d' | '3d'),
  );
  const [is3DSupported, setIs3DSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Check WebGL support
  useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error('WebGL support check failed:', error);
        return false;
      }
    };

    const supported = checkWebGLSupport();
    setIs3DSupported(supported);

    if (!supported && mode === 'auto') {
      setRenderMode('2d');
    }
  }, [mode]);

  // Size configurations
  const sizeConfig = useMemo(() => {
    const configs = {
      small: {
        width: 48,
        height: 48,
        canvasSize: 128,
        detail: 'low',
      },
      medium: {
        width: 128,
        height: 128,
        canvasSize: 256,
        detail: 'medium',
      },
      large: {
        width: 256,
        height: 256,
        canvasSize: 512,
        detail: 'high',
      },
      xlarge: {
        width: 512,
        height: 512,
        canvasSize: 1024,
        detail: 'ultra',
      },
    };
    return configs[size];
  }, [size]);

  // Handle 3D rendering errors
  const handle3DError = (error: Error) => {
    console.error('3D rendering failed, falling back to 2D:', error);
    setHasError(true);

    if (fallbackTo2D) {
      setRenderMode('2d');
    }

    onError?.(error);
  };

  // Handle successful 3D loading
  const handle3DLoad = () => {
    console.warn('3D avatar loaded successfully');
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  // Initialize 3D handlers on mount
  useEffect(() => {
    if (renderMode === '3d' && !is3DSupported) {
      handle3DError(new Error('WebGL not supported'));
    } else if (renderMode === '3d') {
      handle3DLoad();
    }
  }, [renderMode, is3DSupported]);

  // Render 2D Avatar
  const render2D = () => (
    <motion.div
      className={`${className} relative`}
      style={{ width: sizeConfig.width, height: sizeConfig.height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AvatarCard config={config} size={size} className="w-full h-full" />
    </motion.div>
  );

  // Render 3D Avatar
  const render3D = () => (
    <motion.div
      className={`${className} relative`}
      style={{ width: sizeConfig.width, height: sizeConfig.height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <R3FAvatarRenderer
        config={config}
        size={size}
        showInteractions={interactions}
        physicsEnabled={physics}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );

  // Render Hybrid (2D with 3D effects)
  const renderHybrid = () => (
    <motion.div
      className={`${className} relative`}
      style={{ width: sizeConfig.width, height: sizeConfig.height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 2D Base */}
      <div className="absolute inset-0">
        <AvatarCard config={config} size={size} className="w-full h-full" />
      </div>

      {/* 3D Effects Overlay (simplified) */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="w-full h-full bg-gradient-to-t from-pink-500/10 to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </motion.div>
  );

  // Determine render mode
  const shouldRender3D = renderMode === '3d' && is3DSupported && !hasError;
  const shouldRenderHybrid = mode === 'hybrid' || (mode === 'auto' && size === 'large');

  // Render based on mode
  if (shouldRenderHybrid) {
    return renderHybrid();
  } else if (shouldRender3D) {
    return render3D();
  } else {
    return render2D();
  }
}

// Performance-optimized version for game use
export function GameAvatarRenderer({
  config,
  gameMode = 'action',
  performance = 'balanced',
  className = '',
  ...props
}: AvatarRendererProps & {
  gameMode?: 'action' | 'puzzle' | 'strategy' | 'rhythm';
  performance?: 'low' | 'balanced' | 'high';
}) {
  // Adjust rendering based on game mode and performance
  const renderMode = useMemo(() => {
    if (performance === 'low') return '2d';
    if (performance === 'high') return '3d';
    if (gameMode === 'action') return 'hybrid'; // Action games benefit from effects
    if (gameMode === 'puzzle') return '2d'; // Puzzle games need clarity
    if (gameMode === 'strategy') return 'hybrid'; // Strategy games can handle some effects
    if (gameMode === 'rhythm') return '3d'; // Rhythm games benefit from 3D
    return 'auto';
  }, [gameMode, performance]);

  const size = useMemo(() => {
    if (gameMode === 'action') return 'large';
    if (gameMode === 'puzzle') return 'medium';
    if (gameMode === 'strategy') return 'medium';
    if (gameMode === 'rhythm') return 'large';
    return 'medium';
  }, [gameMode]);

  return (
    <AvatarRenderer
      config={config}
      mode={renderMode}
      size={size}
      interactions={gameMode !== 'puzzle'}
      physics={gameMode === 'action' || gameMode === 'rhythm'}
      className={className}
      {...props}
    />
  );
}

export default AvatarRenderer;
