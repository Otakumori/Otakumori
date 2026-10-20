# Otaku-mori Release Convergence

This ledger records immutable merged baselines, the active bounded phase, and independent readiness dimensions for launch-critical surfaces. A branch or Draft PR is not a closed phase. A critical `OPEN`, `BLOCKED`, or `OWNER REVIEW` dimension keeps its surface incomplete.

## Immutable baselines

| Phase                                 | Merge SHA                                  | State  |
| ------------------------------------- | ------------------------------------------ | ------ |
| Shared Game Platform Closure v1       | `a935fa7171559bf03eb2fed36285db34204395f0` | Closed |
| Game Product Completion Audit v1      | `6c6f0912e1182d7274dd04dcfe502343eb89aa72` | Closed |
| Otaku Beat-em-up Flagship Gameplay v1 | `1e9bac75113acb95e9dd485ef02e3eaf050b2062` | Closed |
| Commerce Production Closure v1        | `47603b081a33f558d00dccce957f80a8c4a4c36f` | Closed |
| Finance + Tax Operations v1           | `d6c4863bb133ca11b71bb48cb003472a80611db5` | Closed |
| Admin Operations Closure v1           | `6620e9cc4f12ae54c63c57da6dc1cbf79b532c5c` | Closed |

## Active phase

Home Flagship Closure is technically ready from Admin Operations Closure v1 on
`codex/home-flagship-closure`. Its Draft PR remains gated by independent asset work and owner visual
review; it is not approved or merged.

## Phase queue

| Priority | Phase                                      | State                                  |
| -------: | ------------------------------------------ | -------------------------------------- |
|        1 | Admin Operations Closure                   | Closed — v1                            |
|        2 | Home Flagship Closure                      | Owner review — technical gate complete |
|        3 | Production Asset Authority                 | Pending                                |
|        4 | Avatar Creator Production Closure          | Pending                                |
|        5 | Commander Integration Closure              | Pending                                |
|        6 | Flagship Game Presentation/Content Closure | Pending                                |
|        7 | Site-wide Experience Uniformity            | Pending                                |
|        8 | Loading/Empty/Error State Closure          | Pending                                |
|        9 | Communications + Support                   | Pending                                |
|       10 | Privacy / UGC / Account Lifecycle          | Pending                                |
|       11 | SEO / Analytics                            | Pending                                |
|       12 | Security / Performance / Accessibility     | Pending                                |
|       13 | Production Environment / Backup / Rollback | Pending                                |
|       14 | Launch Content                             | Pending                                |
|       15 | Full Launch Rehearsal                      | Pending                                |
|       16 | Owner Acceptance                           | Pending                                |
|       17 | Production Candidate Freeze                | Pending                                |
|       18 | Final Launch Certification                 | Pending                                |

## Tier-0 quality ledger

`VERIFIED` requires phase evidence. `OWNER REVIEW` cannot be cleared by automation. `ASSET WORK` identifies missing production media rather than a code defect. Untested dimensions remain `OPEN`; they are never averaged into a pass.

| Surface                | Function | Visual       | Assets     | Interaction | Responsive | Performance | Accessibility | Persistence | Failure states | Integration | Security | Owner review |
| ---------------------- | -------- | ------------ | ---------- | ----------- | ---------- | ----------- | ------------- | ----------- | -------------- | ----------- | -------- | ------------ |
| Home                   | VERIFIED | OWNER REVIEW | ASSET WORK | VERIFIED    | VERIFIED   | VERIFIED    | VERIFIED      | VERIFIED    | VERIFIED       | VERIFIED    | N/A      | REQUIRED     |
| Avatar Creator         | OPEN     | OWNER REVIEW | OPEN       | OPEN        | OPEN       | OPEN        | OPEN          | OPEN        | OPEN           | OPEN        | OPEN     | REQUIRED     |
| Shop / PDP             | OPEN     | OPEN         | OPEN       | OPEN        | OPEN       | OPEN        | OPEN          | OPEN        | OPEN           | OPEN        | OPEN     | REQUIRED     |
| Commander              | OPEN     | OPEN         | OPEN       | OPEN        | OPEN       | OPEN        | OPEN          | OPEN        | OPEN           | OPEN        | OPEN     | REQUIRED     |
| Game Hub / Threshold   | VERIFIED | OPEN         | OPEN       | VERIFIED    | OPEN       | OPEN        | OPEN          | N/A         | VERIFIED       | VERIFIED    | VERIFIED | REQUIRED     |
| Otaku Beat-em-up       | VERIFIED | ASSET WORK   | ASSET WORK | VERIFIED    | VERIFIED   | OPEN        | OPEN          | VERIFIED    | VERIFIED       | VERIFIED    | VERIFIED | REQUIRED     |
| Memory Keeper / Defrag | VERIFIED | OPEN         | OPEN       | VERIFIED    | OPEN       | OPEN        | OPEN          | VERIFIED    | VERIFIED       | VERIFIED    | VERIFIED | REQUIRED     |
| Petal Samurai          | VERIFIED | OPEN         | OPEN       | VERIFIED    | OPEN       | OPEN        | OPEN          | VERIFIED    | VERIFIED       | VERIFIED    | VERIFIED | REQUIRED     |
| Petal Storm Rhythm     | VERIFIED | ASSET WORK   | ASSET WORK | VERIFIED    | OPEN       | OPEN        | OPEN          | VERIFIED    | VERIFIED       | VERIFIED    | VERIFIED | REQUIRED     |

## Authority and owner gates

- Closed commerce, finance, and shared-game authorities remain immutable unless a concrete regression is proven.
- Git branches do not imply Neon branches. Default Neon action is `NONE`.
- Production charges, refunds, provider orders, credential changes, Stripe Tax activation, tax registrations/filings/payments, legal determinations, and final launch remain owner-controlled.
- Missing fighter/enemy art, combat audio, authored rhythm audio/charts, or other approved production media is asset work. CSS or placeholder media cannot close it.
