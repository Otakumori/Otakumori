# Game Product Completion Audit

Canonical baseline: `a935fa7171559bf03eb2fed36285db34204395f0` (Shared Game Platform Closure v1)

This audit treats runtime behavior as authority. Scores use 0 (absent/broken) through 5
(flagship quality). Platform lifecycle, progression, input, and cleanup contracts are closed;
recommendations below concern play quality and product depth only.

## Product matrix

| Game | Core Loop | Content | Mastery | Replay | Progression | Persistence | Feedback | UX | Mobile | Art | Retention | Classification |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Otaku Beat-em-up | 4 | 4 | 4 | 4 | 3 | 2 | 4 | 3 | 3 | 3 | 4 | LAUNCH READY |
| Petal Storm Rhythm | 4 | 3 | 5 | 4 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | LAUNCH READY |
| Memory Keeper / Defrag | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 5 | 4 | 5 | 4 | LAUNCH READY |
| Petal Samurai | 4 | 3 | 4 | 4 | 3 | 2 | 5 | 4 | 4 | 4 | 4 | LAUNCH READY |
| Blossomware | 4 | 4 | 3 | 4 | 4 | 3 | 4 | 3 | 3 | 3 | 4 | LAUNCH READY |
| Bubble Ragdoll | 4 | 2 | 3 | 3 | 3 | 1 | 4 | 4 | 4 | 3 | 3 | SECONDARY READY |
| Puzzle Reveal | 3 | 3 | 3 | 3 | 3 | 1 | 3 | 4 | 4 | 3 | 3 | SECONDARY READY |
| Thigh Colosseum | 3 | 2 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | SECONDARY READY |
| Dungeon of Desire | 3 | 2 | 3 | 3 | 3 | 3 | 4 | 3 | 3 | 3 | 3 | VERTICAL SLICE |
| Maid Café Manager | 3 | 2 | 3 | 3 | 1 | 3 | 2 | 3 | 2 | 2 | 2 | VERTICAL SLICE |

## Runtime audit

### Otaku Beat-em-up

- **Loop/content/mastery:** Three real modes; ten-wave Story, endless Arcade, and timed
  Survival. Four enemy grammars (grunt, ninja, brute, boss), boss cadence, beat-window
  attacks, combos, multipliers, and variable wave composition create a strong skill loop.
- **Persistence/product systems:** Canonical result progression is connected. No runtime
  evidence of durable personal-best presentation was found.
- **UX/mobile/controller/art:** Shared pause/result/exit are clear and full controller
  gameplay is real. Dense combat and the canvas HUD need a dedicated mobile polish pass;
  current code-built fighters do not yet provide flagship visual closure.
- **Exhaustion:** Roughly 3-6 sessions before encounter grammar becomes familiar; mastery
  and mode switching extend replay beyond content discovery.
- **Primary drop-off:** Repeated enemy presentation makes later waves feel numerically
  harder rather than dramatically new.
- **Highest-value improvement:** Add one authored climax encounter using the existing boss,
  beat, and wave systems, with a clearer end-of-run rank/PB comparison.
- **Minimum completion package:** Existing-asset boss staging, rank thresholds derived from
  current score facts, and durable PB display. Protect combat timing, scoring, and controls.

### Petal Storm Rhythm

- **Loop/content/mastery:** Five-lane timing with perfect/great/good/miss judgments, health,
  combo, accuracy, full-combo bonus, and three tracks (92-140 BPM; easy-hard). Beat maps use
  structured and randomized patterns; timing authority is game-local.
- **Persistence/product systems:** Canonical rewards, returned achievement facts, and the
  leaderboard path exist. Track definitions do not prove production audio assets.
- **UX/mobile/controller/art:** Results are informative and controller strikes feed the live
  timing path without owning it. Controller remains partial and mobile five-lane density is
  the principal presentation risk.
- **Exhaustion:** Meaningful content is visible in 3-5 runs; score and accuracy mastery can
  support many more, but the three-track ceiling becomes obvious quickly.
- **Primary drop-off:** The small track catalog exhausts before the deep judgment model does.
- **Highest-value improvement:** Produce and validate real authored audio/beat-map content for
  the existing three track identities, then add one advanced chart variant per existing track.
- **Minimum completion package:** Production audio, deterministic chart validation, and PB/rank
  comparison using existing leaderboard authority. Protect audio clock and judgment windows.

### Memory Keeper / Defrag

- **Loop/content/mastery:** Three boards (6/8/10 pairs), seeded layouts, move/time scoring,
  streaks, perfect and low-move clear facts, and full keyboard semantics. The ten-face visual
  vocabulary and authored reliquary states give this the most complete art-language closure.
- **Persistence/product systems:** Saves and semantic reward/achievement facts are connected;
  no speculative achievement IDs are created by the runtime.
- **UX/mobile/controller/art:** Excellent onboarding, focus, results, and responsive board
  structure. Controller gameplay is not a product requirement for the existing semantic grid.
- **Exhaustion:** All board rules are understood in 2-4 sessions; seeded shuffles preserve
  mastery replay, but not new content discovery.
- **Primary drop-off:** Difficulty grows by board size without adding a second memory rule.
- **Highest-value improvement:** Add one existing-art rule variant (for example, a short preview
  phase) as a selectable challenge, without changing the base game.
- **Minimum completion package:** One challenge modifier, saved best result per difficulty, and
  result comparison. Protect semantic grid behavior and deterministic engine tests.

### Petal Samurai

- **Loop/content/mastery:** Sixty-second slicing with three petal rarities, hazards, three
  power-ups, combo scaling, speed escalation, storm behavior, and difficulty tuning. The live
  canonical route uses timed/normal while the engine supports broader mode vocabulary.
- **Persistence/product systems:** Canonical rewards and leaderboard submission exist; the
  result shows score, combo, misses, and earned Petals but no durable PB comparison.
- **UX/mobile/controller/art:** Strong tactile canvas feedback and character reactions; touch
  is a natural fit. Controller gameplay is not required for the direct slicing gesture.
- **Exhaustion:** Core content is visible in 2-4 runs; improving precision and combo provides
  longer score-chasing value.
- **Primary drop-off:** The route exposes less of the already-implemented mode/difficulty
  vocabulary than the engine can safely support.
- **Highest-value improvement:** Expose a bounded mode/difficulty selection using existing
  engine values and record a PB for each real combination.
- **Minimum completion package:** Mode selector, per-mode PB comparison, and tuned instruction
  copy. Protect slice physics, spawn balance, and reward values.

### Blossomware

- **Loop/content/mastery:** Eleven microgames (3-60 seconds) run through one finite orchestrated
  playlist with accumulated score, success/failure, streak, transition cleanup, and one-active-
  game ownership. Individual mechanics and specialized input remain local.
- **Persistence/product systems:** Intentional per-success and milestone Petal cadence is
  canonical and idempotent; the aggregate result is not a replacement reward.
- **UX/mobile/controller/art:** High variety and fast recovery support replay. Instruction and
  visual consistency vary by microgame; controller truth is menus-only because capabilities are
  not universal.
- **Exhaustion:** One long run exposes nearly the whole catalog; ordering and performance create
  approximately 3-6 varied sessions before repetition dominates.
- **Primary drop-off:** A fixed full-catalog sequence makes run shape predictable after the first
  complete playthrough.
- **Highest-value improvement:** Add deterministic playlist variants using the existing registry
  (short, shuffled, and daily-seeded), without changing microgames or rewards.
- **Minimum completion package:** Existing-catalog playlist selection, run seed display, and PB
  comparison. Protect microgame reward cadence and orchestrator ownership.

### Bubble Ragdoll

- **Loop/content/mastery:** One 60-second direct-manipulation physics round with spawned bubbles,
  combo scoring, misses, and tactile pointer/touch interaction. Physics/input are correctly local.
- **Persistence/product systems:** Canonical final-run rewards are connected; no meaningful save
  or unlock progression is evidenced.
- **UX/mobile/controller/art:** Touch is the intended input. Controller is truthfully menus-only.
  Shared pause prevents timestep bursts and cleanup is deterministic.
- **Exhaustion:** Most meaningful content appears in 1-3 sessions; replay is mainly combo chasing.
- **Primary drop-off:** The same target cadence gives little run-to-run goal variation.
- **Highest-value improvement:** Add two scored round objectives derived from existing bubbles and
  combo facts, not new physics or assets.
- **Minimum completion package:** Objective rotation, result breakdown, and PB comparison. Protect
  Verlet simulation and pointer latency.

### Puzzle Reveal

- **Loop/content/mastery:** Four grids (4×3 through 10×8), two real art pieces, energy pressure,
  speed combos up to 10×, time bonus, random art selection, rewards, and leaderboard submission.
- **UX/mobile/art:** The current grid is touch-friendly and result/retry flow is shared. The audit
  found corrupted literal markup in difficulty buttons and two placeholder image paths returning
  404. This pass uses readable labels and the existing approved Puzzle Reveal cover/hub art.
- **Exhaustion:** Both images are normally seen within 2-4 sessions. Grid mastery extends replay,
  but content discovery ends almost immediately.
- **Primary drop-off:** Two artworks cannot sustain the four-difficulty progression.
- **Highest-value improvement:** Add an approved art pack and no-repeat selection using existing
  image authority; do not fabricate CSS art.
- **Minimum completion package:** 6-8 approved images, pack attribution, no-repeat rotation, and PB
  comparison by difficulty. Protect reveal, energy, and scoring rules.

### Thigh Colosseum

- **Loop/content/mastery:** Endless chase with three obstacle shapes, three power-ups, lives,
  distance stages, escalating speed, score bonuses, and save-on-exit.
- **UX/mobile/controller/art:** Age authority and specialized movement remain intact. The route has
  no authored victory/climax; runs end on life loss.
- **Exhaustion:** Mechanical vocabulary is visible in 1-3 sessions; distance mastery supports
  score chasing afterward.
- **Primary drop-off:** Escalation changes speed and density but never creates a climax.
- **Highest-value improvement:** Add one checkpoint/climax cadence using existing obstacles and
  power-ups, while retaining endless continuation.
- **Minimum completion package:** Milestone staging, clear distance PB, and improved loss/result
  payoff. Protect age gate, runner physics, and reward tuning.

### Dungeon of Desire

- **Loop/content/mastery:** Side-scrolling spell combat, mana/health, procedural rooms, endless
  floors, two enemy types, boss room every five floors, increasing composition, save-on-exit,
  and canonical progression.
- **UX/mobile/controller/art:** Telegraphs and layered canvas rendering are readable, but two enemy
  grammars make deeper floors repeat. No real final victory was found.
- **Exhaustion:** Enemy/content vocabulary is seen in 2-4 sessions; procedural counts extend runs
  more than they extend discovery.
- **Primary drop-off:** Floors grow longer without introducing a new tactical decision.
- **Highest-value improvement:** Add one enemy behavior and one finite ten-floor expedition using
  existing combat assets; keep endless play as a separate option.
- **Minimum completion package:** Third enemy grammar, floor-ten climax/result, and floor PB. Protect
  spell timing, saves, and reward values.

### Maid Café Manager

- **Loop/content/mastery:** Customers arrive with patience, menu orders require taking/preparing/
  serving, tips reward speed, menu breadth and spawn pressure scale by level, and shift state saves.
- **UX/mobile/art:** The runtime previously had a complete result callback and screen but no path
  could ever set `gameOver`; a session therefore ran indefinitely unless exited. This pass adds an
  explicit, accessible **End Shift** action that reaches the existing save/result/retry contract.
- **Exhaustion:** Core systems are visible in 2-4 sessions; randomized orders add modest variance.
- **Primary drop-off:** Before this pass, players could not conclude a successful shift or receive
  a result payoff. Afterward, limited table/menu presentation becomes the main depth ceiling.
- **Highest-value improvement:** Completed here: let players choose when to end and score a shift.
- **Minimum completion package:** Completed end-shift path; later add one authored rush-hour scenario
  using existing tables/menu logic. Protect save authority and avoid inventing reward policy.

## Flagship ranking

| Rank | Game | Readiness | Risk | Product impact | Effort | Flagship potential |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Otaku Beat-em-up | Launch-ready | Medium | Very high | M | Highest: broad appeal, three modes, strong mastery |
| 2 | Petal Storm Rhythm | Launch-ready | Medium | Very high | L | Highest if production audio/charts close |
| 3 | Memory Keeper / Defrag | Launch-ready | Low | High | M | Strongest current art and accessibility closure |
| 4 | Petal Samurai | Launch-ready | Low | High | M | Immediate tactile showcase, mobile-natural |
| 5 | Blossomware | Launch-ready | Medium | High | M | Excellent variety; uneven microgame polish |
| 6 | Bubble Ragdoll | Secondary-ready | Low | Medium | S | Distinctive tactile side activity |
| 7 | Puzzle Reveal | Secondary-ready | Low | Medium | M | Needs approved art volume more than code |
| 8 | Thigh Colosseum | Secondary-ready | Medium | Medium | M | Strong identity, shallow encounter arc |
| 9 | Dungeon of Desire | Vertical slice | Medium | Medium | L | Combat vocabulary needs production depth |
| 10 | Maid Café Manager | Vertical slice | Medium | Medium | L | Management concept needs scenario/art closure |

Recommended launch flagships are **Otaku Beat-em-up, Petal Storm Rhythm, Memory Keeper,
and Petal Samurai**. Keep Blossomware, Bubble Ragdoll, Puzzle Reveal, and Thigh Colosseum
available as distinctive secondary experiences. Do not make major content investments in Dungeon
or Maid Café until their encounter/scenario grammars have a bounded production brief.

## Implementation delta

- Maid Café Manager now exposes its previously unreachable save/result/retry boundary through an
  accessible 44px **End Shift** control. Customer IDs now advance synchronously so rapid spawn
  callbacks cannot create duplicated React keys. No scoring, save, reward, or lifecycle authority
  changed.
- Puzzle Reveal difficulty controls now render clean semantic labels instead of corrupted literal
  HTML/emoji text, and its broken placeholder images now resolve to existing approved repository
  art. Grid sizes and difficulty behavior are unchanged.
- No schema, provider, economy, achievement-ID, platform, or production-data change was made.

## Deferred production work

- Authored audio/charts, approved puzzle art packs, boss/enemy content, scenario writing, and bespoke
  visual production require dedicated content phases rather than placeholders.
- Durable PB/rank presentation should reuse current leaderboard/save authorities after per-game
  product specifications are approved.
- Home Lighthouse performance/CLS debt is unrelated to game product completion and remains separate.
