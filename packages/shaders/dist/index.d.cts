interface ShaderUniforms {
  [key: string]: unknown;
}
interface ToonShaderUniforms extends ShaderUniforms {
  lightDirection: [number, number, number];
  baseColor: [number, number, number];
  steps: number;
}
interface ToonShader {
  vertexShader: string;
  fragmentShader: string;
  uniforms: ToonShaderUniforms;
}
interface RimLightShaderUniforms extends ShaderUniforms {
  rimColor: [number, number, number];
  rimPower: number;
  rimIntensity: number;
}
interface RimLightShader {
  vertexShader: string;
  fragmentShader: string;
  uniforms: RimLightShaderUniforms;
}
interface OutlineShaderUniforms extends ShaderUniforms {
  outlineColor: [number, number, number];
  outlineThickness: number;
}
interface OutlineShader {
  vertexShader: string;
  fragmentShader: string;
  uniforms: OutlineShaderUniforms;
}
declare function createToonShader(_uniforms?: Partial<ToonShaderUniforms>): ToonShader;
declare function createRimLightShader(_uniforms?: Partial<RimLightShaderUniforms>): RimLightShader;
declare function createOutlineShader(_uniforms?: Partial<OutlineShaderUniforms>): OutlineShader;

export {
  type OutlineShader,
  type OutlineShaderUniforms,
  type RimLightShader,
  type RimLightShaderUniforms,
  type ShaderUniforms,
  type ToonShader,
  type ToonShaderUniforms,
  createOutlineShader,
  createRimLightShader,
  createToonShader,
};
