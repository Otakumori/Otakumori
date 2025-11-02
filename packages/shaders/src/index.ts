export interface ShaderUniforms {
  [key: string]: unknown;
}

export interface ToonShaderUniforms extends ShaderUniforms {
  lightDirection: [number, number, number];
  baseColor: [number, number, number];
  steps: number;
}

export interface ToonShader {
  vertexShader: string;
  fragmentShader: string;
  uniforms: ToonShaderUniforms;
}

export interface RimLightShaderUniforms extends ShaderUniforms {
  rimColor: [number, number, number];
  rimPower: number;
  rimIntensity: number;
}

export interface RimLightShader {
  vertexShader: string;
  fragmentShader: string;
  uniforms: RimLightShaderUniforms;
}

export interface OutlineShaderUniforms extends ShaderUniforms {
  outlineColor: [number, number, number];
  outlineThickness: number;
}

export interface OutlineShader {
  vertexShader: string;
  fragmentShader: string;
  uniforms: OutlineShaderUniforms;
}

export function createToonShader(_uniforms?: Partial<ToonShaderUniforms>): ToonShader {
  return {
    vertexShader: '',
    fragmentShader: '',
    uniforms: {
      lightDirection: [0, 1, 0],
      baseColor: [1, 1, 1],
      steps: 3,
      ...(_uniforms ?? {}),
    },
  };
}

export function createRimLightShader(_uniforms?: Partial<RimLightShaderUniforms>): RimLightShader {
  return {
    vertexShader: '',
    fragmentShader: '',
    uniforms: {
      rimColor: [1, 1, 1],
      rimPower: 2,
      rimIntensity: 1,
      ...(_uniforms ?? {}),
    },
  };
}

export function createOutlineShader(_uniforms?: Partial<OutlineShaderUniforms>): OutlineShader {
  return {
    vertexShader: '',
    fragmentShader: '',
    uniforms: {
      outlineColor: [0, 0, 0],
      outlineThickness: 0.01,
      ...(_uniforms ?? {}),
    },
  };
}
