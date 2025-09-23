# Authentication & Security Standards

## Clerk SSR Integration

### Server-Side Authentication

- Use `auth()` from `@clerk/nextjs/server` in Server Components
- Use `currentUser()` for user data access
- Never import Clerk client hooks in Server Components
- Protect API routes with `auth()` middleware

### Client-Side Authentication

- Use `useUser()` and `useAuth()` hooks in Client Components
- Use `<SignedIn>` and `<SignedOut>` for conditional rendering
- Import from `@clerk/nextjs` (not `/server`)
- Handle loading states properly

### Modal Intercept Pattern

All gated actions MUST use modal intercept, never hard navigation:

```typescript
// AuthContext gated actions
requireAuthForSoapstone(); // "Sign in to leave a sign for fellow travelers"
requireAuthForPraise(); // "Sign in to send praise to other travelers"
requireAuthForWishlist(); // "Sign in to add items to your wishlist"
requireAuthForTrade(); // "Sign in to present offers in the Scarlet Bazaar"
requireAuthForCommunity(); // "Sign in to participate in community discussions"
```

### RBAC Implementation

- Use `ModeratorRole` model for permissions
- Roles: `user` | `moderator` | `admin`
- Check permissions server-side: `getUserRole()`, `requireAdmin()`, `requireModerator()`
- Client-side role checks for UI only (not security)

### API Security Standards

- All `/api/v1/*` routes return envelope: `{ ok: true, data: T } | { ok: false, error: string }`
- Include `export const runtime = "nodejs"` for admin routes
- Use `withAuth()`, `withAdminAuth()`, `withModeratorAuth()` middleware
- Return `401` with `x-otm-reason` header for auth failures

### Session Management

- Respect Clerk session lifecycle
- Handle session expiry gracefully
- Redirect to sign-in preserves intended destination
- Clear client state on sign-out

### Security Headers

```typescript
// API response headers
'x-otm-reason': 'AUTH_REQUIRED' | 'FORBIDDEN' | 'RATE_LIMITED'
'x-ratelimit-remaining': number
'x-ratelimit-reset': timestamp
```

### Webhook Security

- Validate Clerk webhook signatures
- Use database transactions for user operations
- Handle webhook retries and idempotency
- Log security events to Sentry
