import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import sharp from 'sharp'; // npm i sharp
import AchievementBadge from '@/components/graphics/AchievementBadge';
import FramedBadge from '@/components/graphics/FramedBadge';

type Cluster = { prefix: string; items: string[] };
type Tier = { key: string; label: string };
type Patterns = { clusters: Cluster[]; tiers: Tier[] };

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'assets', 'achievements');
const IMG_DIR = path.join(ROOT, 'public', 'assets', 'images'); // where your tier PNGs live

// Parse command line arguments
const args = process.argv.slice(2);
const emitPng = args.includes('--png');
const emitFrames = args.includes('--frame');

function loadPatterns(): Patterns {
  const p = path.join(ROOT, 'content', 'achievements.patterns.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function makeLabel(prefix: string, item: string) {
  return `${prefix.replace(/_/g, ' ')} — ${item.replace(/_/g, ' ')}`.replace(/\b\w/g, (m) =>
    m.toUpperCase(),
  );
}

function hueFor(prefix: string) {
  // keep in your brand range; small variance per cluster
  const base = 320; // purple-pink
  const hash = [...prefix].reduce((a, c) => a + c.charCodeAt(0), 0);
  return base + (hash % 20) - 10; // +/- 10 deg
}

async function writeSvgPng(
  filenameBase: string,
  label: string,
  keyId: string,
  hue: number,
  tier?: number,
) {
  // Generate base badge
  const badgeEl = React.createElement(AchievementBadge, {
    label,
    keyId,
    hue,
    className: 'w-[96px] h-[96px]',
  });
  const badgeSvg = `<?xml version="1.0" encoding="UTF-8"?>${renderToStaticMarkup(badgeEl as any)}`;

  // Write badge SVG
  const badgeSvgPath = path.join(OUT_DIR, `${filenameBase}.svg`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(badgeSvgPath, badgeSvg, 'utf-8');

  // Generate framed version if tier provided and frames requested
  if (tier && emitFrames) {
    const framedEl = React.createElement(FramedBadge, {
      tier,
      badgeKey: keyId,
      label,
      size: 96,
      animate: false, // No animation in static exports
    });
    const framedSvg = `<?xml version="1.0" encoding="UTF-8"?>${renderToStaticMarkup(framedEl as any)}`;

    // Write framed SVG
    const framedSvgPath = path.join(OUT_DIR, `${filenameBase}-framed.svg`);
    fs.writeFileSync(framedSvgPath, framedSvg, 'utf-8');
  }

  // PNG export if requested
  if (emitPng) {
    const pngPath = path.join(OUT_DIR, `${filenameBase}.png`);
    try {
      const buf = await sharp(Buffer.from(badgeSvg)).resize(96, 96).png().toBuffer();
      fs.writeFileSync(pngPath, buf);
    } catch (e) {
      console.warn('[gen] PNG export skipped for', filenameBase);
    }

    // Framed PNG if tier provided and frames requested
    if (tier && emitFrames) {
      const framedPngPath = path.join(OUT_DIR, `${filenameBase}-framed.png`);
      try {
        const framedEl = React.createElement(FramedBadge, {
          tier,
          badgeKey: keyId,
          label,
          size: 96,
          animate: false,
        });
        const framedSvg = `<?xml version="1.0" encoding="UTF-8"?>${renderToStaticMarkup(framedEl as any)}`;
        const buf = await sharp(Buffer.from(framedSvg)).resize(96, 96).png().toBuffer();
        fs.writeFileSync(framedPngPath, buf);
      } catch (e) {
        console.warn('[gen] Framed PNG export skipped for', filenameBase);
      }
    }
  }
}

async function main() {
  const patterns = loadPatterns();

  // 1) Generate cluster achievements
  for (const cl of patterns.clusters) {
    for (const item of cl.items) {
      const keyId = `${cl.prefix}:${item}`;
      const fileBase = keyId.replace(/[:]/g, '_');
      const label = makeLabel(cl.prefix, item);
      const hue = hueFor(cl.prefix);
      await writeSvgPng(fileBase, label, keyId, hue);
      // '[gen]', keyId
    }
  }

  // 2) Generate tier badges:
  // If you already have PNGs in /public/assets/images/tier-*.png, we still generate SVGs as vector sources,
  // but keep your PNGs in place for continuity.
  for (const t of patterns.tiers) {
    const fileBase = t.key;
    const label = t.label;
    const tierNum = parseInt(t.key.match(/\d+/)?.[0] || '1', 10);
    const hue = 325 + tierNum * 2;
    const existingPng = path.join(IMG_DIR, `${t.key}.png`);

    // Generate with tier frame
    await writeSvgPng(fileBase, label, `tier:${t.key}`, hue, tierNum);

    if (fs.existsSync(existingPng)) {
      // copy existing PNG into achievements folder for consistency if desired
      const dest = path.join(OUT_DIR, `${t.key}.png`);
      if (!fs.existsSync(dest)) fs.copyFileSync(existingPng, dest);
      // '[gen] preserved existing tier PNG:', t.key
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
