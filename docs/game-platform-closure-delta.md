# Shared Game Platform Closure Delta

Baseline: Controller Support Foundation v1 (`9aba8b78d7089c700dec0663f0dd4af58601a9e4`).

| Game | Lifecycle / pause / exit | Result and progression | Save | Input / controller | Cleanup | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Bubble Ragdoll | Shared | Final-run canonical progression | None | Physics pointer/touch; menus-only controller | Shared adapter owns simulation teardown | PLATFORM COMPLETE — SPECIALIZED INPUT |
| Petal Storm Rhythm | Shared outer session; rhythm clock remains game-owned | Once-only final-run progression and leaderboard handoff | None | Rhythm-owned timing; partial gameplay controller | Page-owned RAF registered with shared cleanup | PLATFORM COMPLETE — SPECIALIZED INPUT |
| Maid Café Manager | Shared outer session and pause/exit | Shared result boundary; no persistent reward policy | Existing SaveSystem | Pointer management; menus-only controller | Simulation interval and deferred callbacks are disposed | PLATFORM COMPLETE — SPECIALIZED INPUT |
| Memory Keeper / Defrag | Shared | Completion and semantic achievement facts consumed once by canonical progression; no speculative achievement IDs | Existing SaveSystem | Board pointer/keyboard; controller unsupported | Existing runtime cleanup | PLATFORM COMPLETE — SPECIALIZED INPUT |
| Dungeon of Desire | Shared | Once-only final-run canonical progression using existing tuning | Existing SaveSystem | Game-owned input; controller unsupported | Existing runtime cleanup | PLATFORM COMPLETE |
| Thigh Colosseum | Shared | Once-only final-run canonical progression using existing tuning; score milestones remain non-economic | Existing SaveSystem | Game-owned input; controller unsupported | Existing runtime cleanup | PLATFORM COMPLETE |

The Bubble internal ID remains `bubble-girl` for persistence compatibility while the canonical player-facing route is `/mini-games/bubble-ragdoll`. Memory achievement facts remain metadata until matching canonical achievement IDs exist. Maid Café declares no Petal, leaderboard, achievement, unlock, or avatar capability without runtime authority.
