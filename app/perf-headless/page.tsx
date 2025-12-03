'use client';

import { generateSEO } from '@/app/lib/seo';
import { useEffect } from 'react';
import * as THREE from 'three';

/**
 * Headless performance test route
 * Exposes a minimal MockEngine for NPC spawn benchmarking
 */

interface MockEntity {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  health: number;
  target: { x: number; y: number; z: number } | null;
}

class MockEngine {
  entities: MockEntity[] = [];
  private idCounter = 0;

  spawn(count: number): void {
    for (let i = 0; i < count; i++) {
      this.entities.push({
        id: `npc_${this.idCounter++}`,
        x: Math.random() * 100 - 50,
        y: 0,
        z: Math.random() * 100 - 50,
        vx: (Math.random() - 0.5) * 2,
        vy: 0,
        vz: (Math.random() - 0.5) * 2,
        health: 100,
        target: null,
      });
    }
  }

  update(dt: number): void {
    // Convert dt from ms to seconds for physics
    const dtSec = dt / 1000;

    for (const entity of this.entities) {
      // Simple AI: pick random target occasionally
      if (!entity.target || Math.random() < 0.01) {
        entity.target = {
          x: Math.random() * 100 - 50,
          y: 0,
          z: Math.random() * 100 - 50,
        };
      }

      // Move toward target
      if (entity.target) {
        const dx = entity.target.x - entity.x;
        const dz = entity.target.z - entity.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 1) {
          const speed = 10;
          entity.vx = (dx / dist) * speed;
          entity.vz = (dz / dist) * speed;
        } else {
          // Reached target
          entity.target = null;
          entity.vx *= 0.9;
          entity.vz *= 0.9;
        }
      }

      // Update position
      entity.x += entity.vx * dtSec;
      entity.z += entity.vz * dtSec;

      // Keep in bounds
      if (entity.x < -50 || entity.x > 50) entity.vx *= -1;
      if (entity.z < -50 || entity.z > 50) entity.vz *= -1;

      // Apply friction
      entity.vx *= 0.99;
      entity.vz *= 0.99;

      // Simple collision detection with other entities
      for (const other of this.entities) {
        if (other.id === entity.id) continue;

        const dx = other.x - entity.x;
        const dz = other.z - entity.z;
        const distSq = dx * dx + dz * dz;

        // Collision radius = 1 unit
        if (distSq < 4) {
          const dist = Math.sqrt(distSq);
          const overlap = 2 - dist;

          // Separate entities
          const nx = dx / dist;
          const nz = dz / dist;

          entity.x -= nx * overlap * 0.5;
          entity.z -= nz * overlap * 0.5;
          other.x += nx * overlap * 0.5;
          other.z += nz * overlap * 0.5;

          // Bounce
          entity.vx -= nx;
          entity.vz -= nz;
        }
      }
    }
  }

  clear(): void {
    this.entities = [];
    this.idCounter = 0;
  }
}

export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/perf-headless',
  });
}
export default function PerfHeadlessPage() {
  useEffect(() => {
    // Expose MockEngine on window for test access
    const engine = new MockEngine();
    (window as any).MockEngine = engine;

    // Also expose Three.js for additional checks if needed
    (window as any).THREE = THREE;

    // Signal ready
    (window as any).__PERF_READY__ = true;

    return () => {
      engine.clear();
      delete (window as any).MockEngine;
      delete (window as any).__PERF_READY__;
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-white">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">Performance Test (Headless)</h1>
        <p className="text-zinc-400">MockEngine ready for benchmarking</p>
        <p className="mt-2 text-sm text-zinc-500">
          This page is used for automated performance testing.
        </p>
      </div>
    </div>
  );
}
