/**
 * React Feature Flag Hooks and Context
 *
 * This module provides React-specific utilities for feature flags including:
 * - React Context for client-side flag management
 * - Custom hooks for easy flag consumption
 * - SSR-safe hydration
 * - Loading states and error handling
 */

'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  type FeatureFlagKey,
  type FeatureFlagValue,
  type FeatureFlagContext,
  type FeatureFlagEvaluationContext,
} from './types';
import { getFeatureFlagProvider } from './provider';
import { env } from '@/env.mjs';

// Create the React context
const FeatureFlagCtx = createContext<FeatureFlagContext | null>(null);

interface FeatureFlagProviderProps {
  children: ReactNode;
  initialFlags?: Map<FeatureFlagKey, FeatureFlagValue>;
  context?: Partial<FeatureFlagEvaluationContext>;
}

/**
 * Feature Flag Provider Component
 *
 * Wraps the application to provide feature flag context to all child components.
 * Handles SSR hydration and client-side flag evaluation.
 */
export function FeatureFlagProvider({
  children,
  initialFlags = new Map(),
  context = {},
}: FeatureFlagProviderProps) {
  const [flags, setFlags] = useState<Map<FeatureFlagKey, FeatureFlagValue>>(initialFlags);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Create evaluation context
  const evaluationContext: FeatureFlagEvaluationContext = {
    environment: env.NODE_ENV || 'development',
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    locale: typeof navigator !== 'undefined' ? navigator.language : undefined,
    ...context,
  };

  /**
   * Refresh all flags from the provider
   */
  const refresh = useCallback(async () => {
    if (typeof window === 'undefined') return; // Skip on server

    setIsLoading(true);
    setError(null);

    try {
      const provider = getFeatureFlagProvider();
      const newFlags = new Map<FeatureFlagKey, FeatureFlagValue>();

      // Evaluate all flags in parallel for better performance
      const flagKeys = Object.keys({
        GAMECUBE_BOOT_ANIMATION: true,
        GAMECUBE_BOOT_FREQUENCY: true,
        GAMECUBE_AUDIO_ENABLED: true,
        PERFORMANCE_MONITORING_LEVEL: true,
        MINI_GAMES_ENABLED: true,
        PRINTIFY_INTEGRATION_V2: true,
        DARK_GLASS_THEME_V2: true,
        GA4_ENHANCED_TRACKING: true,
        // Add other critical flags for client-side evaluation
      }) as FeatureFlagKey[];

      const evaluations = await Promise.allSettled(
        flagKeys.map(async (key) => {
          const value = await provider.evaluateFlag(key, evaluationContext);
          return { key, value };
        }),
      );

      evaluations.forEach((result) => {
        if (result.status === 'fulfilled') {
          newFlags.set(result.value.key, result.value.value);
        }
      });

      setFlags(newFlags);
    } catch (err) {
      console.error('Failed to refresh feature flags:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [evaluationContext]);

  /**
   * Check if a feature flag is enabled
   */
  const isEnabled = useCallback(
    (key: FeatureFlagKey): boolean => {
      const value = flags.get(key);
      return Boolean(value);
    },
    [flags],
  );

  /**
   * Get a feature flag value with type safety
   */
  const getValue = useCallback(
    <T extends FeatureFlagValue>(key: FeatureFlagKey, defaultValue?: T): T => {
      const value = flags.get(key);
      return (value as T) ?? (defaultValue as T);
    },
    [flags],
  );

  // Hydrate flags on client-side mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !isHydrated) {
      setIsHydrated(true);
      refresh();
    }
  }, [refresh, isHydrated]);

  // Set up polling for flag updates (optional)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(
      () => {
        if (!isLoading) {
          refresh();
        }
      },
      5 * 60 * 1000,
    ); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [refresh, isLoading]);

  const contextValue: FeatureFlagContext = {
    flags,
    isEnabled,
    getValue,
    refresh,
    isLoading,
    error,
  };

  return <FeatureFlagCtx.Provider value={contextValue}>{children}</FeatureFlagCtx.Provider>;
}

/**
 * Hook to access the feature flag context
 */
export function useFeatureFlags(): FeatureFlagContext {
  const context = useContext(FeatureFlagCtx);

  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }

  return context;
}

/**
 * Hook to check if a specific feature is enabled
 */
export function useFeatureFlag(key: FeatureFlagKey): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(key);
}

/**
 * Hook to get a feature flag value with type safety
 */
export function useFeatureFlagValue<T extends FeatureFlagValue>(
  key: FeatureFlagKey,
  defaultValue?: T,
): T {
  const { getValue } = useFeatureFlags();
  return getValue(key, defaultValue);
}

/**
 * Component for conditional rendering based on feature flags
 */
interface FeatureFlagProps {
  flag: FeatureFlagKey;
  children: ReactNode;
  fallback?: ReactNode;
  inverse?: boolean;
}

export function FeatureFlag({
  flag,
  children,
  fallback = null,
  inverse = false,
}: FeatureFlagProps) {
  const isEnabled = useFeatureFlag(flag);
  const shouldRender = inverse ? !isEnabled : isEnabled;

  return <>{shouldRender ? children : fallback}</>;
}

/**
 * Higher-order component for feature flag wrapping
 */
export function withFeatureFlag<P extends object>(
  flag: FeatureFlagKey,
  Component: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<P>,
) {
  return function WrappedComponent(props: P) {
    const isEnabled = useFeatureFlag(flag);

    if (!isEnabled && FallbackComponent) {
      return <FallbackComponent {...props} />;
    }

    if (!isEnabled) {
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Hook for A/B testing with feature flags
 */
export function useABTest(testKey: string): string | null {
  const { getValue } = useFeatureFlags();

  // Map test keys to feature flag keys
  const flagKey = testKey.toUpperCase().replace(/[^A-Z_]/g, '_') as FeatureFlagKey;

  return getValue(flagKey, '') as string | null;
}

/**
 * Debug component for development
 */
export function FeatureFlagDebugger() {
  const { flags, isLoading, error, refresh } = useFeatureFlags();

  if (env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.9)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px',
        maxHeight: '400px',
        overflow: 'auto',
      }}
    >
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        Feature Flags Debug
        <button
          onClick={refresh}
          disabled={isLoading}
          style={{ marginLeft: '10px', fontSize: '10px' }}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>}

      <div>
        {Array.from(flags.entries()).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '5px' }}>
            <strong>{key}:</strong> {String(value)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * SSR-safe feature flag evaluation
 */
export function useSSRSafeFeatureFlag(key: FeatureFlagKey, serverValue?: boolean): boolean {
  const [clientValue, setClientValue] = useState(serverValue ?? false);
  const { isEnabled } = useFeatureFlags();

  useEffect(() => {
    setClientValue(isEnabled(key));
  }, [key, isEnabled]);

  return clientValue;
}
