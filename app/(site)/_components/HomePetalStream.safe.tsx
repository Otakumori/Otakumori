'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createEngine, type EngineCallbacks } from '@/app/mini-games/_engine/Engine.safe';
import { createTextureFromUrl } from '@/app/mini-games/_engine/glTexture.safe';
import { petalCredit, PetalCreditError } from '@/app/lib/petals/credit.safe';

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  scale: number;
  variant: number;
  collected: boolean;
  collectTime: number;
  targetX: number;
  targetY: number;
}

interface HomePetalStreamProps {
  className?: string;
  onBalanceUpdate?: (newBalance: number) => void;
}

export default function HomePetalStream({ className = '', onBalanceUpdate }: HomePetalStreamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const petalsRef = useRef<Petal[]>([]);
  const collectedCountRef = useRef(0);
  const lastCollectTimeRef = useRef(0);
  const walletPositionRef = useRef({ x: 0, y: 0 });

  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyCapReached, setDailyCapReached] = useState(false);

  // Check for reduced motion preference
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Initialize WebGL2 context and shaders
  const initializeWebGL = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
    });

    if (!gl) {
      setError('WebGL2 not supported');
      return false;
    }

    glRef.current = gl;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create shader program
    const vertexShaderSource = `#version 300 es
      in vec2 a_position;
      in vec2 a_texCoord;
      in vec2 a_instancePosition;
      in float a_instanceScale;
      in float a_instanceAngle;
      in float a_instanceVariant;
      
      out vec2 v_texCoord;
      out float v_variant;
      
      uniform vec2 u_resolution;
      
      void main() {
        // Apply rotation
        float cosA = cos(a_instanceAngle);
        float sinA = sin(a_instanceAngle);
        vec2 rotated = vec2(
          a_position.x * cosA - a_position.y * sinA,
          a_position.x * sinA + a_position.y * cosA
        );
        
        // Apply scale and position
        vec2 scaled = rotated * a_instanceScale;
        vec2 position = (a_instancePosition + scaled) / u_resolution * 2.0 - 1.0;
        position.y = -position.y; // Flip Y coordinate
        
        gl_Position = vec4(position, 0.0, 1.0);
        v_texCoord = a_texCoord;
        v_variant = a_instanceVariant;
      }
    `;

    const fragmentShaderSource = `#version 300 es
      precision highp float;
      
      in vec2 v_texCoord;
      in float v_variant;
      out vec4 fragColor;
      
      uniform sampler2D u_texture;
      uniform float u_time;
      
      void main() {
        // Sample texture with variant offset
        vec2 texCoord = v_texCoord + vec2(v_variant * 0.25, 0.0);
        vec4 color = texture(u_texture, texCoord);
        
        // Add subtle animation
        float pulse = sin(u_time * 2.0 + v_variant) * 0.1 + 0.9;
        color.rgb *= pulse;
        
        fragColor = color;
      }
    `;

    const program = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program) {
      setError('Failed to create shader program');
      return false;
    }

    programRef.current = program;

    // Load texture
    try {
      const texture = await createTextureFromUrl(gl, '/assets/petals-atlas.png');
      textureRef.current = texture;
    } catch (err) {
      console.warn('Failed to load petal texture, using fallback');
      // Create a simple colored texture as fallback
      textureRef.current = createFallbackTexture(gl);
    }

    return true;
  }, []);

  // Create shader program helper
  const createShaderProgram = (gl: WebGL2RenderingContext, vsSource: string, fsSource: string) => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Shader program linking error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    return program;
  };

  const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  // Create fallback texture
  const createFallbackTexture = (gl: WebGL2RenderingContext) => {
    const texture = gl.createTexture();
    if (!texture) return null;

    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Create a simple pink square
    const size = 64;
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const offset = i * 4;
      data[offset] = 236; // R
      data[offset + 1] = 72; // G
      data[offset + 2] = 153; // B
      data[offset + 3] = 255; // A
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return texture;
  };

  // Initialize petals
  const initializePetals = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const petalCount = prefersReducedMotion.current ? 5 : 20;
    const petals: Petal[] = [];

    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * canvas.width,
        y: -50 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.1,
        scale: Math.random() * 0.5 + 0.5,
        variant: Math.floor(Math.random() * 4),
        collected: false,
        collectTime: 0,
        targetX: 0,
        targetY: 0,
      });
    }

    petalsRef.current = petals;
  }, []);

  // Handle pointer interaction
  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (prefersReducedMotion.current || dailyCapReached) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);

      // Check for petal hits
      const hitRadius = 30;
      let hitCount = 0;

      petalsRef.current.forEach((petal) => {
        if (petal.collected) return;

        const dx = x - petal.x;
        const dy = y - petal.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < hitRadius) {
          petal.collected = true;
          petal.collectTime = 0;
          petal.targetX = walletPositionRef.current.x;
          petal.targetY = walletPositionRef.current.y;
          hitCount++;
        }
      });

      if (hitCount > 0) {
        collectedCountRef.current += hitCount;
      }
    },
    [dailyCapReached],
  );

  // Update wallet position (where collected petals should animate to)
  const updateWalletPosition = useCallback(() => {
    // Try to find the petal balance element in the header
    const petalElement = document.querySelector('[data-petal-balance]') as HTMLElement;
    if (petalElement) {
      const rect = petalElement.getBoundingClientRect();
      const canvas = canvasRef.current;
      if (canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        walletPositionRef.current = {
          x: (rect.left + rect.width / 2 - canvasRect.left) * (canvas.width / canvasRect.width),
          y: (rect.top + rect.height / 2 - canvasRect.top) * (canvas.height / canvasRect.height),
        };
      }
    }
  }, []);

  // Batch collect petals
  const batchCollectPetals = useCallback(async () => {
    const count = collectedCountRef.current;
    if (count === 0) return;

    try {
      const newBalance = await petalCredit.collect({
        source: 'homepage-stream',
        amount: count,
      });

      onBalanceUpdate?.(newBalance);
      collectedCountRef.current = 0;
    } catch (error) {
      if (error instanceof PetalCreditError && error.isRateLimited) {
        setDailyCapReached(true);
        // Daily petal collection cap reached
      } else {
        console.error('Failed to collect petals:', error);
      }
    }
  }, [onBalanceUpdate]);

  // Initialize everything
  useEffect(() => {
    const init = async () => {
      if (prefersReducedMotion.current) {
        // Show passive effect only
        initializePetals();
        setIsInitialized(true);
        return;
      }

      const success = await initializeWebGL();
      if (!success) return;

      initializePetals();
      updateWalletPosition();

      // Set up engine
      const callbacks: EngineCallbacks = {
        update: (deltaTime: number) => {
          updatePetals(deltaTime);
        },
        render: () => {
          renderPetals();
        },
      };

      engineRef.current = createEngine(callbacks);
      engineRef.current.start();

      setIsInitialized(true);
    };

    init();

    return () => {
      engineRef.current?.stop();
    };
  }, [initializeWebGL, initializePetals, updateWalletPosition]);

  // Set up event listeners
  useEffect(() => {
    if (!isInitialized || prefersReducedMotion.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', updateWalletPosition);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', updateWalletPosition);
    };
  }, [isInitialized, handlePointerDown, updateWalletPosition]);

  // Batch collect petals periodically
  useEffect(() => {
    if (prefersReducedMotion.current) return;

    const interval = setInterval(
      () => {
        if (collectedCountRef.current > 0) {
          batchCollectPetals();
        }
      },
      600 + Math.random() * 300,
    ); // 600-900ms jitter

    return () => clearInterval(interval);
  }, [batchCollectPetals]);

  // Update petals
  const updatePetals = (deltaTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    petalsRef.current.forEach((petal) => {
      if (petal.collected) {
        // Animate to wallet
        const dx = petal.targetX - petal.x;
        const dy = petal.targetY - petal.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
          const speed = 0.1;
          petal.x += dx * speed;
          petal.y += dy * speed;
        } else {
          // Remove collected petal
          petal.x = Math.random() * canvas.width;
          petal.y = -50 - Math.random() * 100;
          petal.collected = false;
          petal.vx = (Math.random() - 0.5) * 2;
          petal.vy = Math.random() * 2 + 1;
        }
      } else {
        // Normal falling motion
        petal.x += petal.vx * deltaTime * 0.01;
        petal.y += petal.vy * deltaTime * 0.01;
        petal.angle += petal.angularVelocity * deltaTime * 0.01;

        // Reset if fallen off screen
        if (petal.y > canvas.height + 50) {
          petal.x = Math.random() * canvas.width;
          petal.y = -50 - Math.random() * 100;
          petal.vx = (Math.random() - 0.5) * 2;
          petal.vy = Math.random() * 2 + 1;
        }
      }
    });
  };

  // Render petals
  const renderPetals = () => {
    const gl = glRef.current;
    const program = programRef.current;
    const texture = textureRef.current;
    const canvas = canvasRef.current;

    if (!gl || !program || !texture || !canvas) return;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    // Set uniforms
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const textureLocation = gl.getUniformLocation(program, 'u_texture');

    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(timeLocation, performance.now() * 0.001);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(textureLocation, 0);

    // Set up vertex data
    const positions = new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]);

    const texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);

    // Create instance data
    const instancePositions = new Float32Array(petalsRef.current.length * 2);
    const instanceScales = new Float32Array(petalsRef.current.length);
    const instanceAngles = new Float32Array(petalsRef.current.length);
    const instanceVariants = new Float32Array(petalsRef.current.length);

    petalsRef.current.forEach((petal, i) => {
      instancePositions[i * 2] = petal.x;
      instancePositions[i * 2 + 1] = petal.y;
      instanceScales[i] = petal.scale;
      instanceAngles[i] = petal.angle;
      instanceVariants[i] = petal.variant;
    });

    // Set up vertex attributes
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    const instancePositionLocation = gl.getAttribLocation(program, 'a_instancePosition');
    const instanceScaleLocation = gl.getAttribLocation(program, 'a_instanceScale');
    const instanceAngleLocation = gl.getAttribLocation(program, 'a_instanceAngle');
    const instanceVariantLocation = gl.getAttribLocation(program, 'a_instanceVariant');

    // Create and bind buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Instance buffers
    const instancePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instancePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, instancePositions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(instancePositionLocation);
    gl.vertexAttribPointer(instancePositionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(instancePositionLocation, 1);

    const instanceScaleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceScaleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, instanceScales, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(instanceScaleLocation);
    gl.vertexAttribPointer(instanceScaleLocation, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(instanceScaleLocation, 1);

    const instanceAngleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceAngleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, instanceAngles, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(instanceAngleLocation);
    gl.vertexAttribPointer(instanceAngleLocation, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(instanceAngleLocation, 1);

    const instanceVariantBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceVariantBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, instanceVariants, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(instanceVariantLocation);
    gl.vertexAttribPointer(instanceVariantLocation, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(instanceVariantLocation, 1);

    // Draw
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, petalsRef.current.length);
  };

  if (error) {
    return (
      <div className={`text-center text-gray-400 ${className}`}>
        <p>Petal stream unavailable: {error}</p>
      </div>
    );
  }

  if (dailyCapReached) {
    return (
      <div className={`text-center text-pink-400 ${className}`}>
        <p>Daily cap reached</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} data-petal-stream>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          background: 'transparent',
          cursor: prefersReducedMotion.current ? 'default' : 'pointer',
        }}
      />
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          Loading petals...
        </div>
      )}
    </div>
  );
}
