# Guide #2: Console.log Cleanup (860 instances)

## Overview

Replace 860 console statements across 408 files with structured logger.

## Current State

- **Logger location**: `app/lib/logger.ts`

- **Import pattern**: `import { logger } from '@/app/lib/logger'`

- **RequestId helper**: `import { newRequestId } from '@/app/lib/requestId'`

- **Logger methods**: `logger.info()`, `logger.warn()`, `logger.error()`, `logger.debug()`

## Logger API

```typescript
// Basic usage
logger.info('Message', { requestId: 'xxx' }, optionalData);
logger.warn('Warning', { requestId: 'xxx' }, optionalData);
logger.error('Error', { requestId: 'xxx' }, optionalData, optionalError);
logger.debug('Debug', { requestId: 'xxx' }, optionalData);

// In API routes (with request)
logger.request(req, 'Message', optionalData);
logger.apiError(req, 'Error message', error, optionalData);
```

## Replacement Patterns

### Pattern 1: Simple console.log → logger.info

```typescript
// Before
console.log('User created');

// After
const requestId = newRequestId();
logger.info('User created', { requestId });
```

### Pattern 2: console.error → logger.error

```typescript
// Before
console.error('Failed to process', error);

// After
const requestId = newRequestId();
logger.error('Failed to process', { requestId }, undefined, error);
```

### Pattern 3: In API routes (use request helper)

```typescript
// Before
console.log('Processing request');

// After
logger.request(req, 'Processing request');
```

### Pattern 4: With data object

```typescript
// Before
console.log('Order created', { orderId: '123', amount: 50 });

// After
const requestId = newRequestId();
logger.info('Order created', { requestId }, { orderId: '123', amount: 50 });
```

## Execution Script

See `scripts/fix-console-logs.mjs` for automated replacement.

## Execution Steps

1. **Dry run**:
   ```bash
   node scripts/fix-console-logs.mjs --dry-run
   ```

2. **Review output** - Check which files will be modified

3. **Execute**:
   ```bash
   node scripts/fix-console-logs.mjs --execute
   ```

4. **Verify**:
   ```bash
   npm run typecheck
   npm run lint
   ```

5. **Manual review** - Some complex cases may need manual fixes

## Manual Fixes Needed

Some patterns require manual attention:

- Console statements in try/catch with error objects
- Console statements with complex expressions
- Console statements in client components (may need different approach)
- Console statements in test files (may want to keep)

## Expected Results

- ✅ 860 console statements replaced
- ✅ Structured logging with requestId
- ✅ Better production logging
- ✅ Easier debugging with context

