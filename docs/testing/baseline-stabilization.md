# Baseline Test Stabilization

Evidence captured on 2026-06-08 from `test/baseline-stabilization`, based on
`e6dd4e43e45b0088d1892ea5270ee146d4a37443`.

This lane improves diagnostic accuracy without changing production behavior,
authorization, provider controls, database state, or required release gates.

## Results

| Lane | Before | After | Classification | Owner lane |
| --- | --- | --- | --- | --- |
| Broad Vitest | 75 failed, 205 passed, 280 total | 65 failed, 225 passed, 290 total | Stale harnesses reduced; remaining failures are isolated below | Feature-specific test repair |
| Mini-game QA | 9 route-discovery failures | 3 games pass; 6 games fail avatar integration; 10 warnings | Route-group harness fixed; remaining failures are application gaps | Mini-game avatar integration |
| Playwright smoke | Cascading missing-env and page failures | One `BLOCKED_BY_ENV` capability failure before tests run | Clerk local-host harness unavailable | Clerk browser test harness |
| Accessibility | Could report failures without proving the app route loaded | One `BLOCKED_BY_ENV` capability failure before scans run | Clerk local-host harness unavailable | Clerk browser test harness |
| Lighthouse | Could score a redirected or provider error page | Browser provenance check blocks scoring when the app is not reached | Clerk local-host harness unavailable | Clerk browser test harness |
| Production critical audit | Zero critical findings | Zero critical findings | Required gate remains unchanged and passing | Security gate |
| Full dependency audit | 195 findings | 195 findings | Tooling and development dependency debt | `security/dependency-remediation` |

## Fixed Baseline Problems

- Mini-game discovery now resolves the `(games)` route group while preserving
  public URLs.
- Shared Vitest setup supports current request headers, methods, URLs, and JSON
  bodies.
- Cart, Printify containment, Clerk integration, and interactive petal tests
  now assert current route and component contracts.
- Infrastructure-free browser smoke no longer owns database catalog coverage.
  The catalog assertion remains explicitly pending until an ephemeral
  PostgreSQL integration lane exists.
- Browser suites run a Chromium capability preflight. Clerk redirects,
  invalid-host responses, external redirects, and failed app boot produce one
  sanitized `BLOCKED_BY_ENV` result instead of cascading selector failures.
- Lighthouse runs only after a Chromium probe proves that the final target is
  the local application.

## Remaining Unit-Test Debt

| Family | Classification | Reason | Recommended follow-up |
| --- | --- | --- | --- |
| Payment flows | Missing fixture/mock | Eleven failures use stale module and payment fixtures | Repair in a payment test-harness PR |
| Adult catalog and purchase | Stale expectation and missing fixture | Seventeen failures do not match current route dependencies | Repair in an adult-commerce test PR |
| Avatar validation/spec | Application regression | Two failures identify asset/default-spec mismatches | Confirm intended avatar contract before changing code |
| Avatar export/save APIs | Auth harness and stale contract | Thirty-five failures span request auth, status, export, and save behavior | Create one avatar API contract PR |
| `safeFetch` and telemetry | Harness/configuration | Suites fail during environment/module setup before assertions | Centralize environment mocks in a utility PR |

All test families changed in this PR pass.

## Mini-Game Follow-up

The route discovery defect masked six real integration gaps:

- `petal-samurai`
- `memory-match`
- `bubble-girl`
- `blossomware`
- `dungeon-of-desire`
- `thigh-coliseum`

These games do not currently expose the avatar integration required by the QA
contract. The validator remains strict; runtime feature work is deferred.

## Browser Capability Contract

- Smoke tests prove application boot, rendering, and routing without external
  services.
- Integration tests prove database-backed behavior with explicit fixtures.
- Provider diagnostic and write routes remain protected and are never used as
  public smoke targets.
- Clerk-dependent and signed-in suites require a supported local test instance
  or approved test harness. Missing capability is `BLOCKED_BY_ENV`, not a
  passing result.
- Accessibility and Lighthouse results are valid only after Chromium proves it
  reached the intended local application.

## Dependency Inventory

The required command `pnpm audit --prod --audit-level critical` reports zero
critical production findings and exits successfully.

The full dependency graph reports 9 low, 86 moderate, 95 high, and 5 critical
advisories. Critical development/tooling chains involve `basic-ftp`,
`handlebars`, `protobufjs`, and two `vitest` advisory paths. No dependency or
lockfile change belongs in this test-harness lane; remediation remains assigned
to `security/dependency-remediation`.

## Promotion Recommendation

No advisory lane should become required from a single run.

Mini-game QA is the first candidate after the six avatar integration gaps are
resolved and three consecutive pull requests run green. Broad Vitest,
Playwright, accessibility, and Lighthouse remain advisory until each has three
stable runs, no environment-dependent false positives, and documented runtime
requirements.

## Safety

- PR #31 provider-write lockdown and required release gates are unchanged.
- Production services were not accessed or modified.
- No migrations, database writes, payments, provider writes, fulfillment
  actions, or emails were performed.
- No secrets were added or exposed.
