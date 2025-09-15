Mini‑Games Icon Spec

Goal: Crisp, monochrome, consistent game icons that work at small sizes and fit the console card style.

Canvas & Export

- Artboard: 96×96 px
- Padding: 8 px minimum safe area around the graphic
- Background: Transparent (no background rectangle)
- Color: Monochrome #E3E3E3 (or pure white #FFFFFF) — the card renders on dark backgrounds
- Strokes: 2 px (scale‑independent strokes, rounded caps/joins preferred)
- Fills: Avoid complex gradients; keep shapes simple for legibility at ~20 px render
- Export: SVG (preferred). PNG fallback allowed (96×96) if necessary
- Naming: `public/assets/games/<slug>.svg` matching the game slug used in tiles

Figma Export Hints

- Frame/Component size: 96×96 px
- Set stroke to 2 px, round joins, round caps
- Expand stroke only if necessary (prefer strokes so we can recolor if needed)
- Ensure no clipping masks; avoid embedded rasters
- Export → SVG, “Outline text” off, “Simplify stroke” off, “Include id attribute” off

Visual Guidance

- Simplicity: One clear metaphor per game (e.g., petal, grid, note, sword)
- Negative space: Leave breathing room; icons must read at 20–24 px
- Balance: Centered, visually balanced; no tiny details

Integration

- The console tries these paths for each slug: `.svg`, `.png`, `.jpg`
- If no file is found, the UI falls back to a Material Symbol
- To test what’s missing or generate placeholders:

```bash
npm run icons:validate         # report missing icons
npm run icons:placeholders     # generate simple SVG placeholders (replace later)
```
