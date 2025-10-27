export function createToonShader(_uniforms) {
    return {
        vertexShader: '',
        fragmentShader: '',
        uniforms: {
            lightDirection: [0, 1, 0],
            baseColor: [1, 1, 1],
            steps: 3,
        },
    };
}
export function createRimLightShader(_uniforms) {
    return {
        vertexShader: '',
        fragmentShader: '',
        uniforms: {
            rimColor: [1, 1, 1],
            rimPower: 2,
            rimIntensity: 1,
        },
    };
}
export function createOutlineShader(_uniforms) {
    return {
        vertexShader: '',
        fragmentShader: '',
        uniforms: {
            outlineColor: [0, 0, 0],
            outlineThickness: 0.01,
        },
    };
}
