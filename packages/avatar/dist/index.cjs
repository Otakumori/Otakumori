"use strict";
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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AvatarRenderer: () => AvatarRenderer,
  AvatarSpecV15: () => AvatarSpecV15,
  EquipmentSlot: () => EquipmentSlot,
  STANDARD_RIG_BONES: () => STANDARD_RIG_BONES,
  clampAllMorphs: () => clampAllMorphs,
  clampMorph: () => clampMorph,
  createDefaultAvatarSpec: () => createDefaultAvatarSpec,
  createRenderer: () => createRenderer,
  deserializeAvatar: () => deserializeAvatar,
  isNSFWSlot: () => isNSFWSlot,
  preloadAvatar: () => preloadAvatar,
  resolvePolicy: () => resolvePolicy,
  serializeAvatar: () => serializeAvatar,
  validateAvatar: () => validateAvatar
});
module.exports = __toCommonJS(index_exports);

// src/spec.ts
var import_zod = require("zod");
var EquipmentSlot = import_zod.z.enum([
  // Head & Face
  "Head",
  "Face",
  "Eyes",
  "Eyebrows",
  "Nose",
  "Mouth",
  "Ears",
  // Hair & Facial
  "Hair",
  "FacialHair",
  "Eyelashes",
  // Body Base
  "Torso",
  "Chest",
  "Arms",
  "Hands",
  "Legs",
  "Feet",
  // Clothing Layers
  "Underwear",
  "InnerWear",
  "OuterWear",
  "Pants",
  "Shoes",
  "Gloves",
  // Accessories
  "Headwear",
  "Eyewear",
  "Neckwear",
  "Earrings",
  "Bracelets",
  "Rings",
  // Fantasy/Anime
  "Horns",
  "Tail",
  "Wings",
  "AnimalEars",
  "Halo",
  // Back & Weapons
  "Back",
  "WeaponPrimary",
  "WeaponSecondary",
  "Shield",
  // NSFW (gated by policy)
  "NSFWChest",
  "NSFWGroin",
  "NSFWAccessory"
]);
var STANDARD_RIG_BONES = [
  "Hips",
  "Spine",
  "Spine1",
  "Spine2",
  "Chest",
  "Neck",
  "Head",
  "LeftShoulder",
  "LeftArm",
  "LeftForeArm",
  "LeftHand",
  "RightShoulder",
  "RightArm",
  "RightForeArm",
  "RightHand",
  "LeftUpLeg",
  "LeftLeg",
  "LeftFoot",
  "LeftToeBase",
  "RightUpLeg",
  "RightLeg",
  "RightFoot",
  "RightToeBase"
];
var AvatarSpecV15 = import_zod.z.object({
  version: import_zod.z.literal("1.5"),
  baseMeshUrl: import_zod.z.string().url(),
  rig: import_zod.z.object({
    root: import_zod.z.string(),
    bones: import_zod.z.array(import_zod.z.string()).default([...STANDARD_RIG_BONES])
  }),
  morphs: import_zod.z.array(
    import_zod.z.object({
      id: import_zod.z.string(),
      label: import_zod.z.string(),
      min: import_zod.z.number().min(0).max(1).default(0),
      max: import_zod.z.number().min(0).max(1).default(1)
    })
  ),
  morphWeights: import_zod.z.record(import_zod.z.string(), import_zod.z.number().min(0).max(1)),
  // Equipment uses asset IDs, not URLs (resolved server-side)
  equipment: import_zod.z.record(EquipmentSlot, import_zod.z.string().nullable()).optional(),
  palette: import_zod.z.object({
    primary: import_zod.z.string(),
    secondary: import_zod.z.string(),
    accent: import_zod.z.string().optional()
  }),
  nsfwPolicy: import_zod.z.object({
    allowNudity: import_zod.z.literal(false)
  }),
  animationMap: import_zod.z.object({
    idle: import_zod.z.string().optional(),
    walk: import_zod.z.string().optional(),
    run: import_zod.z.string().optional(),
    jump: import_zod.z.string().optional(),
    fall: import_zod.z.string().optional(),
    land: import_zod.z.string().optional(),
    attack: import_zod.z.string().optional(),
    emote: import_zod.z.string().optional()
  }),
  metadata: import_zod.z.object({
    name: import_zod.z.string().optional(),
    author: import_zod.z.string().optional()
  }).optional()
});
function clampMorph(spec, morphId, value) {
  const morph = spec.morphs.find((m) => m.id === morphId);
  if (!morph) {
    return Math.max(0, Math.min(1, value));
  }
  return Math.max(morph.min, Math.min(morph.max, value));
}
function clampAllMorphs(spec) {
  const clampedWeights = {};
  for (const [morphId, weight] of Object.entries(spec.morphWeights)) {
    clampedWeights[morphId] = clampMorph(spec, morphId, weight);
  }
  return {
    ...spec,
    morphWeights: clampedWeights
  };
}

// src/serialize.ts
function serializeAvatar(spec) {
  return JSON.stringify(spec);
}
function deserializeAvatar(data) {
  try {
    const parsed = JSON.parse(data);
    const result = AvatarSpecV15.safeParse(parsed);
    if (!result.success) {
      console.warn("Avatar deserialization failed:", result.error);
      return null;
    }
    return result.data;
  } catch (error) {
    console.warn("Avatar deserialization JSON parse error:", error);
    return null;
  }
}
function createDefaultAvatarSpec() {
  return {
    version: "1.5",
    baseMeshUrl: "https://assets.otakumori.com/default-avatar.glb",
    rig: {
      root: "Hips",
      bones: [
        "Hips",
        "Spine",
        "Chest",
        "Neck",
        "Head",
        "LeftArm",
        "RightArm",
        "LeftLeg",
        "RightLeg"
      ]
    },
    morphs: [],
    morphWeights: {},
    equipment: {},
    palette: {
      primary: "#8b5cf6",
      secondary: "#ec4899"
    },
    nsfwPolicy: {
      allowNudity: false
    },
    animationMap: {}
  };
}

// src/policy.ts
function resolvePolicy(ctx) {
  if (!ctx.cookieValue || !ctx.adultVerified) {
    return { nsfwAllowed: false };
  }
  const cookieOptIn = ctx.cookieValue === "enabled";
  const verified = ctx.adultVerified === true;
  return {
    nsfwAllowed: cookieOptIn && verified
  };
}
function isNSFWSlot(slot) {
  return slot.startsWith("NSFW");
}

// src/renderer/AvatarRenderer.tsx
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

// src/renderer/index.ts
function createRenderer(_props) {
  return {
    mount: (_el) => {
      console.warn("Legacy createRenderer is deprecated. Use AvatarRenderer component instead.");
    },
    dispose: () => {
    }
  };
}

// src/index.ts
function validateAvatar(spec) {
  const result = AvatarSpecV15.safeParse(spec);
  return result.success;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AvatarRenderer,
  AvatarSpecV15,
  EquipmentSlot,
  STANDARD_RIG_BONES,
  clampAllMorphs,
  clampMorph,
  createDefaultAvatarSpec,
  createRenderer,
  deserializeAvatar,
  isNSFWSlot,
  preloadAvatar,
  resolvePolicy,
  serializeAvatar,
  validateAvatar
});
