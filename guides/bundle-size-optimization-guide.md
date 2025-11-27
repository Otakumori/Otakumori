# Guide #11: Bundle Size Optimization

## Overview

Analyze and optimize JavaScript bundle sizes to meet performance budgets.

## Performance Budgets

### Core Web Vitals Targets

- **LCP**: < 2.5 seconds
- **FID/INP**: < 100ms
- **CLS**: < 0.1

### Bundle Size Limits

- **Main bundle**: ≤ 230KB gzipped
- **Route chunks**: ≤ 150KB gzipped each
- **Vendor chunks**: ≤ 200KB gzipped
- **Total initial load**: ≤ 500KB gzipped

## Analysis Tools

### 1. Next.js Bundle Analyzer

**Setup**:

```bash
npm install --save-dev @next/bundle-analyzer
```

**next.config.js**:

```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... existing config
});
```

**Run**:

```bash
ANALYZE=true npm run build
```

### 2. Webpack Bundle Analyzer

**Script**: `scripts/analyze-bundle.mjs`

```javascript
#!/usr/bin/env node
/**
 * Analyze bundle sizes and identify optimization opportunities
 * Run: node scripts/analyze-bundle.mjs
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

// Run Next.js build with analysis
console.log('🔍 Analyzing bundle sizes...\n');

try {
  execSync('ANALYZE=true npm run build', { stdio: 'inherit' });
  console.log('\n✅ Bundle analysis complete!');
  console.log('📊 Check .next/analyze/ for detailed reports');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
```

## Optimization Strategies

### 1. Code Splitting

**Dynamic Imports**:

```typescript
// Before
import HeavyComponent from './HeavyComponent';

// After
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // If not needed for SSR
});
```

### 2. Tree Shaking

**Ensure ESM imports**:

```typescript
// Before
import _ from 'lodash';
const result = _.debounce(fn, 300);

// After
import debounce from 'lodash/debounce';
const result = debounce(fn, 300);
```

### 3. Image Optimization

**Use next/image**:

```typescript
// Before
<img src="/image.jpg" />

// After
import Image from 'next/image';
<Image src="/image.jpg" width={800} height={600} alt="Description" />
```

### 4. Remove Unused Dependencies

**Script**: `scripts/find-unused-deps.mjs`

```javascript
#!/usr/bin/env node
/**
 * Find potentially unused dependencies
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const deps = Object.keys(packageJson.dependencies || {});
const devDeps = Object.keys(packageJson.devDependencies || {});

console.log('📦 Checking for unused dependencies...\n');

// Use depcheck if available
try {
  const result = execSync('npx depcheck --json', { encoding: 'utf8' });
  const unused = JSON.parse(result);
  
  if (unused.dependencies?.length > 0) {
    console.log('⚠️  Potentially unused dependencies:');
    unused.dependencies.forEach(dep => console.log(`  - ${dep}`));
  }
  
  if (unused.devDependencies?.length > 0) {
    console.log('\n⚠️  Potentially unused devDependencies:');
    unused.devDependencies.forEach(dep => console.log(`  - ${dep}`));
  }
} catch (error) {
  console.log('⚠️  Install depcheck: npm install -g depcheck');
}
```

## Execution Steps

1. **Run bundle analysis**:
   ```bash
   node scripts/analyze-bundle.mjs
   ```

2. **Review report** - Identify large chunks

3. **Apply optimizations**:
   - Add dynamic imports
   - Split large components
   - Optimize images
   - Remove unused code

4. **Re-analyze** - Verify improvements

## Expected Results

- ✅ Bundle sizes within budget
- ✅ Faster page loads
- ✅ Better Core Web Vitals scores
- ✅ Improved user experience

