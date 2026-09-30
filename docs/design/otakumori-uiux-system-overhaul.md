# Otaku-mori UI/UX System Overhaul

## Authority and scope

This layer is additive to the Mori System Foundation. Home retains its approved environmental scene
and is intentionally excluded from interior-shell selectors. Existing provisional SVGs remain
provisional; this pass does not promote an asset to canonical status.

## Material and containment

Use the weakest form of containment that communicates the content relationship:

1. **Open field** — spacing, type, and a line trace establish the relationship.
2. **Material region** — charcoal paper or lacquer changes the local substrate without a border.
3. **Relic frame** — interrupted bronze corners reserve a frame for an object, record, or rare
   moment.
4. **Functional chamber** — modest structural edges support controls, forms, and state recovery.

Avoid stacking framed regions. Product media, records, and completion seals may carry the strongest
frame; surrounding route layout should remain environmental.

## Type and color roles

- `Marcellus SC` is the production display face through `next/font` with `display: swap`.
- Body and UI text remain clean, system-first sans-serif for compact reading and controls.
- Black lacquer and charcoal paper are the default field; bronze provides architecture; ivory holds
  information; Sakura is a selected, emotional, or completion interruption.
- Seal red is reserved for bounded danger or interrupted states. It is not a routine CTA colour.

## Interaction contract

### Border-to-fill controls

| State | Contract |
| --- | --- |
| Rest | Transparent lacquer field with a quiet bronze edge. |
| Hover / pointer | A dark lacquer fill traces in, the bronze edge clarifies, and the control may lift by 1px. |
| Focus | A persistent high-contrast warm-Sakura focus outline appears outside the control. |
| Pressed | The lift returns to zero; no bounce or glow is used. |
| Selected | Sakura is permitted as a restrained edge/fill signal. |
| Disabled | No fill or transform; readable disabled text remains. |
| Reduced motion | Fill and transform transitions are disabled. |

Controls keep native buttons or links, retain visible labels or accessible names, and preserve a
44px minimum target where the existing component contract requires it.

### Mini-games selector

The hub is a semantic `listbox` with `option` buttons plus one ordinary game-entry link. It supports:

- desktop pointer selection, keyboard Arrow keys, Home, and End;
- touch/pointer swipe after a 32px threshold without a Canvas, WebGL scene, or persistent loop;
- a selected record with optional shallow pointer tilt capped at 2 degrees;
- no tilt, transition, or auto-motion under reduced-motion preferences.

The selector changes only hub navigation. Individual game mechanics and presentation authority stay
inside their existing routes.

## Internal QA surface

`/test/visual-system` uses production primitives to exercise display typography, all four
containment modes, control states, status semantics, linework, and provisional navigation icon
masks. It is an internal specimen, not a route design source.

### Interaction-language lab

The lab also holds a deliberately local set of interaction proofs. They establish the shared
vocabulary without enabling an effect across production routes:

| Verb | Site primitive | Game / relic use | World-moment use |
| --- | --- | --- | --- |
| Trace | Short structural line entrance | Relic-frame geometry | No persistent tracing |
| Reveal | Selected content only | Aperture and depth reveal | Rare memory/unlock expression |
| Lift | 2px material acknowledgement | Shallow pointer-aware relic tilt | Not a global hover treatment |
| Select | Native button state and material shift | Existing Mini-Games selector | Not applicable |
| Confirm | Brief status mark | Seal / inventory acknowledgement | Rare completion ceremony |
| Transition | None globally | Local game composition only | Explicitly reviewed local moment |

`DRIFT`, `BREATHE`, and `SETTLE` are ambient modifiers, not interaction primitives. They stay
subordinate to focus, reading, and critical controls; reduced-motion renders each specimen in its
final stable state. Rope, fluid, particle, and constraint simulations remain research concepts in
the lab until a route-specific performance and accessibility review authorizes an isolated proof.
