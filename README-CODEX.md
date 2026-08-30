# Otaku-mori Mori Visual Assets v1

This package contains only the post-reference visual work grounded in the user's approved Otaku-mori references.

Earlier rejected pastel/cartoon icons and the first rejected over-ornate inventory-object experiments are intentionally excluded.

## Extract
Attach the ZIP to a fresh Codex session. Copy the CONTENTS of the ZIP to the repository root. Do not create a nested package directory.

## Contents
- `public/assets/ui/mori/feature/`: optimized transparent WebP feature assets for runtime use after in-context QA.
- `docs/design/references/site-visual-authority/approved-user-references/`: authoritative user-supplied visual references.
- `docs/design/references/site-visual-authority/produced-source/`: lossless PNG masters for generated candidates.
- `docs/design/references/avatar/outfits/`: Sakura Nightwarden masculine/feminine outfit concepts, reference only.
- `docs/design/visual-authority/asset-manifest.json`: placement and runtime policies.
- `docs/design/visual-authority/missing-assets.json`: explicit remaining gaps.
- `docs/design/visual-authority/avatar-outfit-brief.md`: 3D outfit translation rules.
- `codex/IMPLEMENTATION_PROMPT.md`: copy-ready implementation checkpoint.

## Runtime standards
- self-host assets only
- preserve alpha
- WebP runtime copies are bounded/compressed
- lazy load by default
- no global preloading
- fixed dimensions/aspect ratio to prevent CLS
- semantic text must not depend on raster art
- decorative images use empty alt/aria-hidden where appropriate
- animate wrappers, not raster frame sequences
- no unbounded requestAnimationFrame loops
- respect `prefers-reduced-motion`
- do not use large feature illustrations as 16–24px navbar glyphs
