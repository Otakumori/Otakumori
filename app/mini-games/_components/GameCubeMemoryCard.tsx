'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface GameCubeMemoryCardProps {
  onInsert: () => void;
  onEject: () => void;
  isInserted: boolean;
  saveData?: {
    gameId: string;
    gameName: string;
    lastPlayed: Date;
    progress: number;
    highScore: number;
  };
}

export default function GameCubeMemoryCard({
  onInsert,
  onEject,
  isInserted,
  saveData,
}: GameCubeMemoryCardProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cardRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Create memory card geometry
  const createMemoryCard = useCallback(() => {
    const group = new THREE.Group();

    // Main card body
    const cardGeometry = new THREE.BoxGeometry(2, 1.2, 0.2);
    const cardMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a2e,
      shininess: 100,
      specular: 0x333333,
    });
    const card = new THREE.Mesh(cardGeometry, cardMaterial);
    card.castShadow = true;
    card.receiveShadow = true;
    group.add(card);

    // Card label area
    const labelGeometry = new THREE.PlaneGeometry(1.6, 0.8);
    const labelMaterial = new THREE.MeshBasicMaterial({
      color: 0x2d2d44,
      transparent: true,
      opacity: 0.9,
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.z = 0.11;
    group.add(label);

    // Nintendo logo
    const logoGeometry = new THREE.PlaneGeometry(0.3, 0.1);
    const logoMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
    });
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.set(-0.6, 0.3, 0.12);
    group.add(logo);

    // GameCube logo
    const gcLogoGeometry = new THREE.PlaneGeometry(0.4, 0.15);
    const gcLogoMaterial = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.9,
    });
    const gcLogo = new THREE.Mesh(gcLogoGeometry, gcLogoMaterial);
    gcLogo.position.set(0.4, 0.3, 0.12);
    group.add(gcLogo);

    // Save data indicator
    if (saveData) {
      const dataGeometry = new THREE.PlaneGeometry(1.4, 0.3);
      const dataMaterial = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.7,
      });
      const dataIndicator = new THREE.Mesh(dataGeometry, dataMaterial);
      dataIndicator.position.set(0, -0.2, 0.12);
      group.add(dataIndicator);

      // Progress bar
      const progressGeometry = new THREE.PlaneGeometry(1.2 * (saveData.progress / 100), 0.05);
      const progressMaterial = new THREE.MeshBasicMaterial({
        color: 0xec4899,
        transparent: true,
        opacity: 0.9,
      });
      const progressBar = new THREE.Mesh(progressGeometry, progressMaterial);
      progressBar.position.set(0, -0.35, 0.13);
      group.add(progressBar);
    }

    // Connector pins
    const pinGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.1);
    const pinMaterial = new THREE.MeshPhongMaterial({
      color: 0x666666,
      shininess: 50,
    });

    for (let i = 0; i < 8; i++) {
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      pin.position.set(-0.7 + i * 0.2, -0.4, -0.15);
      pin.castShadow = true;
      group.add(pin);
    }

    return group;
  }, [saveData]);

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
    camera.position.set(0, 0, 5);
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
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -5;
    directionalLight.shadow.camera.right = 5;
    directionalLight.shadow.camera.top = 5;
    directionalLight.shadow.camera.bottom = -5;
    scene.add(directionalLight);

    // Point light for dramatic effect
    const pointLight = new THREE.PointLight(0xec4899, 0.5, 10);
    pointLight.position.set(0, 2, 3);
    scene.add(pointLight);

    // Create memory card
    const card = createMemoryCard();
    cardRef.current = card;
    scene.add(card);

    // Start animation
    animate();
  }, [createMemoryCard]);

  // Animation loop
  const animate = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current || !cardRef.current) return;

    // Rotate card slowly
    cardRef.current.rotation.y += 0.005;
    cardRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;

    // Hover animation
    if (isHovered) {
      cardRef.current.scale.setScalar(1.1);
      cardRef.current.position.y = Math.sin(Date.now() * 0.01) * 0.1;
    } else {
      cardRef.current.scale.setScalar(1);
      cardRef.current.position.y = 0;
    }

    // Render
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationIdRef.current = requestAnimationFrame(animate);
  }, [isHovered]);

  // Handle card interaction
  const handleCardClick = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);

    if (isInserted) {
      // Eject animation
      if (cardRef.current) {
        const startY = cardRef.current.position.y;
        const startZ = cardRef.current.position.z;

        const animateEject = (progress: number) => {
          if (!cardRef.current) return;

          const easeOut = 1 - Math.pow(1 - progress, 3);
          cardRef.current.position.y = startY + easeOut * 2;
          cardRef.current.position.z = startZ + easeOut * 3;
          cardRef.current.rotation.x = easeOut * Math.PI * 0.5;

          if (progress < 1) {
            requestAnimationFrame(() => animateEject(progress + 0.02));
          } else {
            onEject();
            setIsAnimating(false);
          }
        };

        animateEject(0);
      }
    } else {
      // Insert animation
      if (cardRef.current) {
        const startY = cardRef.current.position.y;
        const startZ = cardRef.current.position.z;

        const animateInsert = (progress: number) => {
          if (!cardRef.current) return;

          const easeIn = progress * progress;
          cardRef.current.position.y = startY - easeIn * 2;
          cardRef.current.position.z = startZ - easeIn * 3;
          cardRef.current.rotation.x = -easeIn * Math.PI * 0.5;

          if (progress < 1) {
            requestAnimationFrame(() => animateInsert(progress + 0.02));
          } else {
            onInsert();
            setIsAnimating(false);
          }
        };

        animateInsert(0);
      }
    }
  }, [isInserted, isAnimating, onInsert, onEject]);

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

    // Add event listeners
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);

      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }

      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [initScene, handleResize]);

  return (
    <div className="relative w-full h-64">
      {/* 3D Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      />

      {/* Card Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-4 rounded-t-lg">
        <div className="text-center">
          <h3 className="text-white font-semibold text-sm mb-1">
            {saveData ? saveData.gameName : 'Empty Memory Card'}
          </h3>
          {saveData && (
            <div className="text-xs text-gray-300 space-y-1">
              <div>Progress: {saveData.progress}%</div>
              <div>High Score: {saveData.highScore.toLocaleString()}</div>
              <div>Last Played: {saveData.lastPlayed.toLocaleDateString()}</div>
            </div>
          )}
          <div className="mt-2 text-xs text-gray-400">
            {isInserted ? 'Click to eject' : 'Click to insert'}
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-2 right-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isInserted ? 'bg-green-500' : 'bg-gray-500'
          } ${isHovered ? 'animate-pulse' : ''}`}
        />
      </div>
    </div>
  );
}
