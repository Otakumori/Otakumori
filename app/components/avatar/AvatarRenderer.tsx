'use client';

import { logger } from '@/app/lib/logger';
import { useState, useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AvatarRenderer as R3FAvatarRenderer } from '../../adults/_components/AvatarRenderer.safe';
import { AvatarCard } from './AvatarCard';
import { AvatarSkeleton } from './AvatarSkeleton';
import { AvatarFallback } from './AvatarFallback';
import { getAvatarDimensions, type AvatarSize } from '@/app/lib/avatar-sizes';

interface AvatarRendererProps {
  config: any;
  mode?: '2d' | '3d' | 'hybrid' | 'auto';
  size?: AvatarSize;
  interactions?: boolean;
  physics?: boolean;
  className?: string;
  fallbackTo2D?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  avatarMode?: 'preset' | 'user' | 'auto'; // Avatar mode for fallback handling
}

export function AvatarRenderer({
  config,
  mode = 'auto',
  size = 'md',
  interactions = true,
  physics = true,
  className = '',
  fallbackTo2D = true,
  avatarMode = 'auto',
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
        logger.error('WebGL support check failed:', undefined, undefined, error);
        return false;
      }
    };

    const supported = checkWebGLSupport();
    setIs3DSupported(supported);

    if (!supported && mode === 'auto') {
      setRenderMode('2d');
    }
  }, [mode]);

  const reducedMotion = useReducedMotion();

  // Use canonical avatar size system
  const sizeConfig = useMemo(() => {
    return getAvatarDimensions(size);
  }, [size]);

  // Handle 3D rendering errors
  const handle3DError = (error: Error) => {
    logger.error('3D rendering failed, falling back to 2D:', undefined, undefined, error);
    setHasError(true);

    if (fallbackTo2D) {
      setRenderMode('2d');
    }

    onError?.(error);
  };

  // Handle successful 3D loading
  const handle3DLoad = () => {
    logger.warn('3D avatar loaded successfully');
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
  const render2D = () => {
    // Map canonical size to legacy AvatarCard size
    const cardSize =
      size === 'xs' || size === 'sm'
        ? 'small'
        : size === 'lg' || size === 'xl'
          ? 'large'
          : 'medium';

    return (
      <motion.div
        className={`${className} relative`}
        style={{ width: sizeConfig.width, height: sizeConfig.height }}
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
      >
        {config ? (
          <AvatarCard config={config} size={cardSize} className="w-full h-full" />
        ) : (
          <AvatarFallback
            size={size}
            mode={avatarMode === 'auto' ? 'guest' : avatarMode}
            className="w-full h-full"
          />
        )}
      </motion.div>
    );
  };

  // Render 3D Avatar
  const render3D = () => (
    <motion.div
      className={`${className} relative`}
      style={{ width: sizeConfig.width, height: sizeConfig.height }}
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      {config ? (
        <R3FAvatarRenderer
          config={config}
          size={size}
          showInteractions={interactions && !reducedMotion}
          physicsEnabled={physics && !reducedMotion}
        />
      ) : (
        <AvatarFallback
          size={size}
          mode={avatarMode === 'auto' ? 'guest' : avatarMode}
          className="w-full h-full"
        />
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <AvatarSkeleton size={size} />
        </div>
      )}
    </motion.div>
  );

  // Render Hybrid (2D with 3D effects)
  const renderHybrid = () => {
    const cardSize =
      size === 'xs' || size === 'sm'
        ? 'small'
        : size === 'lg' || size === 'xl'
          ? 'large'
          : 'medium';

    return (
      <motion.div
        className={`${className} relative`}
        style={{ width: sizeConfig.width, height: sizeConfig.height }}
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
      >
        {/* 2D Base */}
        <div className="absolute inset-0">
          <AvatarCard config={config} size={cardSize} className="w-full h-full" />
        </div>

        {/* 3D Effects Overlay (simplified) */}
        {!reducedMotion && (
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
        )}
      </motion.div>
    );
  };

  // Determine render mode
  const shouldRender3D = renderMode === '3d' && is3DSupported && !hasError && !reducedMotion;
  const shouldRenderHybrid =
    (mode === 'hybrid' || (mode === 'auto' && (size === 'lg' || size === 'xl'))) && !reducedMotion;

  // Show skeleton while loading
  if (isLoading && !hasError) {
    return <AvatarSkeleton size={size} className={className} />;
  }

  // Show fallback on error or missing config
  if (hasError || !config) {
    return (
      <AvatarFallback
        size={size}
        mode={avatarMode === 'auto' ? 'guest' : avatarMode}
        className={className}
      />
    );
  }

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

  const avatarSize = useMemo(() => {
    if (gameMode === 'action') return 'lg';
    if (gameMode === 'puzzle') return 'md';
    if (gameMode === 'strategy') return 'md';
    if (gameMode === 'rhythm') return 'lg';
    return 'md';
  }, [gameMode]);

  return (
    <AvatarRenderer
      config={config}
      mode={renderMode}
      size={avatarSize}
      interactions={gameMode !== 'puzzle'}
      physics={gameMode === 'action' || gameMode === 'rhythm'}
      className={className}
      {...props}
    />
  );
}

export default AvatarRenderer;
