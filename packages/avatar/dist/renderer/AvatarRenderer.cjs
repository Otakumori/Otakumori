"use strict";
"use client";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/renderer/AvatarRenderer.tsx
var AvatarRenderer_exports = {};
__export(AvatarRenderer_exports, {
  AvatarRenderer: () => AvatarRenderer,
  preloadAvatar: () => preloadAvatar
});
module.exports = __toCommonJS(AvatarRenderer_exports);
var import_react = require("react");
var import_drei = require("@react-three/drei");
var import_fiber = require("@react-three/fiber");
var THREE = __toESM(require("three"), 1);
var import_jsx_runtime = require("react/jsx-runtime");
function AvatarRenderer({
  spec,
  resolved,
  reducedMotion = false,
  onLoad,
  onError
}) {
  const groupRef = (0, import_react.useRef)(null);
  const [isLoaded, setIsLoaded] = (0, import_react.useState)(false);
  const { scene: baseScene } = (0, import_drei.useGLTF)(spec.baseMeshUrl);
  (0, import_react.useEffect)(() => {
    if (!baseScene) return;
    try {
      baseScene.traverse((node) => {
        if (node instanceof THREE.SkinnedMesh || node instanceof THREE.Mesh) {
          const mesh = node;
          const influences = mesh.morphTargetInfluences;
          const dictionary = mesh.morphTargetDictionary;
          if (!influences || !dictionary) {
            return;
          }
          Object.entries(spec.morphWeights).forEach(([morphId, weight]) => {
            const index = dictionary[morphId];
            if (index !== void 0) {
              influences[index] = weight;
            }
          });
        }
      });
      setIsLoaded(true);
      if (onLoad) {
        onLoad();
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  }, [baseScene, spec.morphWeights, onLoad, onError]);
  (0, import_fiber.useFrame)((state) => {
    if (!groupRef.current || reducedMotion || !isLoaded) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.01;
  });
  (0, import_react.useEffect)(() => {
    if (Object.keys(resolved).length > 0) {
    }
  }, [resolved]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "group",
    {
      ref: (group) => {
        groupRef.current = group ? group : null;
      },
      children: baseScene && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("primitive", { object: baseScene.clone() })
    }
  );
}
function preloadAvatar(baseMeshUrl) {
  import_drei.useGLTF.preload(baseMeshUrl);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AvatarRenderer,
  preloadAvatar
});
