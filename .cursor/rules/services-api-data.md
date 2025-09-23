# Services, API & Data Standards

## API Design Standards

### Zod Validation

- All request/response schemas in `/app/lib/api-contracts.ts`
- Validate ALL incoming data with `.safeParse()`
- Return detailed validation errors with field paths
- Use discriminated unions for complex payloads

### Response Envelope

```typescript
// Success response
{ ok: true, data: T, requestId: string }

// Error response
{ ok: false, error: { code: string, message: string, details?: any }, requestId: string }
```

### Idempotency Implementation

- ALL mutating requests require `x-idempotency-key` header
- Use `checkIdempotency()` and `storeIdempotencyResponse()` functions
- Keys expire after 24 hours
- Return cached response for duplicate keys
- **Never manually create `IdempotencyKey` records** - use middleware only

### Request ID Logging

- Generate unique `requestId` for every API call: `generateRequestId()`
- Include in all responses and error logs
- Format: `otm_${timestamp}_${random}`
- Use for tracing and debugging

### Rate Limiting

- Use `withRateLimit()` wrapper for all endpoints
- Limits defined in `RATE_LIMITS` config:
  - `SOAPSTONE_PLACE`: 5/min
  - `PRAISE_SEND`: 10/day
  - `WISHLIST_TOGGLE`: 20/min
  - `TRADE_OFFER`: 3/5min
  - `GAME_SAVE`: 10/10sec
- Return `429` with reset time headers

### Database Patterns

- Use Prisma transactions for multi-model operations
- Include proper indexes for query performance
- Use `onDelete: Cascade` for cleanup
- Validate foreign key relationships

### Error Handling

```typescript
// Standard error codes
API_ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};
```

### Data Integrity

- No duplicate API handlers or duplicate data creation
- Use unique constraints and proper relations
- Validate data consistency across operations
- Implement soft deletes where appropriate

### Caching Strategy

- Use React Query for client-side caching
- Cache static data at CDN level
- Implement cache invalidation patterns
- Respect cache-control headers
