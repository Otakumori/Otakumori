'use client';

import * as THREE from 'three';

// Types for procedural character generation
export interface ProceduralCharacterConfig {
  // Basic parameters
  gender: 'male' | 'female' | 'non-binary';
  age: 'teen' | 'young-adult' | 'adult' | 'mature';

  // Body proportions (0.0 to 1.0)
  body: {
    height: number;
    weight: number;
    muscleMass: number;
    bodyFat: number;
    shoulderWidth: number;
    waistSize: number;
    hipWidth: number;
  };

  // Face parameters
  face: {
    faceShape: number; // 0.0 (round) to 1.0 (angular)
    jawline: number; // 0.0 (soft) to 1.0 (sharp)
    cheekbones: number; // 0.0 (flat) to 1.0 (prominent)
    eyeSize: number; // 0.7 to 1.3
    noseSize: number; // 0.7 to 1.3
    mouthSize: number; // 0.7 to 1.3
  };

  // Hair parameters
  hair: {
    style: 'short' | 'medium' | 'long' | 'very-long';
    color: string;
    texture: 'straight' | 'wavy' | 'curly' | 'coily';
  };

  // Material parameters
  materials: {
    skinTone: string;
    eyeColor: string;
    lipColor: string;
  };
}

// Procedural mesh generation
export class ProceduralCharacterGenerator {
  private scene: THREE.Scene;
  private characterGroup: THREE.Group;
  private morphTargets: { [key: string]: number } = {};

  constructor() {
    this.scene = new THREE.Scene();
    this.characterGroup = new THREE.Group();
    this.scene.add(this.characterGroup);
  }

  // Generate base humanoid mesh
  generateBaseMesh(config: ProceduralCharacterConfig): THREE.Mesh {
    const geometry = new THREE.BufferGeometry();

    // Generate vertices for humanoid shape
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // Head
    this.generateHeadGeometry(vertices, normals, uvs, indices, config);

    // Torso
    this.generateTorsoGeometry(vertices, normals, uvs, indices, config);

    // Arms
    this.generateArmsGeometry(vertices, normals, uvs, indices, config);

    // Legs
    this.generateLegsGeometry(vertices, normals, uvs, indices, config);

    // Set geometry attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    // Compute normals
    geometry.computeVertexNormals();

    // Create morph targets
    this.createMorphTargets(geometry, config);

    // Create material
    const material = this.createAnimeToonMaterial(config);

    return new THREE.Mesh(geometry, material);
  }

  // Generate head geometry with parametric shape
  private generateHeadGeometry(
    vertices: number[],
    normals: number[],
    uvs: number[],
    indices: number[],
    config: ProceduralCharacterConfig,
  ): void {
    const segments = 32;
    const rings = 16;
    const radius = 0.3;

    for (let ring = 0; ring <= rings; ring++) {
      const v = ring / rings;
      const phi = v * Math.PI;

      for (let segment = 0; segment <= segments; segment++) {
        const u = segment / segments;
        const theta = u * Math.PI * 2;

        // Apply face shape parameters
        const faceShape = config.face.faceShape;
        const jawline = config.face.jawline;
        const cheekbones = config.face.cheekbones;

        // Calculate position with morphing
        const x = Math.sin(phi) * Math.cos(theta) * radius;
        const y = Math.cos(phi) * radius;
        const z = Math.sin(phi) * Math.sin(theta) * radius;

        // Apply face shape morphing
        const faceMorphX = x * (1 + (faceShape - 0.5) * 0.3);
        const faceMorphY = y * (1 + (jawline - 0.5) * 0.2);
        const faceMorphZ = z * (1 + (cheekbones - 0.5) * 0.4);

        vertices.push(faceMorphX, faceMorphY + 1.5, faceMorphZ);

        // Calculate normals
        const normal = new THREE.Vector3(faceMorphX, faceMorphY, faceMorphZ).normalize();
        normals.push(normal.x, normal.y, normal.z);

        // UV coordinates
        uvs.push(u, v);

        // Generate indices for triangles
        if (ring < rings && segment < segments) {
          const current = ring * (segments + 1) + segment;
          const next = current + segments + 1;

          indices.push(current, next, current + 1);
          indices.push(next, next + 1, current + 1);
        }
      }
    }
  }

  // Generate torso geometry
  private generateTorsoGeometry(
    vertices: number[],
    normals: number[],
    uvs: number[],
    indices: number[],
    config: ProceduralCharacterConfig,
  ): void {
    const segments = 16;
    const rings = 8;
    const baseRadius = 0.4;

    for (let ring = 0; ring <= rings; ring++) {
      const v = ring / rings;
      const y = 1.2 - v * 0.8; // From chest to waist

      for (let segment = 0; segment <= segments; segment++) {
        const u = segment / segments;
        const theta = u * Math.PI * 2;

        // Apply body proportions
        const shoulderWidth = config.body.shoulderWidth;
        const waistSize = config.body.waistSize;
        const hipWidth = config.body.hipWidth;

        // Interpolate radius based on height
        let radius = baseRadius;
        if (v < 0.3) {
          // Shoulders
          radius *= shoulderWidth;
        } else if (v < 0.7) {
          // Waist
          radius *= waistSize;
        } else {
          // Hips
          radius *= hipWidth;
        }

        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;

        vertices.push(x, y, z);

        // Calculate normals
        const normal = new THREE.Vector3(x, 0, z).normalize();
        normals.push(normal.x, normal.y, normal.z);

        // UV coordinates
        uvs.push(u, v);

        // Generate indices
        if (ring < rings && segment < segments) {
          const current = ring * (segments + 1) + segment;
          const next = current + segments + 1;

          indices.push(current, next, current + 1);
          indices.push(next, next + 1, current + 1);
        }
      }
    }
  }

  // Generate arms geometry
  private generateArmsGeometry(
    vertices: number[],
    normals: number[],
    uvs: number[],
    indices: number[],
    config: ProceduralCharacterConfig,
  ): void {
    // Left arm
    this.generateArmGeometry(vertices, normals, uvs, indices, config, -0.6, 0.8);
    // Right arm
    this.generateArmGeometry(vertices, normals, uvs, indices, config, 0.6, 0.8);
  }

  // Generate single arm
  private generateArmGeometry(
    vertices: number[],
    normals: number[],
    uvs: number[],
    indices: number[],
    config: ProceduralCharacterConfig,
    offsetX: number,
    startY: number,
  ): void {
    const segments = 8;
    const rings = 6;
    const radius = 0.1;

    for (let ring = 0; ring <= rings; ring++) {
      const v = ring / rings;
      const y = startY - v * 0.6;

      for (let segment = 0; segment <= segments; segment++) {
        const u = segment / segments;
        const theta = u * Math.PI * 2;

        const x = Math.cos(theta) * radius + offsetX;
        const z = Math.sin(theta) * radius;

        vertices.push(x, y, z);

        const normal = new THREE.Vector3(x - offsetX, 0, z).normalize();
        normals.push(normal.x, normal.y, normal.z);

        uvs.push(u, v);

        if (ring < rings && segment < segments) {
          const current = ring * (segments + 1) + segment;
          const next = current + segments + 1;

          indices.push(current, next, current + 1);
          indices.push(next, next + 1, current + 1);
        }
      }
    }
  }

  // Generate legs geometry
  private generateLegsGeometry(
    vertices: number[],
    normals: number[],
    uvs: number[],
    indices: number[],
    config: ProceduralCharacterConfig,
  ): void {
    // Left leg
    this.generateLegGeometry(vertices, normals, uvs, indices, config, -0.2, 0.4);
    // Right leg
    this.generateLegGeometry(vertices, normals, uvs, indices, config, 0.2, 0.4);
  }

  // Generate single leg
  private generateLegGeometry(
    vertices: number[],
    normals: number[],
    uvs: number[],
    indices: number[],
    config: ProceduralCharacterConfig,
    offsetX: number,
    startY: number,
  ): void {
    const segments = 8;
    const rings = 8;
    const radius = 0.15;

    for (let ring = 0; ring <= rings; ring++) {
      const v = ring / rings;
      const y = startY - v * 1.0;

      for (let segment = 0; segment <= segments; segment++) {
        const u = segment / segments;
        const theta = u * Math.PI * 2;

        const x = Math.cos(theta) * radius + offsetX;
        const z = Math.sin(theta) * radius;

        vertices.push(x, y, z);

        const normal = new THREE.Vector3(x - offsetX, 0, z).normalize();
        normals.push(normal.x, normal.y, normal.z);

        uvs.push(u, v);

        if (ring < rings && segment < segments) {
          const current = ring * (segments + 1) + segment;
          const next = current + segments + 1;

          indices.push(current, next, current + 1);
          indices.push(next, next + 1, current + 1);
        }
      }
    }
  }

  // Create morph targets for facial expressions and body modifications
  private createMorphTargets(
    geometry: THREE.BufferGeometry,
    config: ProceduralCharacterConfig,
  ): void {
    const morphTargets: THREE.MorphTarget[] = [];

    // Face morph targets
    morphTargets.push(
      this.createMorphTarget('smile', geometry, (x, y, z) => {
        const mouthY = y - 1.3; // Approximate mouth position
        if (Math.abs(mouthY) < 0.1) {
          return { x, y: y + 0.05, z };
        }
        return { x, y, z };
      }),
    );

    morphTargets.push(
      this.createMorphTarget('frown', geometry, (x, y, z) => {
        const mouthY = y - 1.3;
        if (Math.abs(mouthY) < 0.1) {
          return { x, y: y - 0.05, z };
        }
        return { x, y, z };
      }),
    );

    morphTargets.push(
      this.createMorphTarget('eyeBlink', geometry, (x, y, z) => {
        const eyeY = y - 1.4; // Approximate eye position
        if (Math.abs(eyeY) < 0.1) {
          return { x, y: y - 0.1, z };
        }
        return { x, y, z };
      }),
    );

    // Body morph targets
    morphTargets.push(
      this.createMorphTarget('muscleFlex', geometry, (x, y, z) => {
        const torsoY = y - 0.8; // Approximate torso position
        if (torsoY > 0 && torsoY < 0.6) {
          const scale = 1 + config.body.muscleMass * 0.2;
          return { x: x * scale, y, z: z * scale };
        }
        return { x, y, z };
      }),
    );

    // Add morph targets to geometry
    (geometry as any).morphTargets = morphTargets;
  }

  // Helper to create morph target
  private createMorphTarget(
    name: string,
    geometry: THREE.BufferGeometry,
    morphFunction: (x: number, y: number, z: number) => { x: number; y: number; z: number },
  ): THREE.MorphTarget {
    const positions = geometry.attributes.position.array as Float32Array;
    const morphedPositions = new Float32Array(positions.length);

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      const morphed = morphFunction(x, y, z);
      morphedPositions[i] = morphed.x;
      morphedPositions[i + 1] = morphed.y;
      morphedPositions[i + 2] = morphed.z;
    }

    return {
      name,
      vertices: Array.from(
        { length: morphedPositions.length / 3 },
        (_, i) =>
          new THREE.Vector3(
            morphedPositions[i * 3],
            morphedPositions[i * 3 + 1],
            morphedPositions[i * 3 + 2],
          ),
      ),
    };
  }

  // Create anime-style toon material
  private createAnimeToonMaterial(config: ProceduralCharacterConfig): THREE.Material {
    const material = new THREE.MeshStandardMaterial({
      color: config.materials.skinTone,
      metalness: 0.1,
      roughness: 0.8,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.0,
    });

    // Add toon shading effect
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `
        #include <common>
        varying vec3 vNormal;
        varying vec3 vPosition;
        `,
      );

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `
        #include <common>
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        // Toon shading function
        float toonShading(vec3 normal, vec3 lightDir) {
          float NdotL = dot(normal, lightDir);
          return smoothstep(0.0, 0.1, NdotL);
        }
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <lights_physical_fragment>',
        `
        // Custom toon lighting
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float toon = toonShading(vNormal, lightDir);
        
        // Rim lighting
        float rim = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
        rim = pow(rim, 2.0);
        
        vec3 finalColor = diffuseColor.rgb * (toon + rim * 0.3);
        gl_FragColor = vec4(finalColor, diffuseColor.a);
        `,
      );
    };

    return material;
  }

  // Generate complete character
  generateCharacter(config: ProceduralCharacterConfig): THREE.Group {
    const character = new THREE.Group();

    // Generate base mesh
    const baseMesh = this.generateBaseMesh(config);
    character.add(baseMesh);

    // Generate hair
    const hairMesh = this.generateHairMesh(config);
    if (hairMesh) {
      character.add(hairMesh);
    }

    // Generate clothing
    const clothingMesh = this.generateClothingMesh(config);
    if (clothingMesh) {
      character.add(clothingMesh);
    }

    // Apply final transformations
    character.scale.setScalar(config.body.height);

    return character;
  }

  // Generate hair mesh
  private generateHairMesh(config: ProceduralCharacterConfig): THREE.Mesh | null {
    if (!config.hair) return null;

    const geometry = new THREE.SphereGeometry(0.35, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.7);
    const material = new THREE.MeshStandardMaterial({
      color: config.hair.color,
      metalness: 0.1,
      roughness: 0.9,
    });

    const hairMesh = new THREE.Mesh(geometry, material);
    hairMesh.position.y = 1.6;

    return hairMesh;
  }

  // Generate clothing mesh
  private generateClothingMesh(config: ProceduralCharacterConfig): THREE.Mesh | null {
    // Basic clothing implementation
    const geometry = new THREE.CylinderGeometry(0.4, 0.3, 0.8, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff6b9d,
      metalness: 0.2,
      roughness: 0.7,
    });

    const clothingMesh = new THREE.Mesh(geometry, material);
    clothingMesh.position.y = 0.8;

    return clothingMesh;
  }

  // Update morph targets
  updateMorphTargets(mesh: THREE.Mesh, morphValues: { [key: string]: number }): void {
    if (mesh.morphTargetInfluences && mesh.morphTargetDictionary) {
      Object.keys(morphValues).forEach((key) => {
        const index = mesh.morphTargetDictionary![key];
        if (index !== undefined && mesh.morphTargetInfluences![index] !== undefined) {
          mesh.morphTargetInfluences![index] = morphValues[key];
        }
      });
    }
  }

  // Export character as GLB
  async exportAsGLB(character: THREE.Group): Promise<ArrayBuffer> {
    const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');
    const exporter = new GLTFExporter();

    return new Promise((resolve, reject) => {
      exporter.parse(
        character,
        (result) => {
          if (result instanceof ArrayBuffer) {
            resolve(result);
          } else {
            reject(new Error('Failed to export GLB'));
          }
        },
        (error) => {
          reject(error);
        },
        { binary: true },
      );
    });
  }
}

// Default character configurations
export const DEFAULT_CHARACTER_CONFIGS: { [key: string]: ProceduralCharacterConfig } = {
  male: {
    gender: 'male',
    age: 'young-adult',
    body: {
      height: 1.0,
      weight: 0.7,
      muscleMass: 0.6,
      bodyFat: 0.3,
      shoulderWidth: 1.1,
      waistSize: 0.8,
      hipWidth: 0.9,
    },
    face: {
      faceShape: 0.7,
      jawline: 0.8,
      cheekbones: 0.6,
      eyeSize: 1.0,
      noseSize: 1.0,
      mouthSize: 1.0,
    },
    hair: {
      style: 'short',
      color: '#8B4513',
      texture: 'straight',
    },
    materials: {
      skinTone: '#fdbcb4',
      eyeColor: '#4a90e2',
      lipColor: '#d4a574',
    },
  },
  female: {
    gender: 'female',
    age: 'young-adult',
    body: {
      height: 0.95,
      weight: 0.6,
      muscleMass: 0.3,
      bodyFat: 0.4,
      shoulderWidth: 0.8,
      waistSize: 0.7,
      hipWidth: 1.1,
    },
    face: {
      faceShape: 0.4,
      jawline: 0.3,
      cheekbones: 0.7,
      eyeSize: 1.1,
      noseSize: 0.9,
      mouthSize: 1.0,
    },
    hair: {
      style: 'long',
      color: '#8B4513',
      texture: 'wavy',
    },
    materials: {
      skinTone: '#fdbcb4',
      eyeColor: '#4a90e2',
      lipColor: '#d4a574',
    },
  },
};
