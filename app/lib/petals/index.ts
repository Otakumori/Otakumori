/**
 * Petal Economy - Central Entry Point Documentation
 * 
 * This file serves as the central documentation and index for the petal economy system.
 * 
 * ARCHITECTURE OVERVIEW:
 * =====================
 * 
 * **Source of Truth:**
 * - PetalWallet (Prisma model) is the primary storage for authenticated users
 *   - Fields: balance, lifetimeEarned, currentStreak, lastCollectedAt
 * - User.petalBalance is kept in sync for backward compatibility
 * - PetalTransaction records all grants for audit trail
 * - PetalLedger tracks lifetime earnings by type
 * 
 * **How Balances Are Stored:**
 * - Authenticated users: PetalWallet.balance (primary) + User.petalBalance (sync)
 * - Guest users: localStorage (ephemeral, not persisted to DB)
 * 
 * **Entry Points That Can Change Petals:**
 * 
 * 1. **Mini-Games** (`mini_game` source)
 *    - Routes: /api/v1/petals/earn, /api/mini-games/submit, /api/games/finish
 *    - Rules: maxPerEvent: 50, maxPerDay: 2000
 *    - Rate limit: 10 requests/minute
 * 
 * 2. **Background Petal Clicks** (`background_petal_click` source)
 *    - Routes: /api/v1/petals/collect, /api/v1/petals/grant
 *    - Rules: maxPerEvent: 5, maxPerDay: 50
 *    - Rate limit: 3 requests/5 seconds (strict)
 * 
 * 3. **Purchase Rewards** (`purchase_reward` source)
 *    - Routes: inngest/order-fulfillment.ts
 *    - Rules: maxPerEvent: 200, maxPerDay: 5000
 *    - No rate limit (naturally limited by payment flow)
 * 
 * 4. **Daily Login** (`daily_login` source)
 *    - Routes: /api/quests/claim
 *    - Rules: maxPerEvent: 25, maxPerDay: 25 (once per day)
 *    - Rate limit: 1 request/24 hours
 * 
 * 5. **Achievements** (`achievement` source)
 *    - Routes: /api/v1/achievements/unlock
 *    - Rules: maxPerEvent: 100, maxPerDay: 3000
 *    - Rate limit: 5 requests/minute
 * 
 * 6. **Quest Rewards** (`quest_reward` source)
 *    - Routes: /api/quests/claim
 *    - Rules: maxPerEvent: 50, maxPerDay: 500
 *    - Rate limit: 5 requests/minute
 * 
 * 7. **Soapstone Praise** (`soapstone_praise` source)
 *    - Routes: /api/v1/products/soapstones/[id]/praise
 *    - Rules: maxPerEvent: 10, maxPerDay: 100
 *    - Rate limit: 10 requests/minute
 * 
 * 8. **Leaderboard Rewards** (`leaderboard_reward` source)
 *    - Routes: /api/v1/leaderboards/[gameId]
 *    - Rules: maxPerEvent: 100, maxPerDay: 500
 *    - Rate limit: 5 requests/minute
 * 
 * 9. **Admin Grants** (`admin_grant` source)
 *    - Routes: (future admin panel)
 *    - Rules: maxPerEvent: 1000, no daily limit
 *    - No rate limit
 * 
 * **How to Add a New Petal Source:**
 * 
 * 1. Add the source type to `PetalSource` in `app/lib/petals/grant.ts`
 * 2. Add rules to `PETAL_RULES` in the same file
 * 3. Use `grantPetals()` function from `app/lib/petals/grant.ts` in your route/handler
 * 4. Update this documentation with the new entry point
 * 
 * **Example Usage:**
 * 
 * ```typescript
 * import { grantPetals } from '@/app/lib/petals/grant';
 * 
 * const result = await grantPetals({
 *   userId: userId || null,
 *   amount: 10,
 *   source: 'mini_game',
 *   metadata: { gameId: 'memory-match', score: 1500 },
 *   description: 'Completed memory match game',
 *   requestId,
 *   req,
 * });
 * 
 * if (result.success) {
 *   // Update UI with result.newBalance
 *   // Show feedback: +result.granted petals
 * }
 * ```
 * 
 * **Daily Caps Enforcement:**
 * - Daily limits are checked per source per user
 * - Uses PetalTransaction table with createdAt >= today
 * - If limit reached, returns success with granted: 0 and limited: true
 * - Client should handle limited state gracefully
 * 
 * **Rate Limiting:**
 * - Uses Redis-based rate limiting via `checkRateLimit()`
 * - Key format: `PETAL_GRANT_{SOURCE}:{userId|ip}`
 * - Returns 429 status with clear error message
 * 
 * **Guest User Handling:**
 * - Guests can only earn from: background_petal_click, mini_game
 * - Lower caps apply (handled client-side via localStorage)
 * - No DB writes for guests
 * - Petals merged on login (future feature)
 */

export { grantPetals, type PetalSource, type GrantPetalsInput, type GrantPetalsResult, PETAL_RULES } from './grant';

