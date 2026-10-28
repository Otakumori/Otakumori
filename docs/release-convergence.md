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

Home Flagship Closure remains in Draft PR #114 at the owner-review gate with its six-state portrait
family integrated for review at `acc131fddd5db5ea5d8e8dccf3e8b51563639861`. Production Asset
Authority documentation is isolated in Draft PR #115; registry implementation remains stacked so
neither owner-gated Home work nor unmerged authority documents are silently treated as canonical
`main`.

## Phase queue

| Priority | Phase                                      | State                  |
| -------: | ------------------------------------------ | ---------------------- |
|        1 | Admin Operations Closure                   | Closed                 |
|        2 | Home Flagship Closure                      | Owner review — PR #114 |
|        3 | Production Asset Authority                 | Active — stacked Draft |
|        4 | Avatar Creator Production Closure          | Pending                |
|        5 | Commander Integration Closure              | Pending                |
|        6 | Flagship Game Presentation/Content Closure | Pending                |
|        7 | Site-wide Experience Uniformity            | Pending                |
|        8 | Loading/Empty/Error State Closure          | Pending                |
|        9 | Communications + Support                   | Pending                |
|       10 | Privacy / UGC / Account Lifecycle          | Pending                |
|       11 | SEO / Analytics                            | Pending                |
|       12 | Security / Performance / Accessibility     | Pending                |
|       13 | Production Environment / Backup / Rollback | Pending                |
|       14 | Launch Content                             | Pending                |
|       15 | Full Launch Rehearsal                      | Pending                |
|       16 | Owner Acceptance                           | Pending                |
|       17 | Production Candidate Freeze                | Pending                |
|       18 | Final Launch Certification                 | Pending                |

Production Asset Authority implementation checkpoint:

- implementation commit: `450c831f4509179480cd9219e05ac8dc4726d594`;
- completed gate: canonical state model, source/runtime checksum validation, and explicit legacy-manifest reconciliation;
- completed gate: the registry now records all six portrait artifacts as exact-head pending sources,
  distinguishes geometry approval from final visual approval, and runs its validator in CI;
- remaining blocker: final Home owner visual review and merge authorization for stacked PRs #115/#116;
- next dependency: merge #114, #115, then #116 in that order after their respective owner gates.

## Tier-0 quality ledger

`VERIFIED` requires phase evidence. `OWNER REVIEW` cannot be cleared by automation. `ASSET WORK` identifies missing production media rather than a code defect. Untested dimensions remain `OPEN`; they are never averaged into a pass.

| Surface                | Function | Visual       | Assets     | Interaction | Responsive | Performance | Accessibility | Persistence | Failure states | Integration | Security | Owner review |
| ---------------------- | -------- | ------------ | ---------- | ----------- | ---------- | ----------- | ------------- | ----------- | -------------- | ----------- | -------- | ------------ |
| Home                   | OPEN     | OWNER REVIEW | OPEN       | OPEN        | OPEN       | OPEN        | OPEN          | N/A         | OPEN           | OPEN        | OPEN     | REQUIRED     |
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
