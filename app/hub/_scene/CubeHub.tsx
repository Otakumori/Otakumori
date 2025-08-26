/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useHub } from "./store";
import { useAnchors } from "./anchors";
import { getAsset } from "@/app/mini-games/_shared/assets-resolver";

export default function CubeHub() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { face, idle, isZooming } = useHub();

  useEffect(() => {
    const mount = mountRef.current!;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 16/9, 0.1, 100);
    camera.position.set(0, 0.2, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // resize
    function onResize() {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(onResize); ro.observe(mount);

    // cube
    const size = 1;
    const geom = new THREE.BoxGeometry(size, size, size);
    const mat = new THREE.MeshStandardMaterial({ color: 0x7a6ad6, metalness: 0.3, roughness: 0.35 });
    const cube = new THREE.Mesh(geom, mat);
    scene.add(cube);

    // ground decal (frame png)
    const frameTex = new THREE.TextureLoader().load(getAsset("site", "cubeFrame") ?? "/assets/ui/hub/cube_frame.png");
    frameTex.wrapS = frameTex.wrapT = THREE.ClampToEdgeWrapping;
    const frameMat = new THREE.MeshBasicMaterial({ map: frameTex, transparent: true, opacity: 0.9 });
    const framePlane = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), frameMat);
    framePlane.position.set(0, -0.9, 0); framePlane.rotateX(-Math.PI / 2 * 0.92);
    scene.add(framePlane);

    // light
    const amb = new THREE.AmbientLight(0xffffff, 0.8); scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6); dir.position.set(2, 3, 2); scene.add(dir);

    // focus targets per face
    const faceRot: Record<string, THREE.Euler> = {
      front: new THREE.Euler(0, 0, 0),
      games: new THREE.Euler(0, 0, 0),
      trade: new THREE.Euler(0, Math.PI / 2, 0),
      avatar: new THREE.Euler(0, Math.PI, 0),
      music: new THREE.Euler(0, -Math.PI / 2, 0)
    };

    // Anchor tracking for selector overlay
    const anchors = useAnchors.getState();
    function screenOf(vec3: THREE.Vector3) {
      const v = vec3.clone().project(camera);
      const w = mount.clientWidth, h = mount.clientHeight;
      return { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h, visible: v.z < 1.0 };
    }

    // constants to sample cube face centers in local space
    const half = size / 2;
    const faceCenters = {
      games: new THREE.Vector3(0, 0, half), // front (we'll render chips only when global face === "front")
      trade: new THREE.Vector3(half, 0, 0), // right
      avatar: new THREE.Vector3(0, 0, -half), // back
      music: new THREE.Vector3(-half, 0, 0), // left
    };
    const drawerTop = new THREE.Vector3(0, half, 0);
    const drawerBottom = new THREE.Vector3(0, -half, 0);

    function publishAnchors() {
      // transform centers by cube world matrix
      const m = cube.matrixWorld;
      const out: any = {};
      for (const k of Object.keys(faceCenters) as (keyof typeof faceCenters)[]) {
        out[k] = screenOf(faceCenters[k].clone().applyMatrix4(m));
      }
      out.drawerTop = screenOf(drawerTop.clone().applyMatrix4(m));
      out.drawerBottom = screenOf(drawerBottom.clone().applyMatrix4(m));
      useAnchors.getState().setMany(out);
    }

    let t = 0;
    function animate(now = 0) {
      requestAnimationFrame(animate);
      const dt = (now - t) * 0.001; t = now;

      // idle wobble (gentle)
      if (idle && !isZooming) {
        cube.rotation.x += Math.sin(now * 0.0018) * 0.0003;
        cube.rotation.y += Math.cos(now * 0.0013) * 0.00035;
      }

      // ease toward target face orientation
      const target = faceRot[face];
      cube.rotation.x += (target.x - cube.rotation.x) * 0.08;
      cube.rotation.y += (target.y - cube.rotation.y) * 0.08;
      cube.rotation.z += (target.z - cube.rotation.z) * 0.08;

      // zoom pulse on confirm (handled by page route after 450ms)
      if (isZooming) {
        camera.position.z += (2.4 - camera.position.z) * 0.2;
      } else {
        camera.position.z += (3.2 - camera.position.z) * 0.08;
      }

      // publish anchor positions each frame
      publishAnchors();

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      ro.disconnect();
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      geom.dispose();
      frameMat.dispose();
    };
  }, [face, idle, isZooming]);

  return <div ref={mountRef} className="absolute inset-x-0 bottom-0 top-0" />;
}
