import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, SRGBColorSpace, RepeatWrapping } from 'three';
import { useMemo, useRef } from 'react';
import { ShaderMaterial, Mesh, Vector2 } from 'three';

// Shader strings
const vertexShader = `
precision highp float;

uniform float uTime;
uniform float uAmp;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  vUv = uv;

  // subtle sway: layer-dependent
  float sx = sin((uv.y + uTime * uSpeed) * 3.14159) * uAmp * 0.005;
  float sy = cos((uv.x + uTime * uSpeed) * 3.14159) * uAmp * 0.004;

  vec3 pos = position + vec3(sx, sy, 0.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform sampler2D uTex;
uniform vec2 uTexSize;
uniform float uHueMin, uHueMax;
uniform float uSatMin, uSatMax;
uniform float uValMin, uValMax;
uniform float uFeather;
uniform float uFooterFade; // 0..1 fraction of bottom to fade
uniform float uLeftJustify;

varying vec2 vUv;

// sRGB to linear and back
vec3 toLinear(vec3 srgb) {
  return pow(srgb, vec3(2.2));
}

vec3 toSRGB(vec3 linear) {
  return pow(linear, vec3(1.0/2.2));
}

// RGB -> HSV (0..1)
vec3 rgb2hsv(vec3 c) {
  float cmax = max(c.r, max(c.g, c.b));
  float cmin = min(c.r, min(c.g, c.b));
  float diff = cmax - cmin;
  float h = 0.0;
  if (diff > 1e-5) {
    if (cmax == c.r) h = mod((c.g - c.b) / diff, 6.0);
    else if (cmax == c.g) h = (c.b - c.r) / diff + 2.0;
    else h = (c.r - c.g) / diff + 4.0;
    h /= 6.0;
    if (h < 0.0) h += 1.0;
  }
  float s = cmax > 0.0 ? diff / cmax : 0.0;
  float v = cmax;
  return vec3(h, s, v);
}

// handle wraparound hues (e.g., 310°..20°)
float hueInRange(float h, float hmin, float hmax, float feather) {
  if (hmin <= hmax) {
    return smoothstep(hmin - feather, hmin, h) * (1.0 - smoothstep(hmax, hmax + feather, h));
  } else {
    // wrap-around: in range if h >= hmin or h <= hmax
    float a = 1.0 - smoothstep(hmin, hmin + feather, h);
    float b = smoothstep(hmax - feather, hmax, h);
    return max(a, b);
  }
}

void main() {
  vec4 texel = texture2D(uTex, vUv);
  // skip empty pixels
  if (texel.a < 0.01) discard;

  // operate in linear space
  vec3 lin = toLinear(texel.rgb);
  vec3 hsv = rgb2hsv(lin);

  float hueMask = hueInRange(hsv.x, uHueMin, uHueMax, uFeather);
  float satMask = smoothstep(uSatMin - uFeather, uSatMin, hsv.y) * (1.0 - smoothstep(uSatMax, uSatMax + uFeather, hsv.y));
  float valMask = smoothstep(uValMin - uFeather, uValMin, hsv.z) * (1.0 - smoothstep(uValMax, uValMax + uFeather, hsv.z));

  float m = hueMask * satMask * valMask;
  if (m <= 0.001) discard;

  // footer fade: multiply alpha near bottom uv.y
  float alpha = texel.a * m;
  if (uFooterFade > 0.0) {
    float edge = smoothstep(uFooterFade, uFooterFade + 0.06, vUv.y);
    alpha *= edge;
  }

  gl_FragColor = vec4(toSRGB(lin), alpha);
}
`;

type Props = {
  src: string;
  hue: [number, number];
  sat: [number, number];
  val: [number, number];
  z?: number;
  amp?: number;
  speed?: number;
  footerFade?: number; // 0..1
  leftJustify?: boolean;
};

export function LayerPlane({
  src,
  hue,
  sat,
  val,
  z = 0,
  amp = 0,
  speed = 0.2,
  footerFade = 0,
  leftJustify = true,
}: Props) {
  const tex = useLoader(TextureLoader, src);
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<ShaderMaterial>(null);

  // Texture quality
  tex.colorSpace = SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.wrapS = tex.wrapT = RepeatWrapping; // safe; we won't actually repeat

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uTexSize: { value: new Vector2(tex.image?.width ?? 2048, tex.image?.height ?? 2048) },
      uHueMin: { value: hue[0] },
      uHueMax: { value: hue[1] },
      uSatMin: { value: sat[0] },
      uSatMax: { value: sat[1] },
      uValMin: { value: val[0] },
      uValMax: { value: val[1] },
      uTime: { value: 0 },
      uAmp: { value: amp },
      uSpeed: { value: speed },
      uFooterFade: { value: footerFade },
      uFeather: { value: 0.02 }, // feather width for smoothstep
      uLeftJustify: { value: leftJustify ? 1 : 0 },
    }),
    [tex, hue, sat, val, amp, speed, footerFade, leftJustify],
  );

  useFrame((_, t) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = t;
  });

  // Plane size preserves image aspect (left/bottom anchored)
  const aspect = (tex.image?.width ?? 2048) / (tex.image?.height ?? 2048);
  const height = 1; // orthographic world unit (fits to your page scale via camera zoom)
  const width = aspect * height;

  return (
    <mesh ref={meshRef} position={[leftJustify ? -width * 0.5 : 0, -height * 0.5, z]}>
      <planeGeometry args={[width, height, 1, 1]} />
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
