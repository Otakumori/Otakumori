# Guide #10: Accessibility Fixes

## Overview

Fix accessibility issues: form labels, interactive elements, ARIA attributes, and keyboard navigation.

## Current Issues

### 1. Form Labels (10+ warnings)

**Issue**: Labels not associated with inputs

**Files**:
- `app/components/avatar/CharacterEditor.tsx`
- `app/components/demos/LightingDemo.tsx`
- `app/components/demos/PetalPhysicsDemo.tsx`
- `app/components/shop/ProductSoapstoneWall.tsx`

**Fix Pattern**:

```tsx
// Before
<label>Name</label>
<input type="text" />

// After
<label htmlFor="name-input">Name</label>
<input id="name-input" type="text" />

// OR wrap input
<label>
  Name
  <input type="text" />
</label>
```

### 2. Interactive Elements (20+ warnings)

**Issue**: Non-interactive elements with onClick handlers

**Fix Pattern**:

```tsx
// Before
<div onClick={handleClick}>Click me</div>

// After Option 1: Use button
<button onClick={handleClick}>Click me</button>

// After Option 2: Add ARIA and keyboard handler
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Click me
</div>
```

### 3. Emoji Accessibility (60+ warnings)

**Issue**: Emojis without ARIA labels

**Fix Pattern**:

```tsx
// Before
<span>🎮</span>

// After
<span role="img" aria-label="game controller">🎮</span>
```

## Execution Script

**File**: `scripts/fix-accessibility.mjs`

```javascript
#!/usr/bin/env node
/**
 * Fix accessibility issues automatically where possible
 * Run: node scripts/fix-accessibility.mjs --dry-run
 * Run: node scripts/fix-accessibility.mjs --execute
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build'];

function findComponentFiles(dir, fileList = []) {
  if (!existsSync(dir)) return fileList;
  
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    try {
      const stat = statSync(filePath);
      if (stat.isDirectory() && !IGNORE_DIRS.includes(file)) {
        findComponentFiles(filePath, fileList);
      } else if (stat.isFile() && /\.(tsx|jsx)$/.test(file)) {
        fileList.push(filePath);
      }
    } catch (e) {
      // Skip
    }
  });
  return fileList;
}

function fixAccessibility(filePath) {
  let content = readFileSync(filePath, 'utf8');
  const originalContent = content;
  const fixes = [];

  // Fix 1: Add keyboard handlers to divs with onClick
  const divOnClickRegex = /<div\s+([^>]*onClick={[^}]+}[^>]*)(>)/g;
  content = content.replace(divOnClickRegex, (match, attrs, closing) => {
    if (attrs.includes('role=') && attrs.includes('onKeyDown')) {
      return match; // Already fixed
    }
    
    fixes.push('Added keyboard handler to div with onClick');
    
    let newAttrs = attrs;
    if (!newAttrs.includes('role=')) {
      newAttrs += ' role="button"';
    }
    if (!newAttrs.includes('tabIndex')) {
      newAttrs += ' tabIndex={0}';
    }
    if (!newAttrs.includes('onKeyDown')) {
      newAttrs += ' onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.click(); } }}';
    }
    
    return `<div ${newAttrs}${closing}`;
  });

  // Fix 2: Add aria-label to emojis (simple cases)
  const emojiRegex = /<span>([\u{1F300}-\u{1F9FF}]+)<\/span>/gu;
  const emojiLabels = {
    '🎮': 'game controller',
    '🌸': 'cherry blossom',
    '⭐': 'star',
    '💎': 'gem',
    '🔥': 'fire',
    '✨': 'sparkles',
    // Add more as needed
  };
  
  content = content.replace(emojiRegex, (match, emoji) => {
    const label = emojiLabels[emoji] || 'decorative icon';
    fixes.push(`Added aria-label to emoji: ${emoji}`);
    return `<span role="img" aria-label="${label}">${emoji}</span>`;
  });

  // Fix 3: Add htmlFor to labels (simple cases)
  // This is more complex and may need manual review
  
  return {
    file: filePath,
    fixes,
    modified: content !== originalContent,
    content: content !== originalContent ? content : null,
  };
}

// Main execution
const isDryRun = process.argv.includes('--dry-run');
const isExecute = process.argv.includes('--execute');

if (!isDryRun && !isExecute) {
  console.log('Usage: node scripts/fix-accessibility.mjs --dry-run|--execute');
  process.exit(1);
}

const files = findComponentFiles('./app/components');
const results = files.map(fixAccessibility);
const modified = results.filter(r => r.modified);

console.log(`📊 Accessibility Fix Report\n`);
console.log(`Files checked: ${results.length}`);
console.log(`Files modified: ${modified.length}\n`);

if (isDryRun) {
  modified.forEach(result => {
    console.log(`📝 ${result.file}`);
    result.fixes.forEach(fix => console.log(`  - ${fix}`));
    console.log();
  });
} else if (isExecute) {
  modified.forEach(result => {
    writeFileSync(result.file, result.content, 'utf8');
    console.log(`✅ Fixed: ${result.file}`);
    result.fixes.forEach(fix => console.log(`  - ${fix}`));
  });
}

console.log('\n✨ Accessibility fixes complete!');
console.log('⚠️  Note: Some fixes may need manual review (form labels, complex cases)');
```

## Manual Fixes Needed

1. **Form Labels** - Review each form individually
2. **Complex Interactive Elements** - May need semantic HTML changes
3. **Custom Components** - May need custom ARIA implementations

## Expected Results

- ✅ All form inputs have associated labels
- ✅ All interactive elements keyboard accessible
- ✅ Emojis have ARIA labels
- ✅ Better screen reader support
- ✅ Improved keyboard navigation

