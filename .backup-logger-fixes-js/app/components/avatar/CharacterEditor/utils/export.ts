import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import type { CameraPreset, PosePreset, BackgroundPreset } from '../types';

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
    logger.error('Failed to capture screenshot:', error);
    throw error;
  }
}

export async function exportGLB(): Promise<void> {
  try {
    // This would integrate with the model loader to export the current configuration
    // as a GLB file with all parts and materials applied
    logger.warn('GLB export functionality would be implemented here');
    alert('GLB export feature coming soon!');
  } catch (error) {
    logger.error('Failed to export GLB:', error);
    throw error;
  }
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
    logger.error('Failed to share preset:', error);
    throw error;
  }
}

