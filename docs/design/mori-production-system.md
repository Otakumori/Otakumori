# Mori Visual Production System

Status: **canonical**  
Baseline: Mori Visual Baseline v1 (`6f83f9dd4cfca2c6effdf4c9c529a1db34529ceb`)

This document is the production contract for first-party Otaku-mori surfaces. It extends, rather
than replaces, the foundation and UI/UX overhaul. Home retains its approved environmental authority.

## Core grammar

- Charcoal carries authority and the majority of visible area.
- Bronze `#896F48` carries structural hierarchy.
- Sakura `#AB6366` has an approximate two-percent presence and is reserved for reward, meaningful
  active state, life/magic, and rare selection or emphasis.
- Warm ivory carries information.
- Visible wear is zero. Grain is deterministic and subtle; random dirt, scratches, stains, tears,
  fasteners, or fantasy cuts are not part of the system.
- Canonical corner softness is `9px`; chamfer and ornamental asymmetry are zero.
- Ornament must explain construction, interaction, closure, retention, identity, or real behavior.

The response window is `180ms`. Settling may continue by apparent mass: lightweight controls
180–260ms, small artifacts 240–420ms, hinges 320–520ms, and heavy panels 450–700ms. Reduced motion
keeps the state change and removes unnecessary displacement.

## Material contracts

Percentages below are authored calibration values, not an instruction to add random noise.

| Material      | Locked response                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Charcoal      | roughness 62; normal 70; macro 56; meso 51; micro 4; response 87; bevel 10px; light 210°              |
| Bronze        | roughness 70; patina 1; normal 12; macro 100; meso 18; micro 25; response 100; bevel 16px; light 275° |
| Smoked glass  | roughness 39; transmission 82; IOR 1.58; macro 77; response 100; edge 18px; light 360°                |
| Stone         | roughness 94; plane 60; normal 100; macro 59; meso 51; micro 35; response 72; bevel 12px; light 156°  |
| Paper / fiber | roughness 75; fiber 162°; fiber depth/visibility 27; micro 10; response 85; light 253°                |
| Root / timber | roughness 55; growth 140°; groove 79; macro 62; meso 32; micro 24; response 41; bevel 8px; light 225° |

Macro plane and meso structure must read before micro detail. Glass is retained, not floating.
Underground depth comes from larger relief and material separation, not stochastic grit.

## Construction vocabulary

`MoriConstructedSurface` exposes one typed primitive with these explicit modes:

- `raised`, `inset`, `channel`, `lip`, `recess`, `overlay`
- `retained-glass`, `seam`, `hinge`, `transition`, `press`

The calibration is: apparent lift 24px, inset 15px, bronze lip 1px, channel 12px, overlay 32px,
control/socket recess 20px, press travel up to 9px by scale and mass, material overlap 24px, and
glass containment 24px. Shadows remain subordinate to plane/material separation. Hinges and seams
appear only when functionally justified; screws, rivets, and bolts are not global decoration.

## Page archetypes

`MoriArchetype` is an incremental composition wrapper. It does not own route data or logic.

| Archetype         | Routes                                         | Composition contract                                                                                                         |
| ----------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Merchant          | Shop, PDP, cart, commerce discovery            | Sparse, hero/object-led, full-width, no persistent rail, immediate price/variant/action clarity, strong mobile recomposition |
| Commander Archive | Profile, inventory, achievements, orders       | Centered, environment-forward, no dashboard sidebar dependency, persistent navigation                                        |
| Discovery         | Search, collections, content discovery         | Large entry moment, spacious scanning, utility clarity, environment secondary                                                |
| Ritual / System   | Auth, settings, confirmation, warning          | Dense but strictly grouped, context preserved, functional containment only                                                   |
| Game Threshold    | Hub, launch, pause, results, reward transition | World transition with deep layering, clear utility, no persistent rail, strongly recomposed mobile                           |

Mobile is a recomposition, not a compact desktop. Controls, objecthood, spacing, and legibility remain
large enough to use; hierarchy may stack without shrinking into generic cards.

## Artifact families

- **Commerce — preserve / hybrid / charcoal + bronze.** Code owns semantics, seven-state behavior,
  and accessibility. Approved anchors keep their authored appearance. Forms remain neutral and clear.
- **Commander — preserve / hybrid / charcoal + bronze.** Preserve approved profile, message,
  settings, and identity anchors; ordinary utilities do not become emblems.
- **Navigation — refine / hybrid / charcoal + bronze.** Labels remain accessible HTML. Existing
  semantic navigation and housings are the starting point; motion is restrained.
- **Game — create / code / charcoal + glass.** `MoriGameThreshold`, `MoriGameHud`, and
  `MoriGameOverlay` provide skin-capable threshold, score/timer, pause, reward, and results anatomy.
  Game mechanics keep their own authority and may migrate incrementally.
- **System — create / hybrid / charcoal + bronze.** `MoriSystemState` owns loading, locked,
  unavailable, success, warning, error, and empty semantics, announcements, and recovery slots.

## Asset routing audit

| Class                  | Current authority                                                                                      | Rule                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| A — Hero / bespoke     | Approved Home world states and approved game cover/hub masters                                         | Preserve full approved composition; never regenerate casually      |
| B — Signature artifact | Approved empty states, destination records, avatar anchors, and approved UI imagery                    | Wrap with semantic code; artwork does not own labels or behavior   |
| C — Code-built system  | Mori surfaces, controls, archetypes, construction, shared game UI, system states, navigation semantics | Build and test in code; no raster substitute                       |
| D — Texture / effect   | Deterministic CSS grain, material response, interaction-lab traces/reveals                             | CSS/SVG first; no random placement, persistent loop, or new raster |

Provisional icon assets remain provisional. No asset is promoted by this contract.

## Accessibility and performance

Semantic HTML, visible focus, accessible names, touch targets, text enlargement, pointer/touch parity,
and color-independent states are mandatory. Required navigation or functional text never lives only
inside imagery. Ordinary UI uses CSS/DOM; no WebGL, Canvas, persistent render loop, or new dependency
is introduced by the production layer. Route adoption remains incremental and must preserve data,
auth, commerce, and provider boundaries.

## Inventory classification at introduction

| Phase                             | Status before this implementation | Production result                                                                               |
| --------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------- |
| Core grammar                      | Partial                           | Locked semantic palette, geometry, grain, and response tokens consolidated                      |
| Material system                   | Partial                           | Charcoal, bronze, glass, stone, paper, root, lacquer, parchment, ash, and rare Sakura available |
| Construction                      | Partial                           | One typed construction primitive covers the locked vocabulary                                   |
| Page archetypes                   | Missing                           | Five reusable, responsive wrappers added                                                        |
| Commerce / Commander / Navigation | Partial                           | Existing assets/semantics preserved; family routing hooks added                                 |
| Game                              | Partial                           | Code-native, skin-capable threshold/HUD/overlay family added                                    |
| System states                     | Partial                           | One semantic seven-state wrapper added                                                          |
