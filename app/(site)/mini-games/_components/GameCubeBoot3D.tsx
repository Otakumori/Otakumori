'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface GameCubeBoot3DProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function GameCubeBoot3D({ onComplete, onSkip }: GameCubeBoot3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cubeRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isSkippable, setIsSkippable] = useState(false);
  const [phase, setPhase] = useState<'spin' | 'logo' | 'complete'>('spin');
  const [showSkip, setShowSkip] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Initialize 3D scene
  const initScene = useCallback(() => {
    if (!mountRef.current) return;

    // Scene with dark purple gradient background (like GameCube)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0520); // Deep purple-black
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting (simple, like GameCube)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(2, 2, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8b5cf6, 0.3);
    fillLight.position.set(-2, -1, -1);
    scene.add(fillLight);

    // Create the cube (simple, like GameCube)
    const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);

    // Create gradient material for the cube
    const material = new THREE.MeshPhongMaterial({
      color: 0xa855f7, // Purple
      shininess: 80,
      specular: 0x444444,
    });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cubeRef.current = cube;

    // Add edge highlights (like GameCube)
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      opacity: 0.3,
      transparent: true,
    });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    cube.add(wireframe);

    // Start animation
    startTimeRef.current = Date.now();
    animate();
  }, []);

  // Animation loop (authentic GameCube style)
  const animate = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current || !cubeRef.current) return;

    const elapsedTime = (Date.now() - startTimeRef.current) / 1000; // seconds

    if (phase === 'spin') {
      // Phase 1: Spinning cube (1.5s) - authentic GameCube rotation
      // The cube spins fast initially, then slows down
      const spinDuration = 1.5;
      const t = Math.min(elapsedTime / spinDuration, 1);

      // Ease out cubic for deceleration
      const eased = 1 - Math.pow(1 - t, 3);

      // Multiple rotations that slow down
      cubeRef.current.rotation.y = eased * Math.PI * 4; // 2 full rotations
      cubeRef.current.rotation.x = eased * Math.PI * 2; // 1 full rotation

      // Slight scale pulse
      const scale = 1 + Math.sin(elapsedTime * 3) * 0.05;
      cubeRef.current.scale.setScalar(scale);

      if (elapsedTime > spinDuration) {
        setPhase('logo');
        startTimeRef.current = Date.now(); // Reset for next phase
      }
    } else if (phase === 'logo') {
      // Phase 2: Logo reveal (1.5s) - cube settles into final position
      const logoDuration = 1.5;
      const t = Math.min(elapsedTime / logoDuration, 1);

      // Ease out for settling
      const eased = 1 - Math.pow(1 - t, 2);

      // Target rotation: front face showing
      const targetRotX = 0;
      const targetRotY = 0;

      // Lerp from current rotation to target
      cubeRef.current.rotation.x = THREE.MathUtils.lerp(
        cubeRef.current.rotation.x,
        targetRotX,
        eased,
      );
      cubeRef.current.rotation.y = THREE.MathUtils.lerp(
        cubeRef.current.rotation.y,
        targetRotY,
        eased,
      );

      // Scale to final size
      cubeRef.current.scale.setScalar(1);

      if (elapsedTime > logoDuration) {
        setPhase('complete');
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    }

    // Render
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationIdRef.current = requestAnimationFrame(animate);
  }, [phase, onComplete]);

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

    // Allow skipping after 1 second
    const skipTimer = setTimeout(() => {
      setIsSkippable(true);
      setShowSkip(true);
    }, 1000);

    // Add event listeners
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      clearTimeout(skipTimer);
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
  }, [initScene, handleKeyPress, handleResize]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, #1a0b2e 0%, #0a0520 100%)',
      }}
    >
      {/* 3D Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-pointer"
        onClick={handleSkip}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') handleSkip();
        }}
        role="button"
        tabIndex={0}
        aria-label="GameCube boot animation - press any key to skip"
      />

      {/* Skip Button */}
      {showSkip && (
        <button
          className="absolute bottom-8 right-8 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 text-xs transition-colors backdrop-blur-sm border border-white/10"
          onClick={handleSkip}
          aria-label="Skip boot animation"
        >
          Press any key to skip
        </button>
      )}

      {/* Brand Text (appears in logo phase) */}
      {phase !== 'spin' && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ marginTop: '120px' }}
        >
          <div
            className="text-center opacity-0 animate-fadeIn"
            style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
          >
            <h1
              className="text-3xl font-bold text-white tracking-[0.3em] mb-1"
              style={{
                fontFamily: 'Arial, sans-serif',
                textShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
              }}
            >
              OTAKU-MORI
            </h1>
            <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
          </div>
        </div>
      )}

      {/* Add fadeIn animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.8s ease-out;
          }
        `,
        }}
      />
    </div>
  );
}
