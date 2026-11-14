# Secondary Games Launch Closure

## Runtime authority

- Canonical Bubble identity: `bubble-ragdoll`; `bubble-girl` remains a compatibility alias only.
- Personal-best persistence is owned by PR #122's `/api/v1/games/personal-best`. This branch is stacked on exact #122 head and adds only the five secondary IDs/result partitions.
- Game completion rewards remain separate from personal-best persistence.

## Product closure

| Game              | Bounded launch loop                                                                                           | Release state                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Bubble Ragdoll    | Rotating pop/combo/score objectives, finite success/timeout, results and replay                               | TECHNICALLY READY — CONTENT REMAINS |
| Puzzle Reveal     | Deterministic two-item approved pack rotation, no immediate repeat, four difficulties, truthful asset failure | TECHNICALLY READY — CONTENT REMAINS |
| Thigh Colosseum   | 10,000m expedition, 500m milestones, escalating stages, completion/failure and replay                         | TECHNICALLY READY — CONTENT REMAINS |
| Dungeon of Desire | Ten-floor expedition, succubus/wraith/demon-lord grammar, floor-ten boss climax                               | TECHNICALLY READY — CONTENT REMAINS |
| Maid Café Manager | Two-minute service shift, final 30-second rush, shift result and replay                                       | TECHNICALLY READY — CONTENT REMAINS |

## Production asset contracts

| Semantic ID                              | Purpose                               | Source / runtime                                 | Composition and animation                                   | Approval                |
| ---------------------------------------- | ------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------- | ----------------------- |
| `game.bubble-ragdoll.cover-v1`           | Hub/threshold cover                   | approved 16:9 WebP runtime derivative            | center-safe ragdoll/bubble silhouette; phone crop safe      | REAL / APPROVED RUNTIME |
| `game.bubble-ragdoll.result-v1`          | objective/climax treatment            | layered PSD/CLIP → transparent WebP              | 4:3 and portrait-safe; optional 8–12 frame pop accent       | MISSING                 |
| `game.bubble-ragdoll.audio-v1`           | pop, bounce, fail, victory            | 48kHz WAV → OGG                                  | one-shots under 2s; no baked silence                        | MISSING                 |
| `game.puzzle-reveal.pack-v1`             | reveal content pack                   | layered/source art → 4:3 WebP, minimum 1600×1200 | 6–8 owner-approved images; central 70% safe on phones       | PARTIAL: 2/8            |
| `game.puzzle-reveal.cover-v1`            | Hub/threshold cover                   | approved 16:9 WebP runtime derivative            | phone-safe focal composition                                | REAL / APPROVED RUNTIME |
| `game.puzzle-reveal.result-v1`           | completion payoff                     | layered PSD/CLIP → transparent WebP              | optional restrained reveal burst                            | MISSING                 |
| `game.thigh-colosseum.cover-v1`          | Hub/threshold cover                   | approved 16:9 WebP runtime derivative            | subject inside central 60%; mature-safe public crop         | REAL / APPROVED RUNTIME |
| `game.thigh-coliseum.milestones-v1`      | 500m/climax/result presentation       | layered source → WebP sprites                    | portrait/landscape safe; optional short milestone sequence  | MISSING                 |
| `game.thigh-coliseum.audio-v1`           | chase, milestone, impact, victory     | 48kHz WAV → OGG                                  | loop 60–120s plus one-shots under 3s                        | MISSING                 |
| `game.dungeon-of-desire.enemy-wraith-v1` | third enemy family                    | layered sprite source → WebP atlas               | idle/move/telegraph/hit/defeat; mobile silhouette legible   | MISSING                 |
| `game.dungeon-of-desire.environment-v1`  | floor variants and floor-ten climax   | layered source → 16:9 WebP                       | edge-safe parallax layers; 390px crop safe                  | MISSING                 |
| `game.dungeon-of-desire.cover-v1`        | Hub/threshold cover                   | approved 16:9 WebP runtime derivative            | phone-safe focal composition                                | REAL / APPROVED RUNTIME |
| `game.dungeon-of-desire.result-v1`       | victory/failure payoff                | layered source → transparent WebP                | landscape and portrait-safe focus                           | MISSING                 |
| `game.dungeon-of-desire.audio-v1`        | floor loop, combat, boss, result      | 48kHz WAV → OGG                                  | seamless 60–120s loops and one-shots                        | MISSING                 |
| `game.maid-cafe.environment-v1`          | café background/table states          | layered source → 16:9 WebP                       | desktop/tablet/390px safe zones; clean/dirty table variants | MISSING                 |
| `game.maid-cafe.customers-v1`            | staff/customer family                 | layered character source → WebP atlas            | waiting/order/eating/leaving; readable at phone scale       | MISSING                 |
| `game.maid-cafe.cover-v1`                | Hub/threshold cover                   | approved 16:9 WebP runtime derivative            | phone-safe focal composition                                | REAL / APPROVED RUNTIME |
| `game.maid-cafe.ui-result-v1`            | orders, rush and shift result         | layered source → transparent WebP                | portrait-safe, no baked functional text                     | MISSING                 |
| `game.maid-cafe.audio-v1`                | café loop, order, serve, rush, result | 48kHz WAV → OGG                                  | seamless 90–120s loop; cues under 3s                        | MISSING                 |

No missing binary was synthesized or promoted. Owner approval remains required before any record becomes production authority.
