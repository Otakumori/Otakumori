'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';

function canUseWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

function WindTree({
  src = '/media/cherry-tree.png',
  trunkCenterU = 0.5, // tweak to pixel-snap the trunk center to the right edge
  windStrength = 0.017,
  gust = 0.55,
  freq = 0.95,
}: {
  src?: string;
  trunkCenterU?: number;
  windStrength?: number;
  gust?: number;
  freq?: number;
}) {
  const tex = useTexture(src);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearMipMapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 8;

  const mat = useRef<THREE.ShaderMaterial>(null!);
  useFrame((_, dt) => {
    const uniforms = mat.current?.uniforms as
      | {
          uTime?: { value: number };
        }
      | undefined;
    if (!uniforms?.uTime) return;
    uniforms.uTime.value += dt;
  });

  return (
    <mesh scale={[2, 2, 1]}>
      <planeGeometry args={[2, 2, 1, 1]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        uniforms={{
          uTex: { value: tex },
          uTime: { value: 0 },
          uStrength: { value: windStrength },
          uGust: { value: gust },
          uFreq: { value: freq },
          uOffsetU: { value: trunkCenterU - 1.0 }, // trunk center -> right screen edge
        }}
        vertexShader={
          /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.0); }`
        }
        fragmentShader={
          /* glsl */ `
          precision highp float;
          uniform sampler2D uTex; uniform float uTime,uStrength,uGust,uFreq,uOffsetU;
          varying vec2 vUv;
          float H(float n){return fract(sin(n)*43758.5453);}
          float N(float x){float i=floor(x),f=fract(x); float a=H(i),b=H(i+1.0); return mix(a,b,smoothstep(0.,1.,f));}
          float flex(vec3 rgb){ // pink blossoms sway, brown trunk steady
            float r=rgb.r,g=rgb.g,b=rgb.b;
            float pink=r-0.5*g-0.2*b; float brown=(r+0.6*g)-(1.2*b);
            float f=smoothstep(0.05,0.25,pink)*(1.0 - smoothstep(0.25,0.55,brown));
            return clamp(f,0.,1.);
          }
          void main(){
            vec2 baseUV = vUv + vec2(uOffsetU,0.);
            vec4 B = texture2D(uTex, baseUV);
            if(B.a < 0.01) discard;
            float f = flex(B.rgb);
            float t=uTime;
            float g=mix(1.0-uGust,1.0+uGust,N(t*0.15));
            float a=uStrength*g*(0.75*f+0.10);
            float bend=sin((vUv.y*6.28318)*(uFreq*0.8)+t*0.9)*a;
            float slow=sin(t*0.35)*a*0.5*f;
            vec2 uv=baseUV + vec2(bend+slow, a*0.12*f*sin(t*1.7+baseUV.x*6.0));
            vec4 C=texture2D(uTex, uv);
            C.rgb *= clamp(1.0 - (a*6.0), 0.86, 1.0);
            gl_FragColor=C;
          }`
        }
      />
    </mesh>
  );
}

export default function HomeTreeWindAligned() {
  const [ok, setOk] = useState(false);
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setReduce(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
    setOk(canUseWebGL());
  }, []);

  if (!ok || reduce) {
    return (
      <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
        <img
          src="/media/cherry-tree.png"
          alt=""
          className="h-full w-auto object-contain object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      </div>
    );
  }

  return (
    <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0b0412');
          gl.toneMapping = THREE.ACESFilmicToneMapping;
        }}
      >
        <WindTree trunkCenterU={0.5} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" />
    </div>
  );
}
