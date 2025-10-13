/**
 * Dynamic Lighting System
 * Real-time lighting effects with shadows, volumetric lighting, and interactive illumination
 */

export interface LightSource {
  id: string;
  type: 'point' | 'directional' | 'spot' | 'ambient';
  position: { x: number; y: number; z: number };
  color: { r: number; g: number; b: number };
  intensity: number;
  range: number;
  falloff: number;
  castsShadows: boolean;
  animated: boolean;
  animationSpeed?: number;
  animationOffset?: number;
}

export interface Shadow {
  casterId: string;
  vertices: { x: number; y: number }[];
  opacity: number;
  blur: number;
  color: string;
}

export interface VolumetricEffect {
  id: string;
  type: 'fog' | 'rays' | 'particles';
  density: number;
  color: { r: number; g: number; b: number; a: number };
  animated: boolean;
  windInfluence: number;
}

export class DynamicLightingEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lightSources: Map<string, LightSource> = new Map();
  private shadows: Shadow[] = [];
  private volumetricEffects: Map<string, VolumetricEffect> = new Map();
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private time: number = 0;
  private ambientLight: { r: number; g: number; b: number; intensity: number };
  private shadowCasters: Array<{ id: string; bounds: DOMRect; element: HTMLElement }> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;

    this.ambientLight = { r: 0.1, g: 0.05, b: 0.2, intensity: 0.3 };

    // Set up canvas for lighting effects
    this.setupCanvas();
  }

  private setupCanvas(): void {
    // Enable shadow blur and other advanced features
    this.ctx.shadowBlur = 0;
    this.ctx.globalCompositeOperation = 'source-over';

    // Set high-quality rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  // Add a light source
  public addLight(light: LightSource): void {
    this.lightSources.set(light.id, light);
  }

  // Remove a light source
  public removeLight(id: string): void {
    this.lightSources.delete(id);
  }

  // Update light properties
  public updateLight(id: string, updates: Partial<LightSource>): void {
    const light = this.lightSources.get(id);
    if (light) {
      this.lightSources.set(id, { ...light, ...updates });
    }
  }

  // Add volumetric effect
  public addVolumetricEffect(effect: VolumetricEffect): void {
    this.volumetricEffects.set(effect.id, effect);
  }

  // Set mouse position for interactive lighting
  public setMousePosition(x: number, y: number): void {
    this.mousePosition = { x, y };
  }

  // Register shadow casters (DOM elements that cast shadows)
  public registerShadowCaster(id: string, element: HTMLElement): void {
    const bounds = element.getBoundingClientRect();
    this.shadowCasters.push({ id, bounds, element });
  }

  // Calculate shadows from light sources
  private calculateShadows(): void {
    this.shadows = [];

    for (const [lightId, light] of this.lightSources) {
      if (!light.castsShadows) continue;

      for (const caster of this.shadowCasters) {
        const shadow = this.calculateShadowFromLight(light, caster);
        if (shadow) {
          this.shadows.push(shadow);
        }
      }
    }
  }

  private calculateShadowFromLight(
    light: LightSource,
    caster: { id: string; bounds: DOMRect },
  ): Shadow | null {
    const lightPos = light.position;
    const bounds = caster.bounds;

    // Convert light position to 2D screen coordinates
    const lightX = lightPos.x;
    const lightY = lightPos.y;

    // Calculate shadow projection
    const corners = [
      { x: bounds.left, y: bounds.top },
      { x: bounds.right, y: bounds.top },
      { x: bounds.right, y: bounds.bottom },
      { x: bounds.left, y: bounds.bottom },
    ];

    // Project shadow vertices
    const shadowVertices = corners.map((corner) => {
      const dx = corner.x - lightX;
      const dy = corner.y - lightY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Extend shadow based on light distance and intensity
      const shadowLength = (light.range * 2) / Math.max(distance, 1);

      return {
        x: corner.x + dx * shadowLength,
        y: corner.y + dy * shadowLength,
      };
    });

    // Calculate shadow opacity based on light intensity and distance
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const distanceToLight = Math.sqrt(
      Math.pow(centerX - lightX, 2) + Math.pow(centerY - lightY, 2),
    );

    const opacity = Math.max(
      0,
      Math.min(0.8, light.intensity * (1 - distanceToLight / light.range)),
    );

    return {
      casterId: caster.id,
      vertices: shadowVertices,
      opacity,
      blur: 15,
      color: `rgba(0, 0, 0, ${opacity})`,
    };
  }

  // Render volumetric effects (fog, light rays)
  private renderVolumetricEffects(): void {
    for (const [effectId, effect] of this.volumetricEffects) {
      switch (effect.type) {
        case 'fog':
          this.renderFog(effect);
          break;
        case 'rays':
          this.renderLightRays(effect);
          break;
        case 'particles':
          this.renderLightParticles(effect);
          break;
      }
    }
  }

  private renderFog(effect: VolumetricEffect): void {
    const { color, density, animated } = effect;

    // Create animated fog using multiple gradients
    const numLayers = 3;

    for (let i = 0; i < numLayers; i++) {
      const gradient = this.ctx.createRadialGradient(
        this.canvas.width / 2,
        this.canvas.height / 2,
        0,
        this.canvas.width / 2,
        this.canvas.height / 2,
        Math.max(this.canvas.width, this.canvas.height),
      );

      const animationOffset = animated ? Math.sin(this.time * 0.001 + i) * 0.1 : 0;
      const layerDensity = density * (0.3 + i * 0.2) + animationOffset;

      gradient.addColorStop(
        0,
        `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${layerDensity})`,
      );
      gradient.addColorStop(
        0.5,
        `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${layerDensity * 0.5})`,
      );
      gradient.addColorStop(1, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 0)`);

      this.ctx.globalCompositeOperation = 'screen';
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.ctx.globalCompositeOperation = 'source-over';
  }

  private renderLightRays(effect: VolumetricEffect): void {
    const { color, density, animated } = effect;

    // Render light rays from each light source
    for (const [lightId, light] of this.lightSources) {
      if (light.type === 'directional' || light.type === 'spot') {
        const numRays = 12;
        const rayLength = light.range * 1.5;

        for (let i = 0; i < numRays; i++) {
          const angle = (i / numRays) * Math.PI * 2;
          const animationOffset = animated ? Math.sin(this.time * 0.002 + i) * 0.3 : 0;

          const startX = light.position.x;
          const startY = light.position.y;
          const endX = startX + Math.cos(angle) * rayLength;
          const endY = startY + Math.sin(angle) * rayLength;

          // Create gradient for ray
          const gradient = this.ctx.createLinearGradient(startX, startY, endX, endY);
          gradient.addColorStop(
            0,
            `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${density + animationOffset})`,
          );
          gradient.addColorStop(
            0.7,
            `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${(density + animationOffset) * 0.3})`,
          );
          gradient.addColorStop(1, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 0)`);

          this.ctx.globalCompositeOperation = 'screen';
          this.ctx.strokeStyle = gradient;
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(startX, startY);
          this.ctx.lineTo(endX, endY);
          this.ctx.stroke();
        }
      }
    }

    this.ctx.globalCompositeOperation = 'source-over';
  }

  private renderLightParticles(effect: VolumetricEffect): void {
    const { color, density, animated } = effect;
    const numParticles = Math.floor(density * 100);

    for (let i = 0; i < numParticles; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const size = Math.random() * 3 + 1;

      const animationOffset = animated ? Math.sin(this.time * 0.003 + i * 0.1) * 0.5 + 0.5 : 1;

      const alpha = density * animationOffset * 0.6;

      this.ctx.globalCompositeOperation = 'screen';
      this.ctx.fillStyle = `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.globalCompositeOperation = 'source-over';
  }

  // Render individual light sources
  private renderLights(): void {
    for (const [lightId, light] of this.lightSources) {
      this.renderLight(light);
    }
  }

  private renderLight(light: LightSource): void {
    const {
      position,
      color,
      intensity,
      range,
      animated,
      animationSpeed = 1,
      animationOffset = 0,
    } = light;

    // Calculate animated intensity
    const currentIntensity = animated
      ? intensity * (0.8 + 0.2 * Math.sin(this.time * 0.001 * animationSpeed + animationOffset))
      : intensity;

    // Create radial gradient for light
    const gradient = this.ctx.createRadialGradient(
      position.x,
      position.y,
      0,
      position.x,
      position.y,
      range,
    );

    const lightColor = `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${currentIntensity})`;
    const fadeColor = `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 0)`;

    gradient.addColorStop(0, lightColor);
    gradient.addColorStop(
      0.3,
      `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${currentIntensity * 0.7})`,
    );
    gradient.addColorStop(
      0.7,
      `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, ${currentIntensity * 0.3})`,
    );
    gradient.addColorStop(1, fadeColor);

    // Render light with appropriate blend mode
    this.ctx.globalCompositeOperation = light.type === 'ambient' ? 'source-over' : 'screen';
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, range, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // Render shadows
  private renderShadows(): void {
    this.ctx.globalCompositeOperation = 'multiply';

    for (const shadow of this.shadows) {
      this.ctx.fillStyle = shadow.color;
      this.ctx.shadowBlur = shadow.blur;
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';

      this.ctx.beginPath();
      if (shadow.vertices.length > 0) {
        this.ctx.moveTo(shadow.vertices[0].x, shadow.vertices[0].y);
        for (let i = 1; i < shadow.vertices.length; i++) {
          this.ctx.lineTo(shadow.vertices[i].x, shadow.vertices[i].y);
        }
        this.ctx.closePath();
        this.ctx.fill();
      }
    }

    this.ctx.shadowBlur = 0;
    this.ctx.globalCompositeOperation = 'source-over';
  }

  // Main render function
  public render(deltaTime: number): void {
    this.time += deltaTime;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate shadows
    this.calculateShadows();

    // Render ambient light
    const ambientGradient = this.ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height / 2,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2,
      Math.max(this.canvas.width, this.canvas.height) / 2,
    );

    const { r, g, b, intensity } = this.ambientLight;
    ambientGradient.addColorStop(0, `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${intensity})`);
    ambientGradient.addColorStop(1, `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${intensity * 0.3})`);

    this.ctx.fillStyle = ambientGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render volumetric effects
    this.renderVolumetricEffects();

    // Render light sources
    this.renderLights();

    // Render shadows
    this.renderShadows();
  }

  // Set ambient light
  public setAmbientLight(r: number, g: number, b: number, intensity: number): void {
    this.ambientLight = { r, g, b, intensity };
  }

  // Update canvas size
  public updateCanvasSize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.setupCanvas();
  }

  // Get light source by id
  public getLight(id: string): LightSource | undefined {
    return this.lightSources.get(id);
  }

  // Get all light sources
  public getAllLights(): LightSource[] {
    return Array.from(this.lightSources.values());
  }

  // Clear all lights
  public clearLights(): void {
    this.lightSources.clear();
  }

  // Clear all volumetric effects
  public clearVolumetricEffects(): void {
    this.volumetricEffects.clear();
  }
}
