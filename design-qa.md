# Homepage Design QA

## Result

**combined-master implementation locally certified for homepage visual shell**

This pass pivots the homepage from separately aligned surface/root artwork to six approved combined
world masters. The new runtime model uses one precomposed environmental image per time period, with
semantic hero/footer UI and Petal systems overlaid inside that authored world.

The prior deployed Preview evidence remains historical only. It verified an older split-world Preview
and does not certify the current local combined-master implementation.

## Source Truth

- Approved combined masters:
  `docs/design/references/home-world-wide-approved/om-home-world-*.png`
- Runtime combined-world copies:
  `public/assets/home/world/combined/om-home-world-*.png`
- Measured approved-master geometry: 1325 x 1187 for all six files.
- Petal sprite atlas: `public/assets/images/petal_sprite.png` (874 x 668, 4 x 3 frames)
- Visual contracts:
  - `docs/design/homepage-source-contract.md`
  - `docs/design/site-visual-contract.md`

The older `public/assets/home/world/*.png`, `public/assets/home/world/wide/*.png`, and
`public/assets/home/root-footer/root-underground-wide.png` assets remain in the repository as legacy
runtime/reference material, but they are no longer the homepage source of truth.

## Combined Architecture

- Homepage time bucket maps to exactly one combined world image.
- Surface and underground are precomposed in source art.
- Separate root/footer image alignment and seam tie-point runtime checks are superseded.
- Footer content is semantic HTML overlaid in the combined underground/cavern region.
- The homepage world is scrollable; the full image is not compressed into 100svh.
- The Petal atlas remains a separate interactive layer because petals are both ambient and
  collectible.

## Browser QA Status

Current local combined-master browser QA was completed with a Playwright fallback against the local
dev server. The in-app browser was not usable for localhost/LAN certification in this environment, so
the fallback used process-scoped local visual-QA auth only:

- `OTM_VISUAL_QA_AUTH=1`
- `NEXT_PUBLIC_OTM_VISUAL_QA_AUTH_STATE=signed-out`
- no `.env` or `.env.local` file
- no real Clerk, Vercel, provider, database, or webhook credential

Homepage viewport matrix passed for all 11 required viewports:

- 360 x 740
- 390 x 844
- 430 x 932
- 768 x 1024
- 820 x 1180
- 1024 x 768
- 1280 x 720
- 1440 x 900
- 1536 x 864
- 1728 x 992
- 1920 x 1080

Each viewport returned HTTP 200, rendered `mori-home-scene-shell`, rendered `mori-scene-surface`,
rendered the collectible petal layer, and produced no relevant page errors after filtering normal
development-only React/Next informational messages.

Additional local browser evidence:

- Signed-in visual-QA homepage state: HTTP 200, same homepage shell, no app error.
- Reduced-motion homepage state: HTTP 200, same homepage shell, no app error.
- Collectible petal layer: 7 visible controls at 1280 x 720.
- Keyboard petal activation: passed through `Enter` on the first petal control.
- Forced pointer activation probe: landed on an animated petal control without runtime errors.
- Normal Playwright pointer click was inconclusive because the petal drift animation moved the small
  target during hit testing.
- Representative interior visual shell passed for `/shop` and `/shop/cart` at 390 x 844 and
  1280 x 720.

Non-certified local browser boundaries:

- `/settings` requires a real datasource in this worktree and returned a local Prisma constructor
  error when no database URL was provided.
- `/account` redirects to the hosted Clerk account flow and is not certifiable in the synthetic
  visual-QA harness.
- `/profile/petals` redirects to `/sign-in` in this local harness.
- `/profile` renders the interior shell for both visual-QA signed-out and signed-in states. Signed-out
  shows the bounded sign-in boundary; signed-in shows deterministic visual-QA owner content without a
  server/client auth mismatch.

Implementation-level checks passed on the current uncommitted source:

- Focused Vitest: 9 files, 34 tests passed.
- Typecheck: passed.
- Lint: passed with the existing 181 warnings and 0 errors.
- Security scan: passed with redacted findings only and 0 blocking findings.
- Documentation security check: passed with 0 blocking findings.
- Local production build: passed with process-scoped synthetic placeholders only, no env file
  creation, 341 generated static pages, and middleware emitted. The build retained existing
  dependency warnings from Sentry/OpenTelemetry dynamic instrumentation and stale Browserslist data.
- `git diff --check`: passed with line-ending warnings only.

The previous local screenshot evidence for the pre-combined implementation was intentionally excluded
from the release diff; it remains historical context only and is not current certification evidence.

## Auth Continuity

- The homepage remains one code path through `HomeSceneShell`.
- Auth may change account controls and persisted Petal/account state only.
- Same-origin local/Preview auth behavior remains covered by
  `__tests__/auth/clerk-provider-wrapper.test.tsx`.
- Real-provider signed-in/signed-out browser parity has not been re-certified after the
  combined-master pivot. Local browser QA used the process-scoped visual-QA adapter only.

## Interaction And Accessibility

- Decorative petals remain visually native to the sakura world and non-interactive.
- Collectible petals remain semantic controls using the existing Petal context/persistence.
- Reduced motion keeps collection available while lowering ambient motion.

## Remaining Not Certified Gates

- Real Clerk signed-in/signed-out browser parity.
- Database-backed settings/account routes in a local browser.
- Hosted Clerk account flow inside visual-QA harness.
- Normal non-forced pointer click on the small animated petal target.
