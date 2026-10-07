import type * as THREE from 'three';
import type { AvatarAssetRepository } from './AssetRepository';

export interface AvatarRendererTelemetry {
  drawCalls: number;
  triangles: number;
  lines: number;
  points: number;
  geometries: number;
  textures: number;
  programs: number;
  residentAssetBytes: number;
  assetCount: number;
  resourceCount: number;
}

export function readAvatarRendererTelemetry(
  renderer: THREE.WebGLRenderer,
  repository: AvatarAssetRepository,
): AvatarRendererTelemetry {
  return {
    drawCalls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    lines: renderer.info.render.lines,
    points: renderer.info.render.points,
    geometries: renderer.info.memory.geometries,
    textures: renderer.info.memory.textures,
    programs: renderer.info.programs?.length ?? 0,
    residentAssetBytes: repository.residentBytes,
    assetCount: repository.size,
    resourceCount: repository.resourceRegistry.size,
  };
}
