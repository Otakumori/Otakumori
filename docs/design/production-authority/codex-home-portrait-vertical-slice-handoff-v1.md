# Codex Handoff — Home Portrait Vertical Slice v1

Use only after the current Home PR correction reaches a stable stopping point.

## Scope

Preflight and prepare exactly one asset family:

`home.world.late-afternoon.portrait-v1`

Read:
- `docs/design/production-authority/README.md`
- `docs/design/production-authority/otaku-mori-home-portrait-asset-authority-v1.md`
- `docs/design/production-authority/otaku-mori-home-portrait-late-afternoon-vertical-slice-brief-v1.md`
- `docs/design/production-authority/otaku-mori-home-portrait-safe-zone-qa-v1.md`

Do not reread broader project history.

## First action

Perform bounded source discovery before art creation.

Search likely project/source locations for:
- portrait/mobile Home exports;
- vertical versions;
- larger/uncropped late-afternoon source;
- layered source;
- alternate late-afternoon candidates.

Do not scan the whole machine.

Classify found files as `CANDIDATE`.

## Do not integrate yet

This phase does NOT:
- change `homeScene.ts`;
- alter CSS;
- replace current runtime art;
- modify time-state behavior;
- create all six portraits;
- merge Home.

## Output

Return only:

DISCOVERY
- exact files found
- dimensions
- SHA-256
- provenance if known

BEST SOURCE
- exact late-afternoon source recommended
- reason

MISSING
- what must actually be created

PRODUCTION PLAN
- smallest method needed:
  existing candidate cleanup / recomposition / extension / generation

SAFE-ZONE CHECK
- 390×844 viability

STATE
- registry ID
- current state

NEXT
- `PRODUCE LATE-AFTERNOON PORTRAIT CANDIDATE`

Then stop.
