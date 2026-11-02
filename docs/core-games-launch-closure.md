# Core Games Launch Closure

## Personal-best authority

The five core titles use `LeaderboardScore` through `/api/v1/games/personal-best` for
reward-free personal-best persistence. The canonical IDs are:

- `otaku-beat-em-up`
- `petal-storm-rhythm`
- `memory-match`
- `petal-samurai`
- `blossomware`

`diff` stores the non-null result partition (mode, difficulty, track, or playlist). The
existing compound uniqueness constraint keeps each partition monotonic. Petal rewards remain
owned by the existing completion authority and are never granted by the PB route.

## Technical closure

- **Otaku Beat-em-up:** per-mode PB and result status, one result submission, mobile movement
  and combat controls, and one authoritative HUD/result path.
- **Petal Storm Rhythm:** per-track/difficulty PB, deterministic chart generation, five-lane
  pointer/touch/keyboard input, and explicit preview-only audio status.
- **Memory Card / Defrag:** per-difficulty/challenge PB plus an Echo Preview challenge that
  briefly reveals the deterministic board before unlocking input.
- **Petal Samurai:** truthful Timed/Endless modes and three disciplines, one animation-loop
  owner, pointer/touch slicing, per-mode/difficulty PB, and replayable results.
- **Blossomware:** deterministic Classic, Quick, and Daily playlists with aggregate per-playlist
  PB. Existing per-microgame reward cadence is unchanged.

## Production assets remaining

| Game               | Required asset                                                         | Expected format and runtime authority                                                                                   | Blocker                                                                                   |
| ------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Otaku Beat-em-up   | Fighter animation family                                               | Versioned WebP/PNG sprite atlas under `/assets/mini-games/otaku-beat-em-up/fighter/`                                    | No owner-approved production fighter family exists.                                       |
| Otaku Beat-em-up   | Grunt, ninja, brute, and boss families                                 | Versioned WebP/PNG atlases under `/assets/mini-games/otaku-beat-em-up/enemies/`                                         | Current runtime representation is procedural, not production art.                         |
| Otaku Beat-em-up   | Street/climax environments and result/cover art                        | WebP backgrounds and cover/result masters under `/assets/mini-games/otaku-beat-em-up/`                                  | No approved environment/result family is registered.                                      |
| Otaku Beat-em-up   | Combat and music package                                               | Authored OGG hit, block, combo, hurt, victory, beat, and BGM sources under `/assets/mini-games/otaku-beat-em-up/audio/` | Current synthesized beat is not authored production audio.                                |
| Petal Storm Rhythm | Authored tracks                                                        | Licensed/owned OGG sources under `/assets/mini-games/petal-storm-rhythm/tracks/`                                        | The three displayed track identities have no runtime audio files.                         |
| Petal Storm Rhythm | Authored charts                                                        | Versioned JSON charts paired to exact audio checksums under `/assets/mini-games/petal-storm-rhythm/charts/`             | Deterministic generated charts prove runtime behavior but are not final authored content. |
| Petal Storm Rhythm | Lane/note/result/cover art                                             | WebP/PNG runtime derivatives under `/assets/mini-games/petal-storm-rhythm/`                                             | Manifest entries point at absent demo files and are not production authority.             |
| Petal Samurai      | Shrine, blade/hand, petal/hazard, slash, HUD, result, and cover family | Versioned WebP/PNG runtime derivatives under `/assets/mini-games/petal-samurai/`                                        | No registered role mapping or owner-approved production family exists.                    |
| Petal Samurai      | Slice/combo package                                                    | Authored OGG sources under `/assets/mini-games/petal-samurai/audio/`                                                    | Resolver keys currently have no production mapping.                                       |
| All five titles    | Game Hub covers                                                        | Owner-approved WebP/JPG covers referenced by the canonical game registry                                                | Named fallback cards remain truthful; production covers are absent.                       |

Memory Card / Defrag already has authored runtime art and sound. Blossomware retains its
authored microgame presentation; only its hub cover remains production asset work.

## Release classification

The five titles are **TECHNICALLY READY — ASSET PRODUCTION REMAINS**. This does not promote
missing art or audio, change reward authority, or declare owner visual approval.
