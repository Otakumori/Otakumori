# Avatar Visual Contract

Implementation contract for Otaku-mori avatars across profile, community, and mini-game surfaces. Derived from [Issue #33](https://github.com/Otakumori/Otakumori/issues/33).

**Status:** Specification only. No avatar runtime implementation in this lane.

**Related documents:**

- `docs/design/mori-visual-system.md` — shared Mori visual language
- `docs/testing/baseline-stabilization.md` — six mini-game avatar integration gaps
- `packages/avatar/README.md` — current `@om/avatar` package architecture

---

## Avatar art direction

Avatars belong in the same world as the Mori dark storybook interface.

### North star

The avatar should feel like a **playable familiar** — shrine doll, paper doll, occult companion, or relic-bound character — not a tech-demo mannequin.

### Palette and line

- charcoal / ink base harmony with site surfaces
- muted sakura pink accents
- warm ivory highlights
- antique linework and soft ink outlines
- subtle bloom and muted shadows — not harsh realistic lighting

### Style constraints

| Target | Avoid |
| --- | --- |
| Anime-inspired, readable, slightly eerie charm | Overly cutesy chibi-default for all contexts |
| Dark fantasy boutique / soft gothic anime | Generic 3D mannequin or default humanoid |
| Cel-shaded or illustrated rendering | Glossy plastic mobile-game mascot |
| Silhouette-first, recognizable at small sizes | Bitmoji / Roblox / SaaS profile blob |
| PS1 / old-game-menu restraint | Uncanny realism or stiff T-pose energy |

### Rendering preference

- **Preferred:** cel-shaded or illustrated 2D/2.5D presentation, SVG thumbnail fallbacks, restrained 3D with ink-outline treatment.
- **Acceptable:** lightweight 3D with flat/toon materials aligned to Mori palette.
- **Discouraged:** hyper-realistic PBR skin, neon rim lighting, or unbounded procedural meshes without art direction.

---

## Default fallback avatar

A user with no customization must still see an intentional, on-brand avatar — never a gray placeholder mannequin.

### Fallback visual spec

- pale warm skin tone or neutral stylized base
- dark hair or shadowed hood option
- muted sakura accent (ribbon, obi, petal motif, or frame edge)
- ivory highlight on face or garment trim
- simple shrine-doll outfit or dark academy / gothic outfit
- readable silhouette at 32px thumbnail size

### Fallback behavior

- Default spec must be defined once in `@om/avatar` policy/spec layer — not per-game hardcoding.
- When avatar load fails, render fallback SVG or static illustration before showing an empty frame.
- Guest and signed-out users see the same strong default, not a broken or null state.
- NSFW and policy fallbacks continue to use server-resolved safe equipment per `packages/avatar` architecture.

### Current state acknowledgment

The avatar layer is **functional in pieces but visually rough**:

- `@om/avatar` v1.5 provides equipment slots, morphs, and policy resolution.
- `app/adults/_components/AvatarRenderer.safe.tsx` and `packages/avatar` renderer exist but skew procedural/3D-heavy relative to this contract.
- `app/mini-games/_shared/useGameAvatarWithConfig.ts` wires central configs, but six games still fail avatar integration QA per PR #32.
- Avatar API/export/save routes have stale test contracts (35 failures documented in baseline stabilization).
- Two avatar validation/spec tests flag asset/default-spec mismatches — confirm against this contract before changing code.

---

## Customization categories

Long-term avatar system should support modular identity without changing display-mode coherence.

| Category | Examples |
| --- | --- |
| Base body / silhouette | Height, proportions, gender presentation |
| Face / eyes | Eye shape, iris palette, expression baseline |
| Hair | Style, length, color |
| Outfit | Shrine-doll, academy, gothic boutique sets |
| Accessory | Pins, chains, charms, weapons (context-gated) |
| Aura / frame / title effects | Portrait frames, dungeon mood overlays |
| Color palette | Skin, hair, eyes, accent sakura |
| Seasonal overlays | Unlockable event cosmetics |
| Profile-frame cosmetics | Censor bar / frame styles where policy allows |

Customization must serialize to a single identity profile that all display modes derive from — not separate per-game avatars.

---

## Display modes

The system supports four representation modes. They already exist conceptually in `app/mini-games/_shared/miniGameConfigs.ts` and `@om/avatar-engine` types. Implementation must make them **visually coherent**, not unrelated render hacks.

| Mode | Frame | Typical scale | Use when |
| --- | --- | --- | --- |
| `fullBody` | Full figure, optional ground shadow | Large / gameplay-adjacent | Avatar is central to action or arena presence |
| `bust` | Waist-up ornamental frame | Medium | Character-focused rhythm or dungeon surfaces |
| `portrait` | Head-and-shoulder medallion | Small / compact UI | Profile tokens, puzzle cards, HUD corners |
| `chibi` | Compact proportional remap, larger head | Small / playful | Sandbox, physics toy, microgame identity |

### Mode rules

- One underlying `AvatarProfile` drives all modes via `mapAvatarToGameRepresentation` — no duplicate configs per game.
- Each mode shares ink-outline treatment, sakura accent rules, and fallback avatar.
- Mode switching must not reload assets unnecessarily; prefer cached SVG or shared rig pose.
- Games reference mode through `getGameRepresentationMode(gameId)` — not inline strings.

---

## Mini-game placement rules

Six games currently lack passing avatar integration (PR #32). Each must adopt the mode and placement below.

| Game | Mode | Placement direction | Gameplay constraint |
| --- | --- | --- | --- |
| `petal-samurai` | `fullBody` | Calm sword-bearing companion or side silhouette | **Never** block slice gameplay or VFX focus; hide if quality insufficient per `shouldDisplayAvatarConditionally` |
| `memory-match` | `portrait` | Framed player token / profile medallion | Decorative only; must not obscure card grid |
| `bubble-girl` | `chibi` | Soft physics sandbox companion | Playful scale; stays clear of bubble spawn zones |
| `blossomware` | `chibi` | Compact microgame identity badge | Expressive at small size; minimal layout footprint |
| `dungeon-of-desire` | `bust` | Moody dungeon-party portrait in ornamental frame | Character-focused; no full-body arena staging |
| `thigh-coliseum` | `fullBody` | Stylized combatant presence at arena edge | Readable silhouette; must not obscure bracket UI |

### Shared integration pattern

Do **not** hard-code six unrelated visual implementations.

```
AvatarProfile
    ↓
useGameAvatarWithConfig(gameId)
    ↓
getGameRepresentationMode(gameId)
    ↓
mapAvatarToGameRepresentation(profile, mode)
    ↓
GameAvatarFrame (shared wrapper) + game-specific placement slot
```

- **One** shared adapter hook: `useGameAvatarWithConfig` (extend, do not fork per game).
- **One** shared visual wrapper: compact frame, bust plate, or chibi pedestal component.
- **Game-specific** placement components only for position and z-index — not rendering logic.
- Consistent fallback when avatars disabled (`isAvatarsEnabled`), missing profile, or failed load.

### Games outside the six-gap set

Existing configs also define modes for `otaku-beat-em-up` (`fullBody`), `petal-storm-rhythm` (`bust`), and `puzzle-reveal` (`portrait`). New work on the six gaps must not regress these mappings.

---

## Accessibility rules

- Decorative avatar frames, auras, and petals around portraits use `aria-hidden="true"`.
- Interactive avatar elements (e.g. preset picker) require visible labels and keyboard access.
- Avatar images in UI must have meaningful `alt` text or `role="img"` with `aria-label` when they convey player identity.
- Do not convey game state by avatar color alone; pair with text or iconography.
- Avatar-driven animations must not trap focus or steal input from gameplay controls.
- Profile medallions in `memory-match` must not be the only indicator of player identity — include text handle where applicable.

---

## Performance rules

- Prefer SVG thumbnails and cached renders for `portrait` and `chibi` modes.
- Lazy-load full 3D avatar assets only for `fullBody` and `bust` when feature flag enabled.
- Cap concurrent avatar renderers per viewport (recommend ≤ 2 live 3D instances).
- Dispose Three.js or canvas resources on unmount.
- Preload hair/outfit assets only for active game context — not globally on homepage.
- Avatar rendering must not block mini-game input loops or frame budgets (< 16ms target for gameplay routes).

---

## Reduced-motion rules

When `prefers-reduced-motion: reduce`:

- Disable idle bob, breathing, cape flutter, and camera drift on avatar displays.
- Show static pose or single-frame SVG thumbnail.
- Allow swap of display mode without animated transition.
- GameCube-adjacent avatar intros must be skippable or omitted.
- Gameplay-critical avatars may remain visible as static illustrations.

---

## Implementation sequence

Follow this order to prevent six unrelated hard-coded solutions:

| Step | Branch / PR | Deliverable |
| --- | --- | --- |
| 1 | `docs/visual-avatar-contracts` (this PR) | Written contracts only |
| 2 | `feat/shared-mori-visual-primitives` | `GameAvatarFrame`, shared Mori border tokens |
| 3 | `feat/avatar-adapter-proof-petal-samurai` | Adapter + `fullBody` placement proof in one game |
| 4 | `feat/avatar-adapter-remaining-games` | Roll adapter to memory-match, bubble-girl, blossomware, dungeon-of-desire, thigh-coliseum |
| 5 | `docs/avatar-contract-finalization` | Revise contract if asset pipeline decisions change |
| 6 | `test: repair avatar API/export/save contract` | Align API tests with finalized spec (separate from visual PRs) |

### Per-PR gates

- Each game PR must pass mini-game QA avatar validator in `scripts/qa/validators.ts`.
- No new per-game `AvatarRenderer` forks — extend shared adapter only.
- Feature flag `isAvatarsEnabled` must gate all new integrations.

---

## What not to do

- Do not ship Bitmoji-style 2D avatar builders as the primary look.
- Do not use Roblox-like blocky proportions except inside explicit `chibi` mode scaling rules.
- Do not default to gray mannequin or skeleton placeholder in live user-facing UI.
- Do not create six copy-paste avatar components under `app/mini-games/(games)/**`.
- Do not modify Stripe, Printify, provider-write, database, migrations, env, or lockfile in avatar visual PRs.
- Do not change PR #31 security gates or PR #32 diagnostic classifications without explicit approval.
- Do not repair avatar API/export/save behavior in the same PR as visual integration unless scoped and approved.

---

## Files to inspect before implementation

### Configuration and integration

- `app/mini-games/_shared/miniGameConfigs.ts` — representation mode source of truth
- `app/mini-games/_shared/useGameAvatarWithConfig.ts` — game avatar hook
- `app/mini-games/_shared/AvatarPresetChoice.tsx` — preset selection UI
- `app/mini-games/_shared/gameVisuals.ts` — visual config and mode documentation
- `scripts/qa/validators.ts` — avatar integration QA rules

### Packages

- `packages/avatar/**` — spec, policy, renderer, thumbnails
- `packages/avatar-engine/**` — game integration, `mapAvatarToGameRepresentation`
- `packages/avatar/src/spec.ts` — default spec and validation
- `packages/avatar/src/policy.ts` — renderable assertions and fallbacks

### Game routes

- `app/mini-games/(games)/petal-samurai/**`
- `app/mini-games/(games)/memory-match/**`
- `app/mini-games/(games)/bubble-girl/**`
- `app/mini-games/(games)/blossomware/**`
- `app/mini-games/(games)/dungeon-of-desire/**`
- `app/mini-games/(games)/thigh-coliseum/**`

### Renderer and editor (current rough state)

- `app/adults/_components/AvatarRenderer.safe.tsx`
- `app/components/avatar/AvatarRenderer3D.tsx`
- `app/avatar/community-hub/**`
- `app/avatar/editor/page.tsx`

### Tests and diagnostics

- `docs/testing/baseline-stabilization.md` — six integration gaps, API debt inventory
- `packages/avatar/src/__tests__/spec.test.ts` — default spec mismatches
- Avatar API/export/save test suites referenced in baseline doc

---

## Acceptance mapping (Issue #33)

| Issue #33 requirement | Section in this document |
| --- | --- |
| Avatar art direction | Avatar art direction |
| Default fallback avatar | Default fallback avatar |
| Supported display modes | Display modes |
| Mini-game placement expectations | Mini-game placement rules |
| Accessibility rules | Accessibility rules |
| Implementation sequence | Implementation sequence |
| Out of scope | What not to do |

This issue is complete when this document is merged. Implementation follows the recommended PR sequence above.
