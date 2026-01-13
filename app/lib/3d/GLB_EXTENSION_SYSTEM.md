# GLB Generator Extension System

## Overview

The comprehensive GLB generator is designed to be **fully extensible**. You can add support for any parameter from `FullCharacterConfig` or create custom parameters.

## Architecture

### Parameter Processing Flow

1. **Main Generation Function**: `generateComprehensiveGLB()` orchestrates the entire process
2. **Modular Builders**: Each body part has its own builder function
3. **Parameter Processors**: Extensible registry for custom parameter handling
4. **Material System**: Supports cel-shading and standard materials with full parameter control

## Adding Support for New Parameters

### Method 1: Extend Existing Builders

To add a new parameter to an existing body part, find the corresponding builder and add the logic:

```typescript
// Example: Adding ear size parameter
async function buildEars(
  earsConfig: FullCharacterConfig['ears'],
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  // ... existing code ...
  
  // NEW: Add your parameter
  const earSize = earsConfig.size || 1.0;
  const earGeometry = createEarGeometry(earSize, lobeShape, segments);
  
  // Apply parameter
  const positions = earGeometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    // Modify geometry based on parameter
    const y = positions.getY(i);
    positions.setY(i, y * earSize);
  }
  earGeometry.computeVertexNormals();
  
  onParameterApplied(); // Track that parameter was applied
}
```

### Method 2: Register Custom Parameter Processor

For complex parameters that affect multiple body parts, use the processor registry:

```typescript
import { registerParameterProcessor } from '@/app/lib/3d/comprehensive-glb-generator';

registerParameterProcessor({
  name: 'customSkinTexture',
  priority: 100, // Lower = processes earlier
  process: (config, group, options) => {
    // Your custom logic here
    group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name.includes('Skin')) {
        // Apply custom skin texture parameter
        const material = child.material as THREE.MeshStandardMaterial;
        if (config.customParams?.skinTexture) {
          // Apply texture from config
        }
      }
    });
  },
});
```

## Supported Parameters by Category

### ✅ Fully Implemented

- **Head**: size, width, depth, face shape modifiers
- **Face**: cheekbones, jawWidth, jawDepth, chinShape, foreheadHeight
- **Eyes**: size, spacing, depth, tilt, irisSize, pupilSize, colors, highlight styles
- **Eyebrows**: style, thickness, arch, angle, color
- **Nose**: width, height, length, bridgeWidth, bridgeDepth, tipShape, nostrilSize, nostrilFlare
- **Mouth**: width, size, upperLipThickness, lowerLipThickness, cornerPosition, philtrumDepth
- **Torso**: chestWidth, chestDepth, abdomenDefinition, waistWidth
- **Breasts**: size, shape, separation, sag, nippleSize, areolaSize, colors
- **Arms**: upperArmSize, forearmSize, armLength, shoulderShape
- **Legs**: thighCircumference, calfSize, upperLegLength, lowerLegLength, kneeDefinition, thighGap
- **Hips**: width, depth, shape
- **Buttocks**: size, shape, lift
- **Body**: height, weight, muscularity, bodyFat, posture

### 🚧 Partially Implemented (Placeholder Functions)

These have the structure in place but need full implementation:

- **Hands**: fingerLength, fingerThickness, nailLength, nailColor
- **Feet**: size
- **Ears**: size, angle, lobeShape
- **Neck**: thickness, length, adamsApple
- **Hair**: baseStyle, length, volume, highlights, splitColor, extensions
- **Facial Hair**: style, thickness, color
- **Body Hair**: chest, back, arms, legs, color
- **Scars**: Array of scar objects
- **Tattoos**: Array of tattoo objects
- **Piercings**: Array of piercing objects
- **Outfit**: All clothing layers and accessories
- **Makeup**: foundation, blush, eyeshadow, eyeliner, lipstick
- **VFX**: aura, glow, particles
- **Skin Details**: freckles, moles, beautyMarks, acne, flushedCheeks, tanLines

## Extension Points

### 1. Material System Extension

```typescript
function createCustomMaterial(
  config: FullCharacterConfig,
  options: ComprehensiveGLBOptions
): THREE.Material {
  // Create custom material with all skin parameters
  const skinTone = config.skin?.tone || '#fde4d0';
  const glossiness = config.skin?.glossiness || 0.3;
  const smoothness = config.skin?.smoothness || 0.8;
  const pores = config.skin?.pores || 0.0;
  
  // Apply pores as normal map
  // Apply freckles as texture overlay
  // Apply tan lines as color variation
  
  return new THREE.MeshStandardMaterial({
    color: skinTone,
    roughness: 1.0 - (glossiness * smoothness),
    // ... custom material properties
  });
}
```

### 2. Geometry Modifier Extension

```typescript
function applyGeometryModifier(
  geometry: THREE.BufferGeometry,
  parameter: number,
  modifierType: 'scale' | 'morph' | 'twist'
): THREE.BufferGeometry {
  const positions = geometry.attributes.position;
  
  for (let i = 0; i < positions.count; i++) {
    // Apply modifier based on type
    switch (modifierType) {
      case 'scale':
        // Scale geometry
        break;
      case 'morph':
        // Morph geometry
        break;
      case 'twist':
        // Twist geometry
        break;
    }
  }
  
  geometry.computeVertexNormals();
  return geometry;
}
```

### 3. Texture Generation Extension

```typescript
function generateParameterTexture(
  parameter: number,
  type: 'freckles' | 'scars' | 'tattoos'
): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;
  
  // Generate texture based on parameter
  switch (type) {
    case 'freckles':
      // Draw freckles on canvas
      break;
    case 'scars':
      // Draw scars on canvas
      break;
    case 'tattoos':
      // Draw tattoos on canvas
      break;
  }
  
  return new THREE.CanvasTexture(canvas);
}
```

## Quality Presets

The system supports quality presets that affect:
- Geometry segment counts
- Texture resolutions
- Subdivision levels
- Shadow map sizes

```typescript
const qualityPresets = {
  low: { headSegments: 24, bodySegments: 16, textureSize: 512 },
  medium: { headSegments: 32, bodySegments: 24, textureSize: 1024 },
  high: { headSegments: 48, bodySegments: 32, textureSize: 2048 },
  ultra: { headSegments: 64, bodySegments: 48, textureSize: 4096 },
};
```

## Best Practices

1. **Always call `onParameterApplied()`** when a parameter is successfully applied
2. **Use try/catch blocks** around parameter processing
3. **Validate parameter ranges** before applying
4. **Use quality presets** to adjust geometry complexity
5. **Compute normals** after geometry modifications
6. **Track parameter count** for metadata
7. **Preserve existing functionality** when adding new parameters
8. **Use appropriate geometry complexity** for the parameter's visual impact

## Example: Adding Full Hand Support

```typescript
async function buildDetailedHands(
  config: FullCharacterConfig,
  qualityPreset: ReturnType<typeof getQualityPreset>,
  options: ComprehensiveGLBOptions,
  onParameterApplied: () => void
): Promise<THREE.Group | null> {
  try {
    const group = new THREE.Group();
    group.name = 'Hands';

    const fingerLength = config.hands?.fingerLength || 1.0;
    const fingerThickness = config.hands?.fingerThickness || 0.5;
    const nailLength = config.hands?.nailLength || 0.5;
    const nailColor = config.hands?.nailColor || '#ffffff';

    // Left hand
    const leftHandGroup = new THREE.Group();
    
    // Palm
    const palmGeometry = new THREE.BoxGeometry(0.08, 0.12, 0.04);
    const palm = new THREE.Mesh(palmGeometry, skinMaterial);
    palm.name = 'PalmLeft';
    leftHandGroup.add(palm);

    // Fingers
    for (let i = 0; i < 5; i++) {
      const fingerGeometry = new THREE.CylinderGeometry(
        0.01 * fingerThickness,
        0.012 * fingerThickness,
        0.04 * fingerLength,
        8
      );
      const finger = new THREE.Mesh(fingerGeometry, skinMaterial);
      finger.position.set(-0.03 + i * 0.015, 0.08, 0);
      finger.name = `Finger${i}Left`;
      leftHandGroup.add(finger);

      // Nail
      if (nailLength > 0) {
        const nailGeometry = new THREE.BoxGeometry(0.012, 0.005, nailLength * 0.01);
        const nailMaterial = new THREE.MeshStandardMaterial({ color: nailColor });
        const nail = new THREE.Mesh(nailGeometry, nailMaterial);
        nail.position.set(-0.03 + i * 0.015, 0.08 + 0.02 * fingerLength, 0.01);
        nail.name = `Nail${i}Left`;
        leftHandGroup.add(nail);
      }
    }

    leftHandGroup.position.set(-0.52, 0.10, 0);
    group.add(leftHandGroup);

    // Right hand (mirror of left)
    const rightHandGroup = leftHandGroup.clone();
    rightHandGroup.position.set(0.52, 0.10, 0);
    rightHandGroup.scale.x = -1;
    group.add(rightHandGroup);

    onParameterApplied();
    return group;
  } catch (error) {
    logger.error('Failed to build hands:', undefined, undefined, error);
    return null;
  }
}
```

## Integration with Character Creator

The GLB generator automatically receives all parameters from `FullCharacterConfig`. Simply ensure your character creator UI updates the config object, and the generator will use all available parameters.

## Future Extensions

The system is designed to support:
- **Animation data** export (bone animations, morph targets)
- **Custom shaders** per material
- **Texture atlasing** for optimization
- **LOD generation** for multiple quality levels
- **Procedural texture generation** for skin details
- **Physics constraints** export
- **Custom extensions** via GLTF extension system

