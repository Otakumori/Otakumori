import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';

/**
 * Device profile detection for performance optimization
 */

export type DeviceProfile = 'low' | 'medium' | 'high';

/**
 * Detect device performance profile
 */
export function detectDeviceProfile(): DeviceProfile {
  if (typeof window === 'undefined') {
    return 'medium';
  }

  let score = 0;

  // Check WebGL capabilities
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (gl) {
      // Check max texture size
      const maxTextureSize = (gl as WebGLRenderingContext).getParameter(
        (gl as WebGLRenderingContext).MAX_TEXTURE_SIZE,
      );
      if (maxTextureSize >= 8192) score += 2;
      else if (maxTextureSize >= 4096) score += 1;

      // Check supported extensions
      const extensions = (gl as WebGLRenderingContext).getSupportedExtensions() || [];
      if (extensions.length > 20) score += 2;
      else if (extensions.length > 10) score += 1;
    }
  } catch (error) {
    logger.warn('WebGL check failed:', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
  }

  // Check hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency) {
    if (navigator.hardwareConcurrency >= 8) score += 2;
    else if (navigator.hardwareConcurrency >= 4) score += 1;
  }

  // Check device memory (if available)
  if ('deviceMemory' in navigator) {
    const memory = (navigator as any).deviceMemory;
    if (memory >= 8) score += 2;
    else if (memory >= 4) score += 1;
  }

  // Check connection type (if available)
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    if (conn && conn.effectiveType) {
      if (conn.effectiveType === '4g') score += 1;
    }
  }

  // Determine profile from score
  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

/**
 * Get cached device profile or detect
 */
export function getDeviceProfile(): DeviceProfile {
  if (typeof window === 'undefined') {
    return 'medium';
  }

  const cached = localStorage.getItem('om_device_profile') as DeviceProfile | null;
  if (cached && ['low', 'medium', 'high'].includes(cached)) {
    return cached;
  }

  const profile = detectDeviceProfile();
  localStorage.setItem('om_device_profile', profile);
  return profile;
}

/**
 * Save device profile
 */
export function saveDeviceProfile(profile: DeviceProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('om_device_profile', profile);
  }
}

/**
 * Get performance settings based on profile
 */
export function getPerformanceSettings(profile: DeviceProfile) {
  const settings = {
    low: {
      renderMode: '2d' as const,
      maxParticles: 50,
      shadowQuality: 'none' as const,
      antialiasing: false,
      postProcessing: false,
      physics: 'simple' as const,
    },
    medium: {
      renderMode: 'hybrid' as const,
      maxParticles: 200,
      shadowQuality: 'low' as const,
      antialiasing: true,
      postProcessing: false,
      physics: 'full' as const,
    },
    high: {
      renderMode: '3d' as const,
      maxParticles: 500,
      shadowQuality: 'high' as const,
      antialiasing: true,
      postProcessing: true,
      physics: 'full' as const,
    },
  };

  return settings[profile];
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
