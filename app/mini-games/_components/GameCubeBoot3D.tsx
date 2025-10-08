'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface GameCubeBoot3DProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface GameCube {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  targetPosition: THREE.Vector3;
  targetRotation: THREE.Euler;
  targetScale: number;
  isAssembled: boolean;
  faceIndex: number;
}

export default function GameCubeBoot3D({ onComplete, onSkip }: GameCubeBoot3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cubesRef = useRef<GameCube[]>([]);
  const animationIdRef = useRef<number | null>(null);
  const [isSkippable, setIsSkippable] = useState(false);
  const [phase, setPhase] = useState<'rolling' | 'assembling' | 'complete'>('rolling');
  const [showSkip, setShowSkip] = useState(false);

  // GameCube colors and materials
  const createGameCubeMaterial = (color: string) => {
    return new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      shininess: 100,
      specular: new THREE.Color(0x222222),
      transparent: true,
      opacity: 0.9,
    });
  };

  const materials = {
    purple: createGameCubeMaterial('#8b5cf6'),
    pink: createGameCubeMaterial('#ec4899'),
    indigo: createGameCubeMaterial('#6366f1'),
    violet: createGameCubeMaterial('#a855f7'),
  };

  // Create individual GameCube
  const createGameCube = (
    position: THREE.Vector3,
    material: THREE.Material,
    faceIndex: number,
  ): GameCube => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const mesh = new THREE.Mesh(geometry, material);

    // Add GameCube logo texture to one face
    const logoGeometry = new THREE.PlaneGeometry(0.8, 0.8);
    const logoMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.z = 0.51;
    mesh.add(logo);

    // Add subtle glow effect
    const glowGeometry = new THREE.BoxGeometry(1.1, 1.1, 1.1);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff69b4,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    mesh.add(glow);

    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return {
      mesh,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
      ),
      angularVelocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
      ),
      position: position.clone(),
      rotation: new THREE.Euler(0, 0, 0),
      scale: 1,
      targetPosition: position.clone(),
      targetRotation: new THREE.Euler(0, 0, 0),
      targetScale: 1,
      isAssembled: false,
      faceIndex,
    };
  };

  // Initialize 3D scene
  const initScene = useCallback(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080611);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // Point lights for dramatic effect
    const pointLight1 = new THREE.PointLight(0xec4899, 1, 20);
    pointLight1.position.set(-5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 1, 20);
    pointLight2.position.set(5, 5, -5);
    scene.add(pointLight2);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshLambertMaterial({
      color: 0x1a1a2e,
      transparent: true,
      opacity: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create 4 GameCubes
    const cubePositions = [
      new THREE.Vector3(-8, 2, -5),
      new THREE.Vector3(-3, 3, -8),
      new THREE.Vector3(3, 2, -6),
      new THREE.Vector3(8, 3, -4),
    ];

    const cubeMaterials = [materials.purple, materials.pink, materials.indigo, materials.violet];

    cubesRef.current = cubePositions.map((pos, i) => createGameCube(pos, cubeMaterials[i], i));

    cubesRef.current.forEach((cube) => {
      scene.add(cube.mesh);
    });

    // Start animation
    animate();
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return;

    const deltaTime = 0.016; // ~60fps

    // Update cubes based on current phase
    if (phase === 'rolling') {
      updateRollingCubes(deltaTime);
    } else if (phase === 'assembling') {
      updateAssemblingCubes(deltaTime);
    }

    // Render
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationIdRef.current = requestAnimationFrame(animate);
  }, [phase]);

  // Update rolling cubes
  const updateRollingCubes = (deltaTime: number) => {
    cubesRef.current.forEach((cube, _index) => {
      // Apply gravity
      cube.velocity.y -= 0.01 * deltaTime * 60;

      // Update position
      cube.position.add(cube.velocity.clone().multiplyScalar(deltaTime * 60));
      cube.mesh.position.copy(cube.position);

      // Update rotation
      cube.rotation.x += cube.angularVelocity.x * deltaTime * 60;
      cube.rotation.y += cube.angularVelocity.y * deltaTime * 60;
      cube.rotation.z += cube.angularVelocity.z * deltaTime * 60;
      cube.mesh.rotation.copy(cube.rotation);

      // Ground collision
      if (cube.position.y <= 0.5) {
        cube.position.y = 0.5;
        cube.velocity.y *= -0.6; // Bounce with energy loss
        cube.velocity.x *= 0.9; // Friction
        cube.velocity.z *= 0.9;
      }

      // Wall collisions
      if (Math.abs(cube.position.x) > 8) {
        cube.velocity.x *= -0.8;
        cube.position.x = Math.sign(cube.position.x) * 8;
      }
      if (Math.abs(cube.position.z) > 8) {
        cube.velocity.z *= -0.8;
        cube.position.z = Math.sign(cube.position.z) * 8;
      }

      // Add some random movement
      cube.velocity.add(
        new THREE.Vector3((Math.random() - 0.5) * 0.001, 0, (Math.random() - 0.5) * 0.001),
      );
    });
  };

  // Update assembling cubes
  const updateAssemblingCubes = (deltaTime: number) => {
    const centerPosition = new THREE.Vector3(0, 1, 0);
    const assemblyRadius = 2;

    cubesRef.current.forEach((cube, index) => {
      // Calculate target position in O-shape
      const angle = (index / 4) * Math.PI * 2;
      const targetPos = new THREE.Vector3(
        centerPosition.x + Math.cos(angle) * assemblyRadius,
        centerPosition.y,
        centerPosition.z + Math.sin(angle) * assemblyRadius,
      );

      // Smooth movement to target
      cube.position.lerp(targetPos, deltaTime * 2);
      cube.mesh.position.copy(cube.position);

      // Smooth rotation to face center
      const targetRotation = new THREE.Euler(0, angle, 0);
      cube.rotation.x = THREE.MathUtils.lerp(cube.rotation.x, targetRotation.x, deltaTime * 2);
      cube.rotation.y = THREE.MathUtils.lerp(cube.rotation.y, targetRotation.y, deltaTime * 2);
      cube.rotation.z = THREE.MathUtils.lerp(cube.rotation.z, targetRotation.z, deltaTime * 2);
      cube.mesh.rotation.copy(cube.rotation);

      // Scale animation
      cube.scale = THREE.MathUtils.lerp(cube.scale, 0.8, deltaTime * 2);
      cube.mesh.scale.setScalar(cube.scale);

      // Check if assembled
      if (cube.position.distanceTo(targetPos) < 0.1 && !cube.isAssembled) {
        cube.isAssembled = true;
      }
    });

    // Check if all cubes are assembled
    if (cubesRef.current.every((cube) => cube.isAssembled)) {
      setTimeout(() => {
        setPhase('complete');
        setTimeout(() => {
          onComplete();
        }, 2000);
      }, 1000);
    }
  };

  // Start assembly phase
  const startAssembly = useCallback(() => {
    setPhase('assembling');
  }, []);

  // Handle skip
  const handleSkip = useCallback(() => {
    if (isSkippable) {
      onSkip();
    }
  }, [isSkippable, onSkip]);

  // Handle keyboard input
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (isSkippable && (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape')) {
        e.preventDefault();
        handleSkip();
      }
    },
    [isSkippable, handleSkip],
  );

  // Handle window resize
  const handleResize = useCallback(() => {
    if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initScene();

    // Allow skipping after 2 seconds
    const skipTimer = setTimeout(() => {
      setIsSkippable(true);
      setShowSkip(true);
    }, 2000);

    // Start assembly after 3 seconds
    const assemblyTimer = setTimeout(() => {
      startAssembly();
    }, 3000);

    // Add event listeners
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearTimeout(skipTimer);
      clearTimeout(assemblyTimer);
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('resize', handleResize);

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [initScene, startAssembly, handleKeyPress, handleResize]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-pointer" onClick={handleSkip} />

      {/* Skip Button */}
      {showSkip && (
        <button
          className="absolute bottom-8 right-8 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 text-sm transition-colors backdrop-blur-sm border border-white/20"
          onClick={handleSkip}
          aria-label="Skip boot animation"
        >
          Skip
        </button>
      )}

      {/* Loading Text */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-white/60 text-sm mb-2">
          {phase === 'rolling' && 'Rolling cubes...'}
          {phase === 'assembling' && 'Assembling GameCube...'}
          {phase === 'complete' && 'Loading OTAKU-MORI...'}
        </div>
        <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-1000"
            style={{
              width: phase === 'rolling' ? '33%' : phase === 'assembling' ? '66%' : '100%',
            }}
          />
        </div>
      </div>

      {/* Brand Text */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center">
        <h1 className="text-4xl font-bold text-white tracking-wider mb-2">OTAKU-MORI™</h1>
        <p className="text-white/60 text-sm">Select a face to navigate</p>
      </div>
    </div>
  );
}
