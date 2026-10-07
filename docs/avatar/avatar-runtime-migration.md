# Avatar Runtime Migration Inventory

Status: repository audit for Avatar V2 foundation.

Canonical destination: `packages/avatar` / `@om/avatar`.

This inventory exists because Otaku-mori currently contains several independently evolved avatar stacks. New functionality must not deepen that split.

## Route-level consumers

| Path | Current role | V2 disposition |
| --- | --- | --- |
| `app/avatar/editor/page.tsx` | 3D editor using `app/components/avatar/AvatarRenderer3D` + `AvatarEditorPanel` | **Canonical UI route candidate.** Replace internals with V2 creator once runtime is ready. |
| `app/avatar-editor/page.tsx` | separate procedural editor using `components/avatar/AvatarSystem` and localStorage | **Legacy route.** Preserve until replacement is verified, then redirect to `/avatar/editor`. |
| `app/avatar/demo/page.tsx` | procedural demo and direct content flags | **Development/demo only.** Do not use as production architecture. |
| `app/test/sara-creator/*` | Sara/model test path | **Test fixture only.** Migrate useful visual test cases, not runtime ownership. |
| `app/avatar/community-hub/components/CharacterCanvas.tsx` | community avatar rendering | **Consumer adapter.** Move to canonical renderer after creator migration. |
| `app/adults/_components/AvatarRenderer.safe.tsx` | separate mature-route procedural renderer/physics | **Migration-only.** Adult delivery must use the same V2 identity/runtime with server-resolved assets. |

## Package/runtime ownership

| Path | Current role | V2 disposition |
| --- | --- | --- |
| `packages/avatar` | V1.5 spec/policy/renderer package | **Canonical.** V2 schemas and runtime primitives live here. |
| `packages/avatar-engine` | separate procedural/game avatar engine, representations, sprite integration | **Migration-only.** No new core features. Move reusable representation/game concepts behind `@om/avatar` adapters. |
| `app/lib/3d/model-loader.ts` | legacy loader/optimization utility | **Replace.** Runtime LOD generation, Canvas texture resize/atlasing, name-based mature-content detection and placeholder ratios are non-canonical. |
| `app/stores/avatarStore.ts` | historical Zustand creator state | **Audit/migrate.** UI state may remain Zustand, but durable identity must serialize through AvatarSpecV2. |
| `app/lib/3d/avatar-parts.ts` | older avatar configuration model | **Adapter/migration input.** Do not extend as the new durable schema. |

## Game-specific consumers

These currently bypass or depend on `@om/avatar-engine` and must migrate incrementally:

- `app/mini-games/_shared/GLBAvatarLoader.tsx`
- `app/mini-games/_shared/GameAvatarRenderer.tsx`
- `app/mini-games/_shared/EnhancedGameAvatarRenderer.tsx`
- `app/mini-games/_shared/PhysicsCharacterRenderer.tsx`
- `app/mini-games/_shared/useGameAvatarWithConfig.ts`
- `app/mini-games/_shared/useSpriteAvatar.ts`
- `app/mini-games/_shared/AvatarPresetChoice.tsx`
- `app/mini-games/_shared/GameEntryFlow.tsx`
- `app/mini-games/_shared/GameHUD.tsx`
- `app/mini-games/_shared/GameOverlay.tsx`
- `app/mini-games/_shared/characterConverter.ts`
- `app/components/arcade/QuakeAvatarHud.tsx`
- game routes importing those shared systems, including puzzle-reveal, otaku-beat-em-up and petal-storm-rhythm.

Migration rule: **games consume the same saved AvatarSpecV2; they may request a representation/camera/quality preset, but they do not own another character schema.**

## Sprite path

`app/api/v1/avatar/generate-sprites/route.ts` currently imports sprite types/helpers from `@om/avatar-engine` and explicitly returns `501 NOT_IMPLEMENTED` for server-side generation.

V2 disposition:

1. keep sprite generation out of the critical creator path;
2. migrate sprite-generation input to AvatarSpecV2 / ResolvedAvatarV2;
3. use a deterministic render service or browser worker only after the canonical renderer is stable;
4. key generated sprite caches from versioned normalized spec + representation + asset immutable revisions, not a weak ad-hoc integer hash;
5. never allow sprite generation to bypass restricted-asset policy.

## Known architectural conflicts

### Duplicate editor routes

Both `/avatar/editor` and `/avatar-editor` currently exist with different runtime/state systems.

Decision: `/avatar/editor` is the long-term canonical route because it belongs to the avatar route family. Do not redirect/remove `/avatar-editor` until V2 parity and route analytics/manual verification are complete.

### Duplicate schemas

V1.5, `AvatarProfile`, procedural configs and `AvatarConfiguration` overlap.

Decision: AvatarSpecV2 becomes the durable identity. Migration functions translate old persisted records into V2 without mutating historical data in place until migration is tested.

### Duplicate policy

V1.5 includes slot-name heuristics and a public environment filter bypass.

Decision: V2 asset manifests provide explicit content ratings, and V2 policy fails closed from trusted server inputs. Do not infer policy from filenames, slot prefixes or material names.

### Duplicate render loops

Several historical renderers use always-on `useFrame` for decorative breathing/rotation or procedural physics.

Decision: V2 centralizes frame activity. Static creator state returns to demand rendering.

### Duplicate loader caches

Drei `useGLTF`, legacy ModelLoader caches and game-specific loader caches coexist.

Decision: V2 modular wardrobe ownership belongs to AssetRepository. `useGLTF` may remain for isolated immutable fixtures, but not as the lifecycle authority for the production wardrobe.

## Migration order

**M0: contracts and runtime primitives.** Current foundation branch.

**M1: V1.5 -> V2 migration function and server resolved-asset adapter.** No visual replacement yet.

**M2: canonical V2 renderer behind a feature flag on `/avatar/editor`.** Keep legacy renderer available for comparison.

**M3: move creator persistence/save/load to V2.** Preserve backward compatibility for existing records.

**M4: migrate community/profile renderer.**

**M5: migrate one representative 3D game, then remaining game renderers.**

**M6: migrate sprite consumers.**

**M7: remove `@om/avatar-engine` from application consumers, then archive/delete package only when code search proves zero imports.**

**M8: redirect legacy `/avatar-editor` to canonical route after owner visual approval and behavioral parity.**

## Delete-later criteria

A legacy path is removable only after all of these are true:

- zero production imports;
- zero route ownership;
- replacement has tests;
- replacement has production-equivalent policy behavior;
- saved legacy configurations have a migration path;
- visual/interaction parity has been reviewed where the path is user-facing;
- repository search confirms no dynamic-string/import references;
- removal is isolated in its own cleanup PR.

The migration strategy favors adapters and evidence over large destructive rewrites.
