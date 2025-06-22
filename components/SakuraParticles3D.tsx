'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface SakuraParticles3DProps {
  particleCount: number;
  sakuraTexture: string;
}

export default function SakuraParticles3D({
  particleCount,
  sakuraTexture,
}: SakuraParticles3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    camera.position.z = 5;

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // z
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const textureLoader = new THREE.TextureLoader();
    const particleTexture = textureLoader.load(sakuraTexture);

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Animation loop (simple floating)
    const animate = () => {
      requestAnimationFrame(animate);

      // Simple floating animation
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] -= 0.005; // Move down
        if (positions[i * 3 + 1] < -5) {
          positions[i * 3 + 1] = 5; // Reset to top
        }
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [particleCount, sakuraTexture]);

  return <div ref={mountRef} className="absolute inset-0 h-full w-full" />;
}
