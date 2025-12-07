/**
 * Web Worker for Sprite Generation
 * Moves sprite generation to a Web Worker to avoid blocking the main thread
 */

import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import type { SpriteGenerationOptions, SpriteSheet } from './spriteGenerator';
import { generateSpriteSheet } from './spriteGenerator';

export interface SpriteWorkerMessage {
  type: 'generate' | 'progress' | 'complete' | 'error';
  payload?: any;
}

/**
 * Handle sprite generation in Web Worker
 * This file should be bundled as a separate worker file
 */
self.onmessage = async (event: MessageEvent<{ config: AvatarConfiguration; options: SpriteGenerationOptions }>) => {
  const { config, options } = event.data;

  try {
    // Send progress update
    self.postMessage({
      type: 'progress',
      payload: { message: 'Starting sprite generation...', progress: 0 },
    } as SpriteWorkerMessage);

    // Generate sprite sheet
    const spriteSheet = await generateSpriteSheet(config, options);

    // Send completion
    self.postMessage({
      type: 'complete',
      payload: spriteSheet,
    } as SpriteWorkerMessage);
  } catch (error) {
    // Send error
    self.postMessage({
      type: 'error',
      payload: {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error instanceof Error ? error.stack : String(error),
      },
    } as SpriteWorkerMessage);
  }
};

/**
 * Create a Web Worker for sprite generation
 * Returns a worker instance that can be used to generate sprites
 */
export function createSpriteWorker(): Worker {
  // In production, this would load the worker file
  // For now, we'll use a blob URL approach
  const workerCode = `
    importScripts('${new URL('./spriteGenerator.ts', import.meta.url).href}');
    
    self.onmessage = async (event) => {
      const { config, options } = event.data;
      
      try {
        self.postMessage({ type: 'progress', payload: { message: 'Starting...', progress: 0 } });
        
        const spriteSheet = await generateSpriteSheet(config, options);
        
        self.postMessage({ type: 'complete', payload: spriteSheet });
      } catch (error) {
        self.postMessage({
          type: 'error',
          payload: {
            message: error.message,
            error: error.stack,
          },
        });
      }
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  const worker = new Worker(workerUrl);

  // Clean up blob URL when worker is terminated
  worker.addEventListener('terminate', () => {
    URL.revokeObjectURL(workerUrl);
  });

  return worker;
}

/**
 * Generate sprite sheet using Web Worker
 * Falls back to main thread if Web Workers are not supported
 */
export async function generateSpriteSheetWithWorker(
  config: AvatarConfiguration,
  options: SpriteGenerationOptions = {},
  onProgress?: (progress: number, message: string) => void,
): Promise<SpriteSheet> {
  // Check if Web Workers are supported
  if (typeof Worker === 'undefined') {
    // Fallback to main thread
    if (onProgress) {
      onProgress(0, 'Web Workers not supported, using main thread...');
    }
    return generateSpriteSheet(config, options);
  }

  return new Promise((resolve, reject) => {
    const worker = createSpriteWorker();

    worker.onmessage = (event: MessageEvent<SpriteWorkerMessage>) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'progress':
          if (onProgress) {
            onProgress(payload.progress || 0, payload.message || '');
          }
          break;

        case 'complete':
          worker.terminate();
          resolve(payload as SpriteSheet);
          break;

        case 'error':
          worker.terminate();
          reject(new Error(payload.message || 'Sprite generation failed'));
          break;
      }
    };

    worker.onerror = (error) => {
      worker.terminate();
      reject(error);
    };

    // Start generation
    worker.postMessage({ config, options });
  });
}

