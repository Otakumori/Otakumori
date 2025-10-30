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
export declare function createToonShader(_uniforms?: Partial<ToonShaderUniforms>): ToonShader;
export declare function createRimLightShader(_uniforms?: Partial<RimLightShaderUniforms>): RimLightShader;
export declare function createOutlineShader(_uniforms?: Partial<OutlineShaderUniforms>): OutlineShader;
//# sourceMappingURL=index.d.ts.map