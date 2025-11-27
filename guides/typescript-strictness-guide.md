# Guide #12: TypeScript Strictness Improvements

## Overview

Eliminate `any` types and improve type safety throughout the codebase.

## Current Issues

### Found `any` Types

- `app/mini-games/_shared/EnhancedHitFeedback.tsx` - Canvas ref types
- `app/mini-games/_shared/PremiumParticleSystem.tsx` - Canvas ref types
- `app/lib/games.ts` - Dynamic game key type
- `app/lib/enhancements/optimization.ts` - Generic function types (acceptable)

## Strategy

### 1. Replace `any` with Proper Types

**Pattern**:

```typescript
// Before
const data: any = fetchData();

// After
interface DataType {
  id: string;
  name: string;
}
const data: DataType = fetchData();
```

### 2. Use Type Assertions Sparingly

**Pattern**:

```typescript
// Before
const value = data as any;

// After
const value = data as SpecificType;

// OR better: fix the type upstream
```

### 3. Fix Canvas Ref Types

**Pattern**:

```typescript
// Before
(canvasRef.current as any).addHitEffect = ...;

// After
interface CanvasWithMethods extends HTMLCanvasElement {
  addHitEffect: (effect: HitEffect) => void;
  shake: (intensity: number, duration: number, frequency: number) => void;
}

const canvas = canvasRef.current as CanvasWithMethods;
canvas.addHitEffect(effect);
```

## Execution Script

**File**: `scripts/find-any-types.mjs`

```javascript
#!/usr/bin/env node
/**
 * Find all 'any' type usages
 * Run: node scripts/find-any-types.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', 'types'];

function findTypeScriptFiles(dir, fileList = []) {
  if (!existsSync(dir)) return fileList;
  
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    try {
      const stat = statSync(filePath);
      if (stat.isDirectory() && !IGNORE_DIRS.includes(file)) {
        findTypeScriptFiles(filePath, fileList);
      } else if (stat.isFile() && /\.(ts|tsx)$/.test(file)) {
        fileList.push(filePath);
      }
    } catch (e) {
      // Skip
    }
  });
  return fileList;
}

function findAnyTypes(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const anyUsages = [];
  
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    // Match various any patterns
    const patterns = [
      /:\s*any\b/g,           // : any
      /as\s+any\b/g,          // as any
      /any\[/g,               // any[]
      /any\s*\|/g,            // any |
      /any\s*&/g,             // any &
      /<any>/g,               // <any>
      /Record<string,\s*any>/g, // Record<string, any>
      /Promise<any>/g,        // Promise<any>
    ];
    
    patterns.forEach(pattern => {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        anyUsages.push({
          file: filePath,
          line: index + 1,
          column: match.index,
          pattern: match[0],
          context: line.trim(),
        });
      }
    });
  });
  
  return anyUsages;
}

// Main execution
const files = findTypeScriptFiles('./app');
const allAnyTypes = [];
files.forEach(file => {
  const usages = findAnyTypes(file);
  allAnyTypes.push(...usages);
});

// Group by file
const byFile = {};
allAnyTypes.forEach(usage => {
  if (!byFile[usage.file]) {
    byFile[usage.file] = [];
  }
  byFile[usage.file].push(usage);
});

console.log('📊 TypeScript `any` Type Audit\n');
console.log(`Total \`any\` usages: ${allAnyTypes.length}\n`);
console.log(`Files with \`any\`: ${Object.keys(byFile).length}\n`);

console.log('📋 Files with `any` types:\n');
Object.entries(byFile)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([file, usages]) => {
    console.log(`${file}: ${usages.length} usages`);
    usages.slice(0, 3).forEach(usage => {
      console.log(`  Line ${usage.line}: ${usage.pattern}`);
      console.log(`    ${usage.context}`);
    });
    if (usages.length > 3) {
      console.log(`  ... and ${usages.length - 3} more`);
    }
    console.log();
  });

// Save report
import { writeFileSync, mkdirSync } from 'fs';

if (!existsSync('reports')) {
  mkdirSync('reports', { recursive: true });
}

writeFileSync(
  'reports/any-types-audit.json',
  JSON.stringify({ total: allAnyTypes.length, byFile }, null, 2)
);

console.log('📄 Full report: reports/any-types-audit.json');
```

## Priority Fixes

1. **High Priority**:
   - Canvas ref types (game components)
   - API response types
   - Database query types

2. **Medium Priority**:
   - Component prop types
   - Hook return types
   - Utility function types

3. **Low Priority**:
   - Generic utility types (may be acceptable)
   - Third-party library types

## Expected Results

- ✅ No `any` types in critical paths
- ✅ Better type safety
- ✅ Improved IDE autocomplete
- ✅ Fewer runtime errors
- ✅ Better code documentation

