import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

const ACTIVE_FUNNEL_FILES = [
  'app/components/hero/HeroContent.tsx',
  'app/(site)/shop/page.tsx',
  'app/(site)/shop/product/[id]/ProductClient.tsx',
  'app/(site)/shop/cart/page.tsx',
  'app/(site)/shop/checkout/page.tsx',
  'app/components/shop/BuyReadyShopCatalog.tsx',
];

const LEGACY_FUNNEL_PATTERNS = [
  /href=["']\/cart["']/,
  /href=["']\/checkout["']/,
  /href=["']\/products?\/[^"']*["']/,
  /router\.push\(["']\/cart["']\)/,
  /router\.push\(["']\/checkout["']\)/,
  /router\.push\(["']\/products?\/[^"']*["']\)/,
];

describe('core funnel route governance', () => {
  it('keeps active funnel surfaces on canonical path helpers instead of legacy aliases', () => {
    const offenders: string[] = [];

    for (const file of ACTIVE_FUNNEL_FILES) {
      const absolutePath = path.join(repoRoot, file);
      const source = fs.readFileSync(absolutePath, 'utf8');
      for (const pattern of LEGACY_FUNNEL_PATTERNS) {
        if (pattern.test(source)) offenders.push(`${file} matches ${pattern}`);
      }
    }

    expect(offenders).toEqual([]);
  });
});
