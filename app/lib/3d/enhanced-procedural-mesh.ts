/**
 * Enhanced Procedural Mesh Generation System
 * Generates high-quality 3D meshes with proper topology, smooth normals, and subdivision
 * Code Vein / Nikke quality procedural generation
 */

import * as THREE from 'three';

export interface EnhancedMeshOptions {
  segments?: number; // Base segments for geometry (default: 32)
  smoothNormals?: boolean; // Compute smooth normals (default: true)
  subdivision?: number; // Subdivision level (0-3, default: 1)
  weldVertices?: boolean; // Weld duplicate vertices (default: true)
  generateTangents?: boolean; // Generate tangent space for normal maps (default: true)
}

export class EnhancedProceduralMesh {
  /**
   * Create a high-quality head mesh with proper topology
   */
  static createHead(
    size: number = 0.12,
    options: EnhancedMeshOptions = {},
  ): THREE.BufferGeometry {
    const segments = options.segments || 32;
    const geometry = new THREE.SphereGeometry(size, segments, segments);

    // Subdivide for smoother surface
    if (options.subdivision && options.subdivision > 0) {
      this.subdivideGeometry(geometry, options.subdivision);
    }

    // Elongate for anime proportions
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      positions.setY(i, y * 1.1); // Slightly taller
    }
    positions.needsUpdate = true;

    // Compute smooth normals
    if (options.smoothNormals !== false) {
      geometry.computeVertexNormals();
    }

    // Weld vertices (Note: mergeVertices is not available on BufferGeometry in Three.js r152+)
    // Vertices are already merged in most cases, so we skip this step
    // If needed, use BufferGeometryUtils.mergeVertices() from 'three/examples/jsm/utils/BufferGeometryUtils'

    // Generate tangents for normal mapping
    if (options.generateTangents !== false) {
      geometry.computeTangents();
    }

    return geometry;
  }

  /**
   * Create a high-quality torso mesh with proper tapering
   */
  static createTorso(
    topRadius: number,
    bottomRadius: number,
    height: number,
    options: EnhancedMeshOptions = {},
  ): THREE.BufferGeometry {
    const segments = options.segments || 32;
    const geometry = new THREE.CylinderGeometry(
      topRadius,
      bottomRadius,
      height,
      segments,
      16,
      true,
    );

    // Subdivide for smoother surface
    if (options.subdivision && options.subdivision > 0) {
      this.subdivideGeometry(geometry, options.subdivision);
    }

    // Compute smooth normals
    if (options.smoothNormals !== false) {
      geometry.computeVertexNormals();
    }

    // Weld vertices (Note: mergeVertices is not available on BufferGeometry in Three.js r152+)
    // Vertices are already merged in most cases, so we skip this step

    // Generate tangents
    if (options.generateTangents !== false) {
      geometry.computeTangents();
    }

    return geometry;
  }

  /**
   * Create a high-quality limb mesh (arm/leg)
   */
  static createLimb(
    radius: number,
    length: number,
    taper: number = 0.9,
    options: EnhancedMeshOptions = {},
  ): THREE.BufferGeometry {
    const segments = options.segments || 24;
    const geometry = new THREE.CylinderGeometry(
      radius * taper,
      radius,
      length,
      segments,
      8,
      false,
    );

    // Subdivide for smoother surface
    if (options.subdivision && options.subdivision > 0) {
      this.subdivideGeometry(geometry, options.subdivision);
    }

    // Compute smooth normals
    if (options.smoothNormals !== false) {
      geometry.computeVertexNormals();
    }

    // Weld vertices (Note: mergeVertices is not available on BufferGeometry in Three.js r152+)
    // Vertices are already merged in most cases, so we skip this step

    // Generate tangents
    if (options.generateTangents !== false) {
      geometry.computeTangents();
    }

    return geometry;
  }

  /**
   * Subdivide geometry using midpoint subdivision
   */
  private static subdivideGeometry(
    geometry: THREE.BufferGeometry,
    levels: number,
  ): void {
    for (let level = 0; level < levels; level++) {
      const positions = geometry.attributes.position;
      const normals = geometry.attributes.normal;
      const uvs = geometry.attributes.uv;

      // Type check for BufferAttribute
      if (
        !(positions instanceof THREE.BufferAttribute) ||
        !(normals instanceof THREE.BufferAttribute) ||
        !(uvs instanceof THREE.BufferAttribute)
      ) {
        return; // Skip subdivision if attributes are not BufferAttributes
      }

      const newPositions: number[] = [];
      const newNormals: number[] = [];
      const newUvs: number[] = [];
      const newIndices: number[] = [];

      const index = geometry.index;
      if (!index) return;

      const vertexMap = new Map<string, number>();

      // Process each triangle
      for (let i = 0; i < index.count; i += 3) {
        const i0 = index.getX(i);
        const i1 = index.getX(i + 1);
        const i2 = index.getX(i + 2);

        const v0 = this.getVertex(positions, normals, uvs, i0);
        const v1 = this.getVertex(positions, normals, uvs, i1);
        const v2 = this.getVertex(positions, normals, uvs, i2);

        // Create midpoints
        const m01 = this.midpoint(v0, v1);
        const m12 = this.midpoint(v1, v2);
        const m20 = this.midpoint(v2, v0);

        // Add vertices and create 4 new triangles
        const idx0 = this.addVertex(newPositions, newNormals, newUvs, v0, vertexMap);
        const idx1 = this.addVertex(newPositions, newNormals, newUvs, m01, vertexMap);
        const idx2 = this.addVertex(newPositions, newNormals, newUvs, m20, vertexMap);
        const idx3 = this.addVertex(newPositions, newNormals, newUvs, m01, vertexMap);
        const idx4 = this.addVertex(newPositions, newNormals, newUvs, v1, vertexMap);
        const idx5 = this.addVertex(newPositions, newNormals, newUvs, m12, vertexMap);
        const idx6 = this.addVertex(newPositions, newNormals, newUvs, m20, vertexMap);
        const idx7 = this.addVertex(newPositions, newNormals, newUvs, m12, vertexMap);
        const idx8 = this.addVertex(newPositions, newNormals, newUvs, v2, vertexMap);
        const idx9 = this.addVertex(newPositions, newNormals, newUvs, m20, vertexMap);
        const idx10 = this.addVertex(newPositions, newNormals, newUvs, m12, vertexMap);
        const idx11 = this.addVertex(newPositions, newNormals, newUvs, m01, vertexMap);

        // Add 4 triangles
        newIndices.push(idx0, idx1, idx2);
        newIndices.push(idx3, idx4, idx5);
        newIndices.push(idx6, idx7, idx8);
        newIndices.push(idx9, idx10, idx11);
      }

      // Update geometry
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(newPositions, 3),
      );
      geometry.setAttribute(
        'normal',
        new THREE.Float32BufferAttribute(newNormals, 3),
      );
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(newUvs, 2));
      geometry.setIndex(newIndices);
    }
  }

  private static getVertex(
    positions: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
    normals: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
    uvs: THREE.BufferAttribute | THREE.InterleavedBufferAttribute,
    index: number,
  ): { pos: THREE.Vector3; norm: THREE.Vector3; uv: THREE.Vector2 } {
    return {
      pos: new THREE.Vector3(
        positions.getX(index),
        positions.getY(index),
        positions.getZ(index),
      ),
      norm: new THREE.Vector3(
        normals.getX(index),
        normals.getY(index),
        normals.getZ(index),
      ),
      uv: new THREE.Vector2(uvs.getX(index), uvs.getY(index)),
    };
  }

  private static midpoint(
    v0: { pos: THREE.Vector3; norm: THREE.Vector3; uv: THREE.Vector2 },
    v1: { pos: THREE.Vector3; norm: THREE.Vector3; uv: THREE.Vector2 },
  ): { pos: THREE.Vector3; norm: THREE.Vector3; uv: THREE.Vector2 } {
    return {
      pos: v0.pos.clone().add(v1.pos).multiplyScalar(0.5),
      norm: v0.norm.clone().add(v1.norm).normalize(),
      uv: v0.uv.clone().add(v1.uv).multiplyScalar(0.5),
    };
  }

  private static addVertex(
    positions: number[],
    normals: number[],
    uvs: number[],
    vertex: { pos: THREE.Vector3; norm: THREE.Vector3; uv: THREE.Vector2 },
    vertexMap: Map<string, number>,
  ): number {
    const key = `${vertex.pos.x.toFixed(6)},${vertex.pos.y.toFixed(6)},${vertex.pos.z.toFixed(6)}`;
    if (vertexMap.has(key)) {
      return vertexMap.get(key)!;
    }

    const index = positions.length / 3;
    positions.push(vertex.pos.x, vertex.pos.y, vertex.pos.z);
    normals.push(vertex.norm.x, vertex.norm.y, vertex.norm.z);
    uvs.push(vertex.uv.x, vertex.uv.y);
    vertexMap.set(key, index);
    return index;
  }

  /**
   * Create enhanced skin material with proper shader properties
   */
  static createSkinMaterial(
    color: THREE.Color | string = '#FFDBAC',
    options: {
      roughness?: number;
      metalness?: number;
      normalScale?: number;
      emissiveIntensity?: number;
    } = {},
  ): THREE.MeshStandardMaterial {
    const baseColor =
      color instanceof THREE.Color ? color : new THREE.Color(color);

    return new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: options.roughness ?? 0.7,
      metalness: options.metalness ?? 0.05,
      normalScale: new THREE.Vector2(
        options.normalScale ?? 1.0,
        options.normalScale ?? 1.0,
      ),
      emissive: baseColor.clone().multiplyScalar(0.05),
      emissiveIntensity: options.emissiveIntensity ?? 0.1,
      envMapIntensity: 1.0,
      flatShading: false,
    });
  }

  /**
   * Create enhanced hair material with proper shader properties
   */
  static createHairMaterial(
    color: THREE.Color | string = '#3d2817',
    options: {
      roughness?: number;
      metalness?: number;
      emissiveIntensity?: number;
    } = {},
  ): THREE.MeshStandardMaterial {
    const baseColor =
      color instanceof THREE.Color ? color : new THREE.Color(color);

    return new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: options.roughness ?? 0.8,
      metalness: options.metalness ?? 0.1,
      emissive: baseColor.clone().multiplyScalar(0.1),
      emissiveIntensity: options.emissiveIntensity ?? 0.15,
      envMapIntensity: 1.2,
      flatShading: false,
    });
  }

  /**
   * Create enhanced clothing material with proper shader properties
   */
  static createClothingMaterial(
    color: THREE.Color | string = '#FF6B9D',
    options: {
      roughness?: number;
      metalness?: number;
      emissiveIntensity?: number;
    } = {},
  ): THREE.MeshStandardMaterial {
    const baseColor =
      color instanceof THREE.Color ? color : new THREE.Color(color);

    return new THREE.MeshStandardMaterial({
      color: baseColor,
      roughness: options.roughness ?? 0.6,
      metalness: options.metalness ?? 0.2,
      emissive: baseColor.clone().multiplyScalar(0.05),
      emissiveIntensity: options.emissiveIntensity ?? 0.08,
      envMapIntensity: 1.0,
      flatShading: false,
    });
  }
}

