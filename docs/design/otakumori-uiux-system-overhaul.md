# Otaku-mori UI/UX System Overhaul

## Authority and scope

**Mori Visual Baseline v1:** `6f83f9dd4cfca2c6effdf4c9c529a1db34529ceb`, the main merge
of owner-approved PR #91 (`af99700058484770796862c789d838e94a9c02a0`). Route work inherits
this baseline through main ancestry; it does not recreate the system or promote provisional art.

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

- `Marcellus SC` is the first-party visible site face through `next/font` with `display: swap`.
  It covers headings, body, controls, labels, prices, metadata, and status language; hierarchy comes
  from size, leading, tracking, spacing, and colour rather than a generic UI sans fallback.
- Important production text stays at or above the 12px legibility floor. Editorial body copy uses a
  comfortably larger size and avoids aggressive paragraph tracking.
- Black lacquer and charcoal paper are the default field; bronze provides architecture; ivory holds
  information; Sakura is a selected, emotional, or completion interruption.
- Seal red is reserved for bounded danger or interrupted states. It is not a routine CTA colour.

### Frozen route contract

Marcellus SC covers all first-party visible UI, including transactional controls. No route-specific
font system is permitted without an explicit owner exception. Use sentence case, restrained tracking,
comfortable leading, size, opacity and spacing for hierarchy; important UI remains at least 12px and
usable at 200% zoom. Third-party rendered interfaces remain outside this typography contract.

Reuse `--om-lacquer-*`, `--om-charcoal-paper`, `--om-ivory*`, `--om-bronze*`, `--om-sakura`
and `--om-line*` in `app/styles/otakumori-uiux-overhaul.css`. Charcoal is substrate; bronze is
structure/craft; Sakura is life, selection, reward and identity; ivory is information/revelation.
These are not interchangeable operational status colors. Success, warning, destructive and
informational states require distinct explicit text and appropriate semantics, never decorative
brand color alone. Existing MoriStatus success/error/neutral tones support status presentation;
selected is a selection state, not a synonym for success. This freeze adds no status palette.

The normal material vocabulary stays limited to charcoal/lacquer, aged-bronze structure, restrained
Sakura pigment (rare authored Sakura material), and paper/parchment archive material. Existing ash
support is contextual, not permission to invent a material for each route.

Reuse the foundation spacing scale (`--mori-space-*`) and responsive safe insets. Elevation is
explicit, not automatic: ordinary content remains open, object frames are partial, and full
chambers serve actual controls or recovery. Game tilt stays game-only. Keep the existing external
focus outline, native semantics and comfortable touch targets. Icons retain their utility-first
provisional family, single-color readability and accessible names on controls; decorative marks
stay hidden from assistive technology. No icon is promoted here.

The interaction contract below is frozen, not expanded. Route work reuses its fast material changes
and reduced-motion stable states; no global particle, physics or persistent motion system follows.

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

The hub is one semantic `listbox` with one canonical `option` button per game plus one ordinary
game-entry link. Relative geometry is derived from the selected index; there are no fixed nth-child
slots or duplicated focus targets. A masked aperture intentionally reveals only the selected relic,
one or two neighboring relics per side, and a suggestion that the mechanism continues beyond view.

It supports:

- desktop pointer selection, keyboard Arrow keys, Home, and End;
- touch/pointer swipe after a 32px threshold without a Canvas, WebGL scene, or persistent loop;
- a stable selected record with optional shallow pointer tilt capped at 4 degrees and 2px lift;
- immediate visual selection under reduced-motion while preserving the same occluded composition.

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
final stable state. The lab additionally includes two intentionally bounded proofs: a pigment/clip
image reveal (ash-treated base to richer selected image) and an interactive seal aperture with a
native keyboard/touch fallback. Rope, fluid, particle, archive procession, constraint, and full
cloth simulations remain research concepts until a route-specific performance and accessibility
review authorizes an isolated proof.
