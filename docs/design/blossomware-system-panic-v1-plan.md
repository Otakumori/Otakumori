# Blossomware System Panic V1 Plan

Status: proposed separate implementation; no runtime change in the game-production-assets PR.

## Current runtime fit

The existing Blossomware route already provides deterministic classic, short, and daily playlists, seeded runs, score and personal-best results, replay, and return-to-hub behavior. `components/arcade/Engine.tsx` owns explicit run phases, round transitions, pause behavior, timer cleanup, and per-round/per-run completion guards. Its microgame boundary is the small `GameProps` contract.

The engine can support the proposed scenario families without a framework migration. The current one-second timer is adequate for a first four-to-six-second interaction, but it is not a rhythm-grade clock. Keyboard, pointer, and touch behavior remain individual microgame responsibilities rather than a shared input abstraction.

## First vertical slice

Build a retro desktop pop-up closing challenge on a new branch named `codex/blossomware-system-panic-v1` after the current game stack is reconciled.

- Use original CSS and procedural geometry; do not acquire or activate candidate assets.
- Seed five window positions and their close order from the run seed.
- Accept pointer and touch activation plus keyboard focus and Enter/Space activation.
- Give the player four to six seconds, with a single unambiguous command.
- Complete or fail exactly once and dispose all timers/listeners on transition, replay, pause, and unmount.
- Use restrained CRT/system language inside the scenario while retaining the Mori frame outside it.
- Include reduced-motion feedback and a non-color-only success/failure state.

## Safety boundaries

- Do not change petal or wallet authority. The slice uses the existing completion boundary only.
- Do not add public credits for unacquired research candidates.
- Do not import Godot or code from `little-warioware`; it is architecture reference only.
- Do not place this work in PR #124. That PR remains the production-asset, provenance, Credits, Puzzle, Petal Samurai, and Bubble lane.

## Focused acceptance tests

- The seeded layout and close order are deterministic.
- An incorrect or late action fails exactly once.
- Rapid repeated input cannot complete twice.
- Replay resets all guards and creates the same layout for the same seed.
- Keyboard, pointer, and touch paths reach the same semantic actions.
- Pause and unmount stop timers without restarting the engine loop.
- No new reward endpoint or reward amount is introduced.
