# Avatar production intake

## Frozen runtime contract

- Skeleton: `om-humanoid-v1`, runtime root `Hips`, bone authority `STANDARD_RIG_BONES`.
- Older DCC names are import aliases only. Intake must normalize them before a runtime GLB is registered.
- Morphs: canonical Creator fields map once to `om_body_*` and `om_face_*` GLB target IDs in
  `packages/avatar/src/productionContract.ts`. Renderers do not interpret alternate DCC vocabularies.
- Materials: explicit `skin`, `eyes`, `hair`, and `outfit` semantic slots. Undeclared materials are not recolored.
- Animations: `idle`, `walk`, `run`, `jump`, `fall`, `land`, `attack`, and `emote`; absence is reported and renders a stable neutral pose.

## Intake command

```text
pnpm avatar:glb:validate -- --file <candidate.glb> --asset-id <registry-id> --role <base|hair|outfit|accessory>
```

The command is read-only and emits machine-readable JSON. It never rewrites a candidate.

## Legacy specimen result

`human_malefemale_basemesh_rigged.glb` is `REJECTED` as a production base. The inspected source has
two skeleton roots, 1,408 unique joints, none of the required runtime bone names, no required morph
targets, no animation clips, and no semantic skin material. It remains a licensed validator fixture.

## Development harness

`/dev/avatar-production` exists only in development. It uses canonical Creator load/save APIs and
reports exact missing asset IDs. It does not substitute procedural geometry. Runtime preview remains
blocked until registry entries have owner-approved, runtime-ready GLBs.

## Dependency compatibility

The repository currently declares React `18.2`, React DOM `18.2`, `@react-three/fiber` `9.3`, and
`@react-three/drei` `10.7`. Existing focused package tests/build remain the evidence for this branch.
The React/R3F pairing remains a dedicated dependency decision before Avatar Production Closure; this
intake branch intentionally changes no dependencies.

## Source/runtime layout

Authoring masters stay in an immutable provenance location. Approved optimized derivatives receive a
versioned web path and checksum in `content/production-assets.registry.json`. Never overwrite an
approved runtime asset with materially different bytes under the same ID.
