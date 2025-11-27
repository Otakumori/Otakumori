# Guide #9: Critical TODOs Implementation

## Overview

Implement high-priority TODO items that block features or cause issues.

## Current Critical TODOs

### High Priority

1. **Character Editor DB Save** (`app/character-editor/page.tsx`)
   - TODO: "Implement database save for authenticated users"
   - Impact: Users can't save character configurations

2. **Game Win State** (`app/mini-games/petal-samurai/page.tsx`)
   - TODO: "Connect to actual game win state"
   - Impact: Game completions not tracked

3. **Idempotency Check** (`app/api/v1/checkout/session/route.ts`)
   - TODO: "Implement proper idempotency check"
   - Impact: Potential duplicate orders

4. **Activity Feed** (`app/components/profile/RecentActivity.tsx`)
   - TODO: "Wire into real activity API"
   - Impact: Activity feed not functional

5. **Game Stats** (`app/components/profile/MiniGameStats.tsx`)
   - TODO: "Fetch real per-game stats from API"
   - Impact: Stats not displayed

### Medium Priority

6. **Sprite Generation** (`app/api/v1/character/config/route.ts`)
   - TODO: "Generate sprite from 3D model"
   - Impact: Missing feature

7. **Order Sync** (`app/api/webhooks/printify/route.ts`)
   - TODO: "implement your order sync logic here"
   - Impact: Orders not synced from Printify

8. **Stripe Webhook** (`app/api/stripe/webhook/route.ts`)
   - TODO: Extract customer info from metadata
   - Impact: Missing customer data

## Implementation Guide

### 1. Character Editor DB Save

**File**: `app/character-editor/page.tsx`

**Implementation**:

```typescript
// Add save handler
const handleSave = async () => {
  const { userId } = await auth();
  if (!userId) {
    // Show sign-in modal
    return;
  }

  try {
    const response = await fetch('/api/v1/character/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-idempotency-key': generateIdempotencyKey(),
      },
      body: JSON.stringify({
        configData: characterConfig,
        meshData: meshData,
        textureData: textureData,
      }),
    });

    if (response.ok) {
      // Show success notification
    }
  } catch (error) {
    // Handle error
  }
};
```

### 2. Game Win State Connection

**File**: `app/mini-games/petal-samurai/page.tsx`

**Implementation**:

```typescript
// In game completion handler
const handleGameComplete = async (score: number, time: number) => {
  const { userId } = await auth();
  if (!userId) return;

  try {
    await fetch('/api/v1/games/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-idempotency-key': generateIdempotencyKey(),
      },
      body: JSON.stringify({
        gameKey: 'petal-samurai',
        score,
        time,
        completed: true,
      }),
    });
  } catch (error) {
    logger.error('Failed to save game completion', { error });
  }
};
```

### 3. Idempotency Check

**File**: `app/api/v1/checkout/session/route.ts`

**Implementation**:

```typescript
// Add at start of POST handler
const idempotencyKey = req.headers.get('x-idempotency-key');
if (idempotencyKey) {
  const idempotencyResult = await checkIdempotency(idempotencyKey);
  if (idempotencyResult.response) {
    return idempotencyResult.response;
  }
}

// Store response after successful creation
await storeIdempotencyResponse(idempotencyKey, response);
```

## Execution Script

**File**: `scripts/audit-todos.mjs`

```javascript
#!/usr/bin/env node
/**
 * Find and categorize all TODO items
 * Run: node scripts/audit-todos.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', 'reports'];

function findFiles(dir, fileList = []) {
  if (!existsSync(dir)) return fileList;
  
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    try {
      const stat = statSync(filePath);
      if (stat.isDirectory() && !IGNORE_DIRS.includes(file)) {
        findFiles(filePath, fileList);
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(file)) {
        fileList.push(filePath);
      }
    } catch (e) {
      // Skip
    }
  });
  return fileList;
}

function findTODOs(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const todos = [];
  
  // Match TODO, FIXME, XXX, HACK comments
  const patterns = [
    { regex: /TODO:\s*(.+)/gi, type: 'TODO' },
    { regex: /FIXME:\s*(.+)/gi, type: 'FIXME' },
    { regex: /XXX:\s*(.+)/gi, type: 'XXX' },
    { regex: /HACK:\s*(.+)/gi, type: 'HACK' },
  ];
  
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    patterns.forEach(({ regex, type }) => {
      const match = line.match(regex);
      if (match) {
        todos.push({
          file: filePath,
          line: index + 1,
          type,
          text: match[1]?.trim() || match[0],
          severity: type === 'FIXME' || type === 'HACK' ? 'high' : 'medium',
        });
      }
    });
  });
  
  return todos;
}

// Main execution
const files = findFiles('./app');
const allTodos = [];
files.forEach(file => {
  const todos = findTODOs(file);
  allTodos.push(...todos);
});

// Categorize
const byType = {};
const bySeverity = { high: [], medium: [], low: [] };

allTodos.forEach(todo => {
  if (!byType[todo.type]) byType[todo.type] = [];
  byType[todo.type].push(todo);
  
  bySeverity[todo.severity].push(todo);
});

console.log('📋 TODO Audit Report\n');
console.log(`Total TODOs: ${allTodos.length}\n`);

console.log('By Type:');
Object.entries(byType).forEach(([type, todos]) => {
  console.log(`  ${type}: ${todos.length}`);
});

console.log('\nBy Severity:');
Object.entries(bySeverity).forEach(([severity, todos]) => {
  console.log(`  ${severity}: ${todos.length}`);
});

console.log('\n🔴 High Priority TODOs:\n');
bySeverity.high.forEach(todo => {
  console.log(`${todo.file}:${todo.line}`);
  console.log(`  [${todo.type}] ${todo.text}\n`);
});

// Save report
import { writeFileSync, mkdirSync } from 'fs';

if (!existsSync('reports')) {
  mkdirSync('reports', { recursive: true });
}

writeFileSync(
  'reports/todos-audit.json',
  JSON.stringify({ todos: allTodos, byType, bySeverity }, null, 2)
);

console.log('📄 Full report: reports/todos-audit.json');
```

## Expected Results

- ✅ Character configurations saved to database
- ✅ Game completions tracked
- ✅ Idempotency prevents duplicate orders
- ✅ Activity feed functional
- ✅ Game stats displayed

