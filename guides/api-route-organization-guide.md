# Guide #8: API Route Organization & Standards

## Overview

Standardize all API routes to follow consistent patterns for error handling, idempotency, authentication, and runtime configuration.

## Current State

### ✅ Good Examples

- `app/api/v1/soapstone/route.ts` - Has auth, idempotency, rate limiting, proper error handling
- `app/api/v1/praise/route.ts` - Follows standards
- `app/api/v1/wishlist/route.ts` - Follows standards

### ❌ Needs Improvement

- Some routes missing `export const runtime = 'nodejs'`
- Inconsistent error response formats
- Missing idempotency checks on mutating routes
- Inconsistent authentication patterns

## Standards Checklist

### Required for All Routes

1. **Runtime Export** (for admin/Prisma/Stripe routes):

   ```typescript
   export const runtime = 'nodejs';
   ```

2. **Request ID Generation**:

   ```typescript
   const requestId = generateRequestId();
   ```

3. **Error Response Format**:

   ```typescript
   return NextResponse.json(
     createApiError('ERROR_CODE', 'Error message', requestId),
     { status: 400 }
   );
   ```

4. **Success Response Format**:

   ```typescript
   return NextResponse.json(
     createApiSuccess(data, requestId),
     { status: 200 }
   );
   ```

### Required for Mutating Routes (POST/PUT/DELETE)

1. **Authentication Check**:

   ```typescript
   const { userId } = await auth();
   if (!userId) {
     return NextResponse.json(
       createApiError('AUTH_REQUIRED', 'Authentication required', requestId),
       { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } }
     );
   }
   ```

2. **Idempotency Check**:

   ```typescript
   const idempotencyKey = req.headers.get('x-idempotency-key');
   if (idempotencyKey) {
     const result = await checkIdempotency(idempotencyKey);
     if (result.response) {
       return result.response;
     }
   }
   ```

3. **Rate Limiting**:

   ```typescript
   const rateLimitedHandler = withRateLimit('RATE_LIMIT_KEY', async (req) => {
     // Handler logic
   });
   return rateLimitedHandler(req);
   ```

4. **Zod Validation**:

   ```typescript
   const body = await req.json();
   const validationResult = RequestSchema.safeParse(body);
   if (!validationResult.success) {
     return NextResponse.json(
       createApiError('VALIDATION_ERROR', 'Invalid request data', requestId, validationResult.error.issues),
       { status: 400 }
     );
   }
   ```

## Execution Script

**File**: `scripts/audit-api-routes.mjs`

```javascript
#!/usr/bin/env node
/**
 * Audit API routes for compliance with standards
 * Run: node scripts/audit-api-routes.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build'];

function findRouteFiles(dir, fileList = []) {
  if (!existsSync(dir)) return fileList;
  
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    try {
      const stat = statSync(filePath);
      if (stat.isDirectory() && !IGNORE_DIRS.includes(file)) {
        findRouteFiles(filePath, fileList);
      } else if (stat.isFile() && file === 'route.ts') {
        fileList.push(filePath);
      }
    } catch (e) {
      // Skip
    }
  });
  return fileList;
}

function auditRoute(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const issues = [];
  
  const checks = {
    hasRuntime: /export\s+const\s+runtime\s*=/.test(content),
    hasRequestId: /generateRequestId\(\)/.test(content),
    hasErrorFormat: /createApiError/.test(content),
    hasSuccessFormat: /createApiSuccess/.test(content),
    hasAuth: /await\s+auth\(\)/.test(content),
    hasIdempotency: /checkIdempotency|idempotencyKey/.test(content),
    hasRateLimit: /withRateLimit/.test(content),
    hasZodValidation: /\.safeParse\(/.test(content),
  };
  
  // Check if it's a mutating route
  const isMutating = /export\s+async\s+function\s+(POST|PUT|DELETE|PATCH)/.test(content);
  const isAdminRoute = filePath.includes('/admin/') || filePath.includes('/webhooks/');
  
  // Runtime required for admin/webhook routes
  if (isAdminRoute && !checks.hasRuntime) {
    issues.push({ type: 'missing_runtime', severity: 'high' });
  }
  
  // Request ID required for all routes
  if (!checks.hasRequestId) {
    issues.push({ type: 'missing_request_id', severity: 'high' });
  }
  
  // Error/Success format required
  if (!checks.hasErrorFormat) {
    issues.push({ type: 'missing_error_format', severity: 'high' });
  }
  if (!checks.hasSuccessFormat) {
    issues.push({ type: 'missing_success_format', severity: 'high' });
  }
  
  // Mutating routes need auth, idempotency, rate limiting
  if (isMutating) {
    if (!checks.hasAuth) {
      issues.push({ type: 'missing_auth', severity: 'high' });
    }
    if (!checks.hasIdempotency) {
      issues.push({ type: 'missing_idempotency', severity: 'medium' });
    }
    if (!checks.hasRateLimit) {
      issues.push({ type: 'missing_rate_limit', severity: 'medium' });
    }
    if (!checks.hasZodValidation) {
      issues.push({ type: 'missing_validation', severity: 'medium' });
    }
  }
  
  return {
    file: filePath,
    isMutating,
    isAdminRoute,
    checks,
    issues,
    score: Object.values(checks).filter(Boolean).length / Object.keys(checks).length,
  };
}

// Main execution
const routeFiles = findRouteFiles('./app/api');
const audits = routeFiles.map(auditRoute);

console.log('📊 API Route Audit Report\n');
console.log(`Total routes: ${audits.length}\n`);

const withIssues = audits.filter(a => a.issues.length > 0);
const highSeverity = audits.filter(a => a.issues.some(i => i.severity === 'high'));

console.log(`⚠️  Routes with issues: ${withIssues.length}`);
console.log(`🔴 High severity issues: ${highSeverity.length}\n`);

// Group by issue type
const issueTypes = {};
withIssues.forEach(audit => {
  audit.issues.forEach(issue => {
    if (!issueTypes[issue.type]) {
      issueTypes[issue.type] = [];
    }
    issueTypes[issue.type].push(audit.file);
  });
});

console.log('📋 Issues by Type:\n');
Object.entries(issueTypes).forEach(([type, files]) => {
  console.log(`${type}: ${files.length} routes`);
  files.slice(0, 5).forEach(file => console.log(`  - ${file}`));
  if (files.length > 5) console.log(`  ... and ${files.length - 5} more`);
  console.log();
});

// Routes needing attention
console.log('🔴 High Priority Routes:\n');
highSeverity.forEach(audit => {
  console.log(`${audit.file}`);
  audit.issues.filter(i => i.severity === 'high').forEach(issue => {
    console.log(`  - ${issue.type}`);
  });
  console.log();
});

// Generate report
const report = {
  total: audits.length,
  withIssues: withIssues.length,
  highSeverity: highSeverity.length,
  issueTypes,
  routes: audits.map(a => ({
    file: a.file,
    score: a.score,
    issues: a.issues,
  })),
};

import { writeFileSync, mkdirSync } from 'fs';

if (!existsSync('reports')) {
  mkdirSync('reports', { recursive: true });
}

writeFileSync(
  'reports/api-routes-audit.json',
  JSON.stringify(report, null, 2)
);

console.log('📄 Full report saved to: reports/api-routes-audit.json');
```

## Fix Script

**File**: `scripts/fix-api-routes.mjs`

```javascript
#!/usr/bin/env node
/**
 * Fix common API route issues
 * Run: node scripts/fix-api-routes.mjs --dry-run
 * Run: node scripts/fix-api-routes.mjs --execute
 */

// This would add missing runtime exports, standardize error handling, etc.
// Implementation similar to other fix scripts - placeholder for now
console.log('API route fix script - to be implemented');
```

## Priority Routes

1. **High Priority** (User-facing mutating routes):
   - `app/api/v1/checkout/session/route.ts` - Missing idempotency
   - `app/api/v1/games/start/route.ts` - Needs standardization
   - `app/api/trade/route.ts` - Missing standards

2. **Medium Priority**:
   - Admin routes missing `runtime = 'nodejs'`
   - Webhook routes missing proper error handling

## Expected Results

- ✅ All routes follow consistent patterns
- ✅ Proper error handling and logging
- ✅ Idempotency on all mutating routes
- ✅ Rate limiting where appropriate
- ✅ Better debugging with request IDs

