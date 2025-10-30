import { describe, it, expect } from 'vitest';
import { createToonShader, createRimLightShader, createOutlineShader } from '../index.js';

describe('Shader Types', () => {
  it('should create a toon shader', () => {
    const shader = createToonShader();
    expect(shader.uniforms.steps).toBe(3);
    expect(shader.uniforms.lightDirection).toEqual([0, 1, 0]);
  });

  it('should create a rim light shader', () => {
    const shader = createRimLightShader();
    expect(shader.uniforms.rimPower).toBe(2);
    expect(shader.uniforms.rimIntensity).toBe(1);
  });

  it('should create an outline shader', () => {
    const shader = createOutlineShader();
    expect(shader.uniforms.outlineThickness).toBe(0.01);
    expect(shader.uniforms.outlineColor).toEqual([0, 0, 0]);
  });
});
