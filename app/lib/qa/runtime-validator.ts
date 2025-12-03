/**
 * Runtime QA Validator
 * Lightweight runtime validation for development mode only
 * Logs warnings/errors to console and can show debug overlay
 */

import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { validateCelShadedCompliance, logStyleViolations } from '@om/avatar-engine/validation';
import { env } from '@/env.mjs';
import type * as THREE from 'three';

/**
 * Validate game runtime compliance
 * Only runs in development mode
 */
export function validateGameRuntime(
  gameSlug: string,
  scene: THREE.Scene | null,
  options: {
    checkMaterials?: boolean;
    checkAvatar?: boolean;
    showOverlay?: boolean;
  } = {},
): void {
  // Only run in development
  if (env.NODE_ENV !== 'development') {
    return;
  }

  const { checkMaterials = true, checkAvatar = true, showOverlay = false } = options;

  if (!scene) {
    logger.warn(`[QA] ${gameSlug}: Scene not available for validation`);
    return;
  }

  // Check cel-shaded material compliance
  if (checkMaterials) {
    try {
      const violations = validateCelShadedCompliance(scene);
      if (violations.length > 0) {
        logger.warn(`[QA] ${gameSlug}: Material style violations detected:`);
        logStyleViolations(violations);
      } else {
        logger.warn(`[QA] ${gameSlug}: ✅ Material compliance passed`);
      }
    } catch (error) {
      logger.error(`[QA] ${gameSlug}: Error validating materials:`, undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Avatar checks would go here if needed
  if (checkAvatar) {
    // Check if avatar is rendered when AVATARS_ENABLED
    // This is more of a static check, so we'll skip runtime validation for now
  }

  // Show overlay if requested (dev-only)
  if (showOverlay && typeof window !== 'undefined') {
    // Overlay would be shown via QAOverlay component
    // This is a hook for future implementation
  }
}

/**
 * Create dev-only QA overlay component data
 */
export function createQAOverlayData(
  gameSlug: string,
  violations: Array<{ objectName: string; violationType: string; suggestion: string }>,
): { show: boolean; violations: typeof violations } {
  return {
    show: env.NODE_ENV === 'development' && violations.length > 0,
    violations,
  };
}
