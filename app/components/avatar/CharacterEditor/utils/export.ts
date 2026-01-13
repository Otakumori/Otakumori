import { logger } from '@/app/lib/logger';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import type { CameraPreset, PosePreset, BackgroundPreset } from '../types';
import type { ExportFormat, ExportQuality } from '../ExportModal';
import { trackEvent, EVENT_CATEGORIES } from '@/app/lib/monitoring';

export async function captureScreenshot(): Promise<void> {
  try {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `avatar-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  } catch (error) {
    logger.error('Failed to capture screenshot:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Export avatar using the API endpoint
 * Supports multiple formats and quality presets
 */
export async function exportAvatar(
  format: ExportFormat,
  quality: ExportQuality,
  async: boolean = false
): Promise<{ downloadUrl?: string; jobId?: string }> {
  const startTime = Date.now();
  
  try {
    // Track client-side export initiation
    trackEvent('avatar_export_initiated', EVENT_CATEGORIES.USER, {
      format,
      quality,
      async,
    });

    const response = await fetch('/api/v1/avatar/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format,
        quality,
        async,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      // Don't expose HTTP status codes or internal error details
      const errorMessage = result.error || 'Export failed. Please try again.';
      throw new Error(errorMessage);
    }

    // If async, return job ID for status polling
    if (async && result.data?.jobId) {
      return { jobId: result.data.jobId };
    }

    // If sync, return download URL and trigger download
    if (result.data?.downloadUrl) {
      const link = document.createElement('a');
      link.href = result.data.downloadUrl;
      link.download = `avatar-${Date.now()}.${format}`;
      link.click();
      return { downloadUrl: result.data.downloadUrl };
    }

    throw new Error('Invalid response from export API');
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Track export failure on client side
    trackEvent('avatar_export_failed', EVENT_CATEGORIES.ERROR, {
      format,
      quality,
      async,
      duration,
      errorMessage: errorObj.message,
    });

    logger.error('Failed to export avatar:', undefined, {
      format,
      quality,
      async,
      duration,
    }, errorObj);
    
    // Sanitize error messages to remove technical details
    // Provide user-friendly error messages with recovery suggestions
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      
      if (msg.includes('rate limit') || msg.includes('429')) {
        throw new Error(
          'Too many export requests. Please wait a while before trying again, or use background generation for large files.'
        );
      }
      if (msg.includes('401') || msg.includes('authentication') || msg.includes('sign in')) {
        throw new Error('Please sign in to export your avatar.');
      }
      if (msg.includes('404') || msg.includes('no avatar') || msg.includes('not found')) {
        throw new Error(
          'Avatar not found. Please create and save your avatar before exporting.'
        );
      }
      if (msg.includes('server-side') || msg.includes('not available')) {
        throw new Error(
          'Export format not available. Please try a different format.'
        );
      }
      if (msg.includes('timeout') || msg.includes('timed out')) {
        throw new Error(
          'Export took too long. Try using a lower quality setting or enable background generation.'
        );
      }
      
      // Generic fallback - don't expose the raw error message
      throw new Error('Export failed. Please try again or contact support if the problem persists.');
    }
    
    // Unknown error - never expose internal details
    throw new Error('Export failed. Please try again.');
  }
}

/**
 * Get export job status for async exports
 */
export async function getExportStatus(jobId: string): Promise<{
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  error?: string;
  progress?: number;
  message?: string;
  generatedAt?: string;
}> {
  try {
    const response = await fetch(`/api/v1/avatar/export/status?jobId=${encodeURIComponent(jobId)}`, {
      method: 'GET',
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.error || 'Failed to get export status');
    }

    return result.data;
  } catch (error) {
    logger.error('Failed to get export status:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    
    // Sanitize error messages - never expose technical details
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('401') || msg.includes('authentication') || msg.includes('sign in')) {
        throw new Error('Please sign in to check export status.');
      }
      if (msg.includes('404') || msg.includes('not found')) {
        throw new Error('Export job not found. Please start a new export.');
      }
    }
    
    // Generic fallback - don't expose internal error details
    throw new Error('Unable to check export status. Please try again.');
  }
}

/**
 * Legacy export function for backward compatibility
 * @deprecated Use exportAvatar instead
 */
export async function exportGLB(
  config?: any,
  filename?: string
): Promise<void> {
  // Call the new export function with GLB format
  await exportAvatar('glb', 'high', false);
}

export async function sharePreset(
  configuration: AvatarConfiguration,
  currentCamera: CameraPreset,
  currentPose: PosePreset,
  currentBackground: BackgroundPreset,
): Promise<void> {
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
    logger.error('Failed to share preset:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

