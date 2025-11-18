# API Stability & Data Consistency Guide

## Overview

This guide ensures all API endpoints are stable, consistent, and prevent Server Component render errors through comprehensive validation and error handling.

## Core Principles

### 1. **Always Validate with Zod**
- ✅ **DO**: Use Zod schemas for ALL request/response data
- ❌ **DON'T**: Trust external APIs or database responses without validation
- ❌ **DON'T**: Use `any` types in API routes

### 2. **Standard Response Envelope**
All `/api/v1/*` routes MUST return:
```typescript
{ ok: true, data: T, requestId: string } | { ok: false, error: { code: string, message: string, details?: any }, requestId: string }
```

### 3. **Never Throw in Server Components**
- ✅ **DO**: Catch all errors and return error envelope
- ❌ **DON'T**: Let unhandled errors propagate from API routes
- ❌ **DON'T**: Throw errors in Server Components that consume APIs

## Implementation Checklist

### For API Route Handlers (`app/api/v1/**/route.ts`)

#### ✅ Step 1: Define Schemas in `app/lib/api-contracts.ts`
```typescript
// Add to app/lib/api-contracts.ts
export const YourEndpointRequestSchema = z.object({
  // Define all request fields
  id: z.string().min(1),
  limit: z.number().int().positive().max(100).optional(),
});

export const YourEndpointResponseSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    items: z.array(/* your item schema */),
    total: z.number().int(),
  }),
  requestId: z.string(),
});
```

#### ✅ Step 2: Validate Request Data
```typescript
import { validateRequest } from '@/app/lib/api-contracts';
import { YourEndpointRequestSchema } from '@/app/lib/api-contracts';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    // Validate query params
    const { searchParams } = new URL(request.url);
    const query = YourEndpointRequestSchema.safeParse(
      Object.fromEntries(searchParams)
    );
    
    if (!query.success) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Invalid query parameters', requestId, query.error),
        { status: 400 }
      );
    }
    
    // Use validated data
    const { id, limit } = query.data;
    // ... rest of handler
  } catch (error) {
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Request failed', requestId),
      { status: 500 }
    );
  }
}
```

#### ✅ Step 3: Validate Response Data Before Returning
```typescript
// Before returning response, validate it matches schema
const responseData = {
  ok: true as const,
  data: {
    items: processedItems,
    total: processedItems.length,
  },
  requestId,
};

// Validate response structure
const validated = YourEndpointResponseSchema.safeParse(responseData);
if (!validated.success) {
  console.error('[API] Response validation failed:', validated.error);
  return NextResponse.json(
    createApiError('INTERNAL_ERROR', 'Response validation failed', requestId),
    { status: 500 }
  );
}

return NextResponse.json(validated.data);
```

#### ✅ Step 4: Handle External API Calls Safely
```typescript
// When calling external APIs (Printify, Stripe, etc.)
try {
  const externalResponse = await fetch(externalUrl, options);
  
  if (!externalResponse.ok) {
    // Return error envelope, don't throw
    return NextResponse.json(
      createApiError('EXTERNAL_API_ERROR', `External API returned ${externalResponse.status}`, requestId),
      { status: 502 }
    );
  }
  
  const externalData = await externalResponse.json();
  
  // Validate external API response
  const ExternalApiSchema = z.object({
    // Define expected structure
  });
  
  const validated = ExternalApiSchema.safeParse(externalData);
  if (!validated.success) {
    console.warn('[API] External API returned unexpected structure:', validated.error);
    // Return safe fallback or error
    return NextResponse.json(
      createApiError('EXTERNAL_API_ERROR', 'Invalid response format', requestId),
      { status: 502 }
    );
  }
  
  // Use validated data
  const safeData = validated.data;
} catch (error) {
  // Network errors, timeouts, etc.
  return NextResponse.json(
    createApiError('NETWORK_ERROR', 'Failed to reach external service', requestId),
    { status: 503 }
  );
}
```

### For Server Components (`app/**/*.tsx`)

#### ✅ Step 1: Always Validate API Responses
```typescript
import { safeFetch, isSuccess } from '@/lib/safeFetch';
import { YourEndpointResponseSchema } from '@/app/lib/api-contracts';

export default async function YourServerComponent() {
  let data: YourDataType[] = [];
  
  try {
    const result = await safeFetch<z.infer<typeof YourEndpointResponseSchema>>(
      '/api/v1/your-endpoint',
      { allowLive: true }
    );
    
    if (isSuccess(result)) {
      // Validate the response structure
      const validated = YourEndpointResponseSchema.safeParse(result.data);
      
      if (validated.success && validated.data.ok) {
        data = validated.data.data.items; // Type-safe access
      } else {
        console.warn('[ServerComponent] Invalid API response structure:', validated.error);
        data = []; // Safe fallback
      }
    }
  } catch (error) {
    // Already handled by safeFetch, but be extra safe
    console.warn('[ServerComponent] Failed to fetch data:', error);
    data = [];
  }
  
  // Always return renderable content
  return <YourComponent data={data} />;
}
```

#### ✅ Step 2: Validate Data Before Mapping
```typescript
// When mapping API data to component props
const safeItems = Array.isArray(apiData?.items) 
  ? apiData.items
      .filter((item): item is ValidItemType => {
        // Type guard: validate each item
        return (
          item &&
          typeof item === 'object' &&
          'id' in item &&
          'title' in item &&
          typeof item.id === 'string' &&
          typeof item.title === 'string'
        );
      })
      .map((item) => ({
        // Safe mapping with defaults
        id: String(item.id || ''),
        title: String(item.title || 'Untitled'),
        price: typeof item.price === 'number' ? item.price : 0,
        image: String(item.image || '/assets/images/placeholder-product.jpg'),
      }))
  : [];
```

## Standard Patterns

### Pattern 1: Query Parameter Validation
```typescript
const QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = QuerySchema.safeParse(Object.fromEntries(searchParams));
  
  if (!query.success) {
    return NextResponse.json(
      createApiError('VALIDATION_ERROR', 'Invalid query parameters', requestId, query.error),
      { status: 400 }
    );
  }
  
  // Use query.data (fully typed and validated)
}
```

### Pattern 2: Request Body Validation
```typescript
const BodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).max(120).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = BodySchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Invalid request body', requestId, validated.error),
        { status: 400 }
      );
    }
    
    // Use validated.data (fully typed)
  } catch (error) {
    return NextResponse.json(
      createApiError('VALIDATION_ERROR', 'Invalid JSON', requestId),
      { status: 400 }
    );
  }
}
```

### Pattern 3: Database Response Validation
```typescript
// Even database responses should be validated
const products = await db.product.findMany(/* ... */);

// Validate before returning
const ProductArraySchema = z.array(ProductSchema);
const validated = ProductArraySchema.safeParse(products);

if (!validated.success) {
  console.error('[API] Database response validation failed:', validated.error);
  return NextResponse.json(
    createApiError('INTERNAL_ERROR', 'Data validation failed', requestId),
    { status: 500 }
  );
}

return NextResponse.json({
  ok: true,
  data: { products: validated.data },
  requestId,
});
```

### Pattern 4: External API Response Validation
```typescript
// Always validate external API responses
const PrintifyProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  variants: z.array(z.object({
    id: z.number(),
    price: z.number(),
    is_enabled: z.boolean(),
  })),
});

const printifyResponse = await fetch(printifyUrl);
const printifyData = await printifyResponse.json();

// Validate structure
const validated = PrintifyProductSchema.safeParse(printifyData);
if (!validated.success) {
  console.warn('[API] Printify returned unexpected structure:', validated.error);
  // Return empty array or error, don't crash
  return NextResponse.json({
    ok: true,
    data: { products: [] },
    requestId,
  });
}

// Use validated data
const safeProduct = validated.data;
```

## Error Handling Standards

### Standard Error Codes
```typescript
// Use these error codes consistently
export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
```

### Error Response Format
```typescript
{
  ok: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid query parameters',
    details: {
      // Zod error details or additional context
      field: 'limit',
      issue: 'Expected number, received string',
    },
  },
  requestId: 'otm_1234567890_abc123',
}
```

## Testing & Validation

### 1. **Schema Validation Tests**
```typescript
// tests/api/your-endpoint.test.ts
import { YourEndpointResponseSchema } from '@/app/lib/api-contracts';

describe('YourEndpointResponseSchema', () => {
  it('validates correct response', () => {
    const validResponse = {
      ok: true,
      data: { items: [], total: 0 },
      requestId: 'test-123',
    };
    
    expect(YourEndpointResponseSchema.safeParse(validResponse).success).toBe(true);
  });
  
  it('rejects invalid response', () => {
    const invalidResponse = {
      ok: true,
      data: null, // Missing required fields
    };
    
    expect(YourEndpointResponseSchema.safeParse(invalidResponse).success).toBe(false);
  });
});
```

### 2. **Integration Tests**
```typescript
// Test that API returns valid envelope
const response = await fetch('/api/v1/your-endpoint');
const data = await response.json();

expect(data).toHaveProperty('ok');
expect(data).toHaveProperty('requestId');

if (data.ok) {
  expect(data).toHaveProperty('data');
} else {
  expect(data).toHaveProperty('error');
  expect(data.error).toHaveProperty('code');
  expect(data.error).toHaveProperty('message');
}
```

## Migration Checklist

For existing API routes, migrate in this order:

1. ✅ **Add Zod schemas** to `app/lib/api-contracts.ts`
2. ✅ **Validate request data** (query params, body)
3. ✅ **Validate response data** before returning
4. ✅ **Validate external API responses** (Printify, Stripe, etc.)
5. ✅ **Update Server Components** to validate API responses
6. ✅ **Add error handling** for all failure paths
7. ✅ **Test with invalid data** to ensure graceful failures
8. ✅ **Monitor production** for validation errors

## Monitoring & Alerts

### Key Metrics to Track
- Validation error rate (should be < 1%)
- External API failure rate
- Response time for API calls
- Server Component render errors (should be 0)

### Logging Standards
```typescript
// Log validation errors with context
console.warn('[API] Validation failed:', {
  endpoint: '/api/v1/your-endpoint',
  requestId,
  error: validationError,
  input: sanitizedInput, // Don't log sensitive data
});

// Log external API issues
console.error('[API] External API failed:', {
  service: 'Printify',
  endpoint: '/products',
  status: response.status,
  requestId,
});
```

## Best Practices Summary

1. **Always validate** - Never trust external data
2. **Use Zod schemas** - Define contracts explicitly
3. **Return error envelopes** - Never throw in API routes
4. **Validate in Server Components** - Double-check API responses
5. **Provide safe defaults** - Empty arrays, null checks, fallbacks
6. **Log validation failures** - Help debug production issues
7. **Test edge cases** - Invalid data, network failures, timeouts
8. **Monitor production** - Track validation errors and fix schemas

## Quick Reference

### Creating a New API Endpoint

1. Define schemas in `app/lib/api-contracts.ts`
2. Import and validate request data
3. Process request with validated data
4. Validate response before returning
5. Return standard envelope format
6. Handle all errors gracefully
7. Test with valid and invalid inputs

### Updating Server Components

1. Use `safeFetch()` for API calls
2. Validate response with Zod schema
3. Use type guards for data mapping
4. Provide safe fallbacks for all data
5. Never throw errors - always return renderable content
6. Log warnings for debugging

