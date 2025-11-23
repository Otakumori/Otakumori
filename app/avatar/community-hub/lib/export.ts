/**
 * Export functionality for avatar configurations and 3D models
 * Supports JSON, GLB, and ZIP exports
 */

import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import JSZip from 'jszip';
import type { CharacterConfig } from './character-state';
import type * as THREE from 'three';

/**
 * Export character configuration as JSON
 */
export function exportJSON(config: CharacterConfig, filename: string = 'avatar-config.json'): void {
  try {
    const jsonString = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export JSON:', error);
    throw error;
  }
}

/**
 * Export 3D scene as GLB file
 */
export async function exportGLB(
  scene: THREE.Group,
  filename: string = 'avatar.glb',
): Promise<void> {
  try {
    const exporter = new GLTFExporter();
    
    const glbBlob = await new Promise<Blob>((resolve, reject) => {
      exporter.parse(
        scene,
        (result) => {
          if (result instanceof ArrayBuffer) {
            resolve(new Blob([result], { type: 'model/gltf-binary' }));
          } else if (result instanceof Blob) {
            resolve(result);
          } else {
            reject(new Error('Unexpected export result type'));
          }
        },
        {
          binary: true,
          includeCustomExtensions: false,
        } as any,
      );
    });

    const url = URL.createObjectURL(glbBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export GLB:', error);
    throw error;
  }
}

/**
 * Export 3D scene as GLTF file (JSON format)
 */
export async function exportGLTF(
  scene: THREE.Group,
  filename: string = 'avatar.gltf',
): Promise<void> {
  try {
    const exporter = new GLTFExporter();
    
    const result = await new Promise<any>((resolve) => {
      exporter.parse(
        scene,
        (data) => {
          resolve(data);
        },
        {
          binary: false,
          includeCustomExtensions: false,
        } as any,
      );
    });

    const jsonString = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonString], { type: 'model/gltf+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export GLTF:', error);
    throw error;
  }
}

/**
 * Export avatar as ZIP containing JSON config and GLB model
 */
export async function exportZIP(
  config: CharacterConfig,
  scene: THREE.Group,
  filename: string = 'avatar-export.zip',
): Promise<void> {
  try {
    const zip = new JSZip();

    // Add JSON config
    const jsonString = JSON.stringify(config, null, 2);
    zip.file('avatar-config.json', jsonString);

    // Add GLB model
    const exporter = new GLTFExporter();
    const glbBlob = await new Promise<Blob>((resolve, reject) => {
      exporter.parse(
        scene,
        (result) => {
          if (result instanceof ArrayBuffer) {
            resolve(new Blob([result], { type: 'model/gltf-binary' }));
          } else if (result instanceof Blob) {
            resolve(result);
          } else {
            reject(new Error('Unexpected export result type'));
          }
        },
        {
          binary: true,
          includeCustomExtensions: false,
        } as any,
      );
    });

    const glbArrayBuffer = await glbBlob.arrayBuffer();
    zip.file('avatar.glb', glbArrayBuffer);

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export ZIP:', error);
    throw error;
  }
}

/**
 * Copy JSON config to clipboard
 */
export async function copyJSONToClipboard(config: CharacterConfig): Promise<boolean> {
  try {
    const jsonString = JSON.stringify(config, null, 2);
    await navigator.clipboard.writeText(jsonString);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string = 'avatar', extension: string = 'json'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}-${timestamp}.${extension}`;
}

