/**
 * Perlin Noise Generator for procedural textures
 * Based on Ken Perlin's algorithm with octave support
 */

export class PerlinNoise {
  private p: number[] = [];
  private perm: number[] = [];
  private grad3 = [
    [1, 1, 0],
    [-1, 1, 0],
    [1, -1, 0],
    [-1, -1, 0],
    [1, 0, 1],
    [-1, 0, 1],
    [1, 0, -1],
    [-1, 0, -1],
    [0, 1, 1],
    [0, -1, 1],
    [0, 1, -1],
    [0, -1, -1],
  ];

  constructor(seed?: number) {
    // Pre-calculate random numbers (permutation table)
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random;
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(random() * 256);
    }

    // Double permutation table to avoid index wrapping
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
    }
  }

  private seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  private fade(t: number): number {
    // Ease curve: 6t^5 - 15t^4 + 10t^3
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private mix(a: number, b: number, t: number): number {
    return (1 - t) * a + t * b;
  }

  private perlinDot(g: number[], x: number, y: number, z: number): number {
    return g[0] * x + g[1] * y + g[2] * z;
  }

  /**
   * Generate 3D Perlin noise at given coordinates
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   * @returns Noise value between -1 and 1
   */
  public noise3D(x: number, y: number, z: number): number {
    // Find unit grid cell containing point
    let X = Math.floor(x);
    let Y = Math.floor(y);
    let Z = Math.floor(z);

    // Get relative xyz coordinates within cell
    x = x - X;
    y = y - Y;
    z = z - Z;

    // Wrap integer cells at 255
    X &= 255;
    Y &= 255;
    Z &= 255;

    // Calculate hashed gradient indices
    const gi000 = this.perm[X + this.perm[Y + this.perm[Z]]] % 12;
    const gi001 = this.perm[X + this.perm[Y + this.perm[Z + 1]]] % 12;
    const gi010 = this.perm[X + this.perm[Y + 1 + this.perm[Z]]] % 12;
    const gi011 = this.perm[X + this.perm[Y + 1 + this.perm[Z + 1]]] % 12;
    const gi100 = this.perm[X + 1 + this.perm[Y + this.perm[Z]]] % 12;
    const gi101 = this.perm[X + 1 + this.perm[Y + this.perm[Z + 1]]] % 12;
    const gi110 = this.perm[X + 1 + this.perm[Y + 1 + this.perm[Z]]] % 12;
    const gi111 = this.perm[X + 1 + this.perm[Y + 1 + this.perm[Z + 1]]] % 12;

    // Calculate noise contributions from corners
    const n000 = this.perlinDot(this.grad3[gi000], x, y, z);
    const n100 = this.perlinDot(this.grad3[gi100], x - 1, y, z);
    const n010 = this.perlinDot(this.grad3[gi010], x, y - 1, z);
    const n110 = this.perlinDot(this.grad3[gi110], x - 1, y - 1, z);
    const n001 = this.perlinDot(this.grad3[gi001], x, y, z - 1);
    const n101 = this.perlinDot(this.grad3[gi101], x - 1, y, z - 1);
    const n011 = this.perlinDot(this.grad3[gi011], x, y - 1, z - 1);
    const n111 = this.perlinDot(this.grad3[gi111], x - 1, y - 1, z - 1);

    // Compute ease curve for each axis
    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);

    // Interpolate along x
    const nx00 = this.mix(n000, n100, u);
    const nx01 = this.mix(n001, n101, u);
    const nx10 = this.mix(n010, n110, u);
    const nx11 = this.mix(n011, n111, u);

    // Interpolate along y
    const nxy0 = this.mix(nx00, nx10, v);
    const nxy1 = this.mix(nx01, nx11, v);

    // Interpolate along z
    return this.mix(nxy0, nxy1, w);
  }

  /**
   * Generate multi-octave Perlin noise
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   * @param octaves - Number of octaves to combine
   * @param persistence - Amplitude reduction per octave (default: 0.5)
   * @param lacunarity - Frequency increase per octave (default: 2.0)
   * @returns Noise value between -1 and 1
   */
  public octaveNoise(
    x: number,
    y: number,
    z: number,
    octaves: number = 4,
    persistence: number = 0.5,
    lacunarity: number = 2.0,
  ): number {
    let total = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return total / maxValue;
  }

  /**
   * Generate tileable noise using toroidal projection
   * Useful for seamless textures
   */
  public tileableNoise(
    x: number,
    y: number,
    width: number,
    height: number,
    octaves: number = 4,
  ): number {
    const twoPi = Math.PI * 2;
    const at = 1;
    const ct = 4;

    const xt = (ct + at * Math.cos((twoPi * y) / height)) * Math.cos((twoPi * x) / width);
    const yt = (ct + at * Math.cos((twoPi * y) / height)) * Math.sin((twoPi * x) / width);
    const zt = at * Math.sin((twoPi * y) / height);

    return this.octaveNoise(xt, yt, zt, octaves);
  }
}

/**
 * Generate a procedural texture on a canvas
 */
export function generateProceduralTexture(
  width: number,
  height: number,
  config: {
    baseColor: [number, number, number, number];
    noise: Array<{
      color: [number, number, number, number];
      octaves?: number;
      persistence?: number;
      lacunarity?: number;
      scale?: number;
    }>;
    tileable?: boolean;
    seed?: number;
  },
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  // Fill with base color
  for (let i = 0; i < width * height * 4; i += 4) {
    data[i] = config.baseColor[0];
    data[i + 1] = config.baseColor[1];
    data[i + 2] = config.baseColor[2];
    data[i + 3] = config.baseColor[3];
  }

  // Add noise layers
  const perlin = new PerlinNoise(config.seed);

  for (const noiseLayer of config.noise) {
    const scale = noiseLayer.scale || 1;
    let p = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Generate noise value
        let noiseValue: number;
        if (config.tileable) {
          noiseValue = perlin.tileableNoise(
            x * scale,
            y * scale,
            width,
            height,
            noiseLayer.octaves || 4,
          );
        } else {
          noiseValue = perlin.octaveNoise(
            (x / width) * scale,
            (y / height) * scale,
            0,
            noiseLayer.octaves || 4,
            noiseLayer.persistence || 0.5,
            noiseLayer.lacunarity || 2.0,
          );
        }

        // Normalize to 0-1
        noiseValue = (noiseValue + 1) / 2;

        // Apply noise to RGB channels
        for (let c = 0; c < 3; c++, p++) {
          const colorContribution = noiseValue * noiseLayer.color[c] * (noiseLayer.color[3] / 255);
          data[p] = Math.floor(Math.min(255, Math.max(0, data[p] + colorContribution)));
        }
        p++; // Skip alpha channel
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
