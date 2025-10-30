'use strict';
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all) __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AvatarSpecV15: () => AvatarSpecV15,
  clampMorph: () => clampMorph,
  createRenderer: () => createRenderer,
  deserializeAvatar: () => deserializeAvatar,
  serializeAvatar: () => serializeAvatar,
  validateAvatar: () => validateAvatar,
});
module.exports = __toCommonJS(index_exports);

// src/spec.ts
var import_zod = require('zod');
var AvatarSpecV15 = import_zod.z.object({
  version: import_zod.z.literal('1.5'),
  baseMeshUrl: import_zod.z.string().url(),
  rig: import_zod.z.object({
    root: import_zod.z.string(),
  }),
  morphs: import_zod.z.array(
    import_zod.z.object({
      id: import_zod.z.string(),
      label: import_zod.z.string(),
      min: import_zod.z.number().min(0),
      max: import_zod.z.number().max(1),
    }),
  ),
  morphWeights: import_zod.z.record(import_zod.z.string(), import_zod.z.number().min(0).max(1)),
  equipment: import_zod.z.object({
    Head: import_zod.z.string().url().optional(),
    Torso: import_zod.z.string().url().optional(),
    Legs: import_zod.z.string().url().optional(),
    Accessory: import_zod.z.string().url().optional(),
  }),
  palette: import_zod.z.object({
    primary: import_zod.z.string(),
    secondary: import_zod.z.string(),
    accent: import_zod.z.string().optional(),
  }),
  nsfwPolicy: import_zod.z.object({
    allowNudity: import_zod.z.literal(false),
  }),
  animationMap: import_zod.z.object({
    idle: import_zod.z.string().optional(),
    walk: import_zod.z.string().optional(),
    run: import_zod.z.string().optional(),
    jump: import_zod.z.string().optional(),
    fall: import_zod.z.string().optional(),
    land: import_zod.z.string().optional(),
    attack: import_zod.z.string().optional(),
  }),
});

// src/serialize.ts
function serializeAvatar(_spec) {
  return '';
}
function deserializeAvatar(_data) {
  return null;
}

// src/renderer/index.ts
function createRenderer(_props) {
  return {
    mount: (_el) => {
      return void 0;
    },
    dispose: () => {
      return void 0;
    },
  };
}

// src/index.ts
function clampMorph(_spec, _id, value) {
  return value;
}
function validateAvatar(spec) {
  const result = AvatarSpecV15.safeParse(spec);
  return result.success;
}
// Annotate the CommonJS export names for ESM import in node:
0 &&
  (module.exports = {
    AvatarSpecV15,
    clampMorph,
    createRenderer,
    deserializeAvatar,
    serializeAvatar,
    validateAvatar,
  });
