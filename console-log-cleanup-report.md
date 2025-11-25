# Console Log Cleanup Report

Found 364 console statements across 203 files.

## app\api\admin\achievements\route.ts

Found 1 console statement(s):

### Line 36: error

**Original:**
```typescript
console.error('Error fetching achievements:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching achievements:', { requestId }, error);
```

---

## app\api\admin\backup\route.ts

Found 2 console statement(s):

### Line 36: error

**Original:**
```typescript
console.error('Backup error:', error);
```

**Replacement:**
```typescript
logger.error('Backup error:', { requestId }, error);
```

---

### Line 59: error

**Original:**
```typescript
console.error('Backup list error:', error);
```

**Replacement:**
```typescript
logger.error('Backup list error:', { requestId }, error);
```

---

## app\api\admin\burst\route.ts

Found 2 console statement(s):

### Line 105: error

**Original:**
```typescript
console.error('Burst config fetch error', error);
```

**Replacement:**
```typescript
logger.error('Burst config fetch error', { requestId }, error);
```

---

### Line 183: error

**Original:**
```typescript
console.error('Burst config save error', error);
```

**Replacement:**
```typescript
logger.error('Burst config save error', { requestId }, error);
```

---

## app\api\admin\cache\clear\route.ts

Found 2 console statement(s):

### Line 36: error

**Original:**
```typescript
console.error('Cache clear error:', error);
```

**Replacement:**
```typescript
logger.error('Cache clear error:', { requestId }, error);
```

---

### Line 57: error

**Original:**
```typescript
console.error('Cache stats error:', error);
```

**Replacement:**
```typescript
logger.error('Cache stats error:', { requestId }, error);
```

---

## app\api\admin\dashboard\route.ts

Found 1 console statement(s):

### Line 90: error

**Original:**
```typescript
console.error('Dashboard stats fetch error:', error);
```

**Replacement:**
```typescript
logger.error('Dashboard stats fetch error:', { requestId }, error);
```

---

## app\api\admin\discounts\route.ts

Found 3 console statement(s):

### Line 80: error

**Original:**
```typescript
console.error('Error fetching discount rewards:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching discount rewards:', { requestId }, error);
```

---

### Line 162: error

**Original:**
```typescript
console.error('Error saving discount reward:', error);
```

**Replacement:**
```typescript
logger.error('Error saving discount reward:', { requestId }, error);
```

---

### Line 193: error

**Original:**
```typescript
console.error('Error deleting discount reward:', error);
```

**Replacement:**
```typescript
logger.error('Error deleting discount reward:', { requestId }, error);
```

---

## app\api\admin\economy\stats\route.ts

Found 1 console statement(s):

### Line 232: error

**Original:**
```typescript
console.error('Error fetching economy stats:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching economy stats:', { requestId }, error);
```

---

## app\api\admin\flags\route.ts

Found 1 console statement(s):

### Line 23: warn

**Original:**
```typescript
console.warn('Feature flags requested from:', req.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Feature flags requested from:', { requestId }, req.headers.get('user-agent'));
```

---

## app\api\admin\maintenance\route.ts

Found 2 console statement(s):

### Line 27: error

**Original:**
```typescript
console.error('Maintenance status check error:', error);
```

**Replacement:**
```typescript
logger.error('Maintenance status check error:', { requestId }, error);
```

---

### Line 58: error

**Original:**
```typescript
console.error('Maintenance toggle error:', error);
```

**Replacement:**
```typescript
logger.error('Maintenance toggle error:', { requestId }, error);
```

---

## app\api\admin\moderation\route.ts

Found 2 console statement(s):

### Line 165: error

**Original:**
```typescript
console.error('Moderation API Error:', error);
```

**Replacement:**
```typescript
logger.error('Moderation API Error:', { requestId }, error);
```

---

### Line 214: error

**Original:**
```typescript
console.error('Moderation API Error:', error);
```

**Replacement:**
```typescript
logger.error('Moderation API Error:', { requestId }, error);
```

---

## app\api\admin\music\blob-upload-token\route.ts

Found 1 console statement(s):

### Line 20: error

**Original:**
```typescript
console.error('Admin auth failed for blob upload token:', error);
```

**Replacement:**
```typescript
logger.error('Admin auth failed for blob upload token:', { requestId }, error);
```

---

## app\api\admin\music\playlists\route.ts

Found 4 console statement(s):

### Line 13: warn

**Original:**
```typescript
console.warn(`Admin ${admin.id} requested playlists`);
```

**Replacement:**
```typescript
logger.warn('Admin ${admin.id} requested playlists', { requestId });
```

---

### Line 15: error

**Original:**
```typescript
console.error('Admin auth failed for playlists GET:', error);
```

**Replacement:**
```typescript
logger.error('Admin auth failed for playlists GET:', { requestId }, error);
```

---

### Line 30: warn

**Original:**
```typescript
console.warn(`Admin ${admin.id} creating playlist`);
```

**Replacement:**
```typescript
logger.warn('Admin ${admin.id} creating playlist', { requestId });
```

---

### Line 32: error

**Original:**
```typescript
console.error('Admin auth failed for playlist creation:', error);
```

**Replacement:**
```typescript
logger.error('Admin auth failed for playlist creation:', { requestId }, error);
```

---

## app\api\admin\music\playlists\[id]\route.ts

Found 4 console statement(s):

### Line 12: warn

**Original:**
```typescript
console.warn(`Admin ${admin.id} updating playlist ${params.id}`);
```

**Replacement:**
```typescript
logger.warn('Admin ${admin.id} updating playlist ${params.id}', { requestId });
```

---

### Line 14: error

**Original:**
```typescript
console.error('Admin auth failed for playlist update:', error);
```

**Replacement:**
```typescript
logger.error('Admin auth failed for playlist update:', { requestId }, error);
```

---

### Line 30: warn

**Original:**
```typescript
console.warn(`Admin ${admin.id} deleting playlist ${params.id}`);
```

**Replacement:**
```typescript
logger.warn('Admin ${admin.id} deleting playlist ${params.id}', { requestId });
```

---

### Line 32: error

**Original:**
```typescript
console.error('Admin auth failed for playlist deletion:', error);
```

**Replacement:**
```typescript
logger.error('Admin auth failed for playlist deletion:', { requestId }, error);
```

---

## app\api\admin\music\playlists\[id]\tracks\route.ts

Found 4 console statement(s):

### Line 12: warn

**Original:**
```typescript
console.warn(`Admin ${admin.id} adding track to playlist ${params.id}`);
```

**Replacement:**
```typescript
logger.warn('Admin ${admin.id} adding track to playlist ${params.id}', { requestId });
```

---

### Line 14: error

**Original:**
```typescript
console.error('Admin auth failed for track addition:', error);
```

**Replacement:**
```typescript
logger.error('Admin auth failed for track addition:', { requestId }, error);
```

---

### Line 43: warn

**Original:**
```typescript
console.warn(`Admin ${admin.id} reordering tracks in playlist ${params.id}`);
```

**Replacement:**
```typescript
logger.warn('Admin ${admin.id} reordering tracks in playlist ${params.id}', { requestId });
```

---

### Line 45: error

**Original:**
```typescript
console.error('Admin auth failed for track reordering:', error);
```

**Replacement:**
```typescript
logger.error('Admin auth failed for track reordering:', { requestId }, error);
```

---

## app\api\admin\music\tracks\[id]\route.ts

Found 2 console statement(s):

### Line 12: warn

**Original:**
```typescript
console.warn(`Admin ${admin.id} deleting track ${params.id}`);
```

**Replacement:**
```typescript
logger.warn('Admin ${admin.id} deleting track ${params.id}', { requestId });
```

---

### Line 14: error

**Original:**
```typescript
console.error('Admin auth failed for track deletion:', error);
```

**Replacement:**
```typescript
logger.error('Admin auth failed for track deletion:', { requestId }, error);
```

---

## app\api\admin\notifications\route.ts

Found 3 console statement(s):

### Line 50: error

**Original:**
```typescript
console.error('Notification error:', error);
```

**Replacement:**
```typescript
logger.error('Notification error:', { requestId }, error);
```

---

### Line 72: error

**Original:**
```typescript
console.error('Notification history error:', error);
```

**Replacement:**
```typescript
logger.error('Notification history error:', { requestId }, error);
```

---

### Line 99: error

**Original:**
```typescript
console.error('Notification delete error:', error);
```

**Replacement:**
```typescript
logger.error('Notification delete error:', { requestId }, error);
```

---

## app\api\admin\nsfw\global\route.ts

Found 1 console statement(s):

### Line 36: error

**Original:**
```typescript
console.error('Error updating global NSFW setting:', error);
```

**Replacement:**
```typescript
logger.error('Error updating global NSFW setting:', { requestId }, error);
```

---

## app\api\admin\nsfw\stats\route.ts

Found 1 console statement(s):

### Line 39: error

**Original:**
```typescript
console.error('Error fetching NSFW stats:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching NSFW stats:', { requestId }, error);
```

---

## app\api\admin\printify-sync\route.ts

Found 5 console statement(s):

### Line 22: warn

**Original:**
```typescript
console.warn(`Sync retrieved ${allProducts.length} products from Printify`);
```

**Replacement:**
```typescript
logger.warn('Sync retrieved ${allProducts.length} products from Printify', { requestId });
```

---

### Line 26: warn

**Original:**
```typescript
console.warn(`After filtering: ${products.length} valid products to sync`);
```

**Replacement:**
```typescript
logger.warn('After filtering: ${products.length} valid products to sync', { requestId });
```

---

### Line 113: warn

**Original:**
```typescript
console.warn(`Unlocked product ${printifyProductId} (${printifyProduct.title})`);
```

**Replacement:**
```typescript
logger.warn('Unlocked product ${printifyProductId} (${printifyProduct.title})', { requestId });
```

---

### Line 116: error

**Original:**
```typescript
console.error(errorMsg);
```

**Replacement:**
```typescript
// TODO: Replace with logger.error()
```

⚠️ **Needs manual review**

---

### Line 131: error

**Original:**
```typescript
console.error('Printify sync failed:', error);
```

**Replacement:**
```typescript
logger.error('Printify sync failed:', { requestId }, error);
```

---

## app\api\admin\printify-unlock\route.ts

Found 1 console statement(s):

### Line 104: error

**Original:**
```typescript
console.error('Unlock failed:', error);
```

**Replacement:**
```typescript
logger.error('Unlock failed:', { requestId }, error);
```

---

## app\api\admin\reviews\route.ts

Found 1 console statement(s):

### Line 11: error

**Original:**
```typescript
console.error('Admin auth failed for reviews GET:', error);
```

**Replacement:**
```typescript
logger.error('Admin auth failed for reviews GET:', { requestId }, error);
```

---

## app\api\admin\reviews\[id]\approve\route.ts

Found 2 console statement(s):

### Line 12: warn

**Original:**
```typescript
console.warn(`Admin ${admin.id} approving review ${params.id}`);
```

**Replacement:**
```typescript
logger.warn('Admin ${admin.id} approving review ${params.id}', { requestId });
```

---

### Line 14: error

**Original:**
```typescript
console.error('Admin auth failed for review approval:', error);
```

**Replacement:**
```typescript
logger.error('Admin auth failed for review approval:', { requestId }, error);
```

---

## app\api\admin\reviews\[id]\route.ts

Found 2 console statement(s):

### Line 12: warn

**Original:**
```typescript
console.warn(`Admin ${admin.id} accessing review ${params.id}`);
```

**Replacement:**
```typescript
logger.warn('Admin ${admin.id} accessing review ${params.id}', { requestId });
```

---

### Line 14: error

**Original:**
```typescript
console.error('Admin auth failed for review deletion:', error);
```

**Replacement:**
```typescript
logger.error('Admin auth failed for review deletion:', { requestId }, error);
```

---

## app\api\admin\rewards\route.ts

Found 2 console statement(s):

### Line 56: error

**Original:**
```typescript
console.error('Rewards config fetch error:', error);
```

**Replacement:**
```typescript
logger.error('Rewards config fetch error:', { requestId }, error);
```

---

### Line 259: error

**Original:**
```typescript
console.error('Rewards config save error:', error);
```

**Replacement:**
```typescript
logger.error('Rewards config save error:', { requestId }, error);
```

---

## app\api\admin\runes\combos\route.ts

Found 2 console statement(s):

### Line 36: error

**Original:**
```typescript
console.error('Combos fetch error:', error);
```

**Replacement:**
```typescript
logger.error('Combos fetch error:', { requestId }, error);
```

---

### Line 154: error

**Original:**
```typescript
console.error('Combo save error:', error);
```

**Replacement:**
```typescript
logger.error('Combo save error:', { requestId }, error);
```

---

## app\api\admin\runes\combos\[id]\route.ts

Found 1 console statement(s):

### Line 73: error

**Original:**
```typescript
console.error('Combo delete error:', error);
```

**Replacement:**
```typescript
logger.error('Combo delete error:', { requestId }, error);
```

---

## app\api\admin\runes\route.ts

Found 2 console statement(s):

### Line 36: error

**Original:**
```typescript
console.error('Runes fetch error:', error);
```

**Replacement:**
```typescript
logger.error('Runes fetch error:', { requestId }, error);
```

---

### Line 138: error

**Original:**
```typescript
console.error('Rune save error:', error);
```

**Replacement:**
```typescript
logger.error('Rune save error:', { requestId }, error);
```

---

## app\api\admin\runes\[id]\route.ts

Found 1 console statement(s):

### Line 88: error

**Original:**
```typescript
console.error('Rune delete error:', error);
```

**Replacement:**
```typescript
logger.error('Rune delete error:', { requestId }, error);
```

---

## app\api\admin\seed-blog\route.ts

Found 2 console statement(s):

### Line 60: warn

**Original:**
```typescript
console.warn('Blog seeding requested from:', request.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Blog seeding requested from:', { requestId }, request.headers.get('user-agent'));
```

---

### Line 78: error

**Original:**
```typescript
console.error('Error seeding blog posts:', error);
```

**Replacement:**
```typescript
logger.error('Error seeding blog posts:', { requestId }, error);
```

---

## app\api\admin\shop\route.ts

Found 2 console statement(s):

### Line 124: error

**Original:**
```typescript
console.error('Shop API Error:', error);
```

**Replacement:**
```typescript
logger.error('Shop API Error:', { requestId }, error);
```

---

### Line 175: error

**Original:**
```typescript
console.error('Shop API Error:', error);
```

**Replacement:**
```typescript
logger.error('Shop API Error:', { requestId }, error);
```

---

## app\api\admin\users\route.ts

Found 1 console statement(s):

### Line 48: error

**Original:**
```typescript
console.error('Error fetching users:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching users:', { requestId }, error);
```

---

## app\api\admin\vouchers\stats\route.ts

Found 1 console statement(s):

### Line 75: error

**Original:**
```typescript
console.error('Error fetching voucher stats:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching voucher stats:', { requestId }, error);
```

---

## app\api\adults\catalog\route.safe.ts

Found 1 console statement(s):

### Line 114: error

**Original:**
```typescript
console.error('Catalog API error:', error);
```

**Replacement:**
```typescript
logger.error('Catalog API error:', { requestId }, error);
```

---

## app\api\adults\preview\route.safe.ts

Found 2 console statement(s):

### Line 245: error

**Original:**
```typescript
console.error('Failed to parse sliders JSON:', error);
```

**Replacement:**
```typescript
logger.error('Failed to parse sliders JSON:', { requestId }, error);
```

---

### Line 306: error

**Original:**
```typescript
console.error('Preview API error:', error);
```

**Replacement:**
```typescript
logger.error('Preview API error:', { requestId }, error);
```

---

## app\api\adults\purchase\route.safe.ts

Found 5 console statement(s):

### Line 56: error

**Original:**
```typescript
console.error('Idempotency check failed:', error);
```

**Replacement:**
```typescript
logger.error('Idempotency check failed:', { requestId }, error);
```

---

### Line 65: error

**Original:**
```typescript
console.error('Failed to store idempotency response:', error);
```

**Replacement:**
```typescript
logger.error('Failed to store idempotency response:', { requestId }, error);
```

---

### Line 110: error

**Original:**
```typescript
console.error('Petals purchase failed:', error);
```

**Replacement:**
```typescript
logger.error('Petals purchase failed:', { requestId }, error);
```

---

### Line 164: error

**Original:**
```typescript
console.error('Stripe checkout session creation failed:', error);
```

**Replacement:**
```typescript
logger.error('Stripe checkout session creation failed:', { requestId }, error);
```

---

### Line 314: error

**Original:**
```typescript
console.error('Purchase API error:', error);
```

**Replacement:**
```typescript
logger.error('Purchase API error:', { requestId }, error);
```

---

## app\api\age\confirm\route.ts

Found 1 console statement(s):

### Line 56: error

**Original:**
```typescript
console.error('Failed to confirm age', error);
```

**Replacement:**
```typescript
logger.error('Failed to confirm age', { requestId }, error);
```

---

## app\api\avatar\thumbnail\route.ts

Found 2 console statement(s):

### Line 132: error

**Original:**
```typescript
console.error('Thumbnail generation error:', error);
```

**Replacement:**
```typescript
logger.error('Thumbnail generation error:', { requestId }, error);
```

---

### Line 231: error

**Original:**
```typescript
console.error('Thumbnail generation error:', error);
```

**Replacement:**
```typescript
logger.error('Thumbnail generation error:', { requestId }, error);
```

---

## app\api\blog\posts\route.ts

Found 2 console statement(s):

### Line 17: warn

**Original:**
```typescript
console.warn(`Blog posts requested for category: ${category || 'all'}`);
```

**Replacement:**
```typescript
logger.warn('Blog posts requested for category: ${category || ', { requestId }, all'}`);
```

---

### Line 54: error

**Original:**
```typescript
console.error('Error fetching blog posts:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching blog posts:', { requestId }, error);
```

---

## app\api\checkout\coupons\route.ts

Found 2 console statement(s):

### Line 16: warn

**Original:**
```typescript
console.warn(`Coupon validation requested for: ${couponCode}`);
```

**Replacement:**
```typescript
logger.warn('Coupon validation requested for: ${couponCode}', { requestId });
```

---

### Line 27: error

**Original:**
```typescript
console.error('Error validating coupon:', error);
```

**Replacement:**
```typescript
logger.error('Error validating coupon:', { requestId }, error);
```

---

## app\api\checkout\route.ts

Found 1 console statement(s):

### Line 97: error

**Original:**
```typescript
console.error('Checkout API error:', error);
```

**Replacement:**
```typescript
logger.error('Checkout API error:', { requestId }, error);
```

---

## app\api\checkout\session\route.ts

Found 1 console statement(s):

### Line 149: error

**Original:**
```typescript
console.error('Error creating checkout session:', error);
```

**Replacement:**
```typescript
logger.error('Error creating checkout session:', { requestId }, error);
```

---

## app\api\clerk\webhook\route.ts

Found 5 console statement(s):

### Line 37: warn

**Original:**
```typescript
console.warn(`Clerk webhook received: ${body.type}`);
```

**Replacement:**
```typescript
logger.warn('Clerk webhook received: ${body.type}', { requestId });
```

---

### Line 52: error

**Original:**
```typescript
console.error('Error verifying webhook:', err);
```

**Replacement:**
```typescript
logger.error('Error verifying webhook:', { requestId }, err);
```

---

### Line 63: warn

**Original:**
```typescript
console.warn(`Creating user ${id} with ${email_addresses?.length || 0} email addresses`);
```

**Replacement:**
```typescript
logger.warn('Creating user ${id} with ${email_addresses?.length || 0} email addresses', { requestId });
```

---

### Line 95: error

**Original:**
```typescript
console.error('Error setting avatar preset:', error);
```

**Replacement:**
```typescript
logger.error('Error setting avatar preset:', { requestId }, error);
```

---

### Line 103: warn

**Original:**
```typescript
console.warn(`Updating user ${id} metadata`);
```

**Replacement:**
```typescript
logger.warn('Updating user ${id} metadata', { requestId });
```

---

## app\api\clerk-proxy\[...path]\route.ts

Found 2 console statement(s):

### Line 33: error

**Original:**
```typescript
console.error('Clerk proxy error:', error);
```

**Replacement:**
```typescript
logger.error('Clerk proxy error:', { requestId }, error);
```

---

### Line 65: error

**Original:**
```typescript
console.error('Clerk proxy error:', error);
```

**Replacement:**
```typescript
logger.error('Clerk proxy error:', { requestId }, error);
```

---

## app\api\community\emotes\route.ts

Found 1 console statement(s):

### Line 22: error

**Original:**
```typescript
console.error('Failed to fetch user emotes:', error.message, error.stack);
```

**Replacement:**
```typescript
logger.error('Failed to fetch user emotes:', { requestId }, error.message, error.stack);
```

---

## app\api\community\interaction\request\route.ts

Found 1 console statement(s):

### Line 21: error

**Original:**
```typescript
console.error('Interaction request failed:', error.message, error.stack);
```

**Replacement:**
```typescript
logger.error('Interaction request failed:', { requestId }, error.message, error.stack);
```

---

## app\api\community\posts\route.ts

Found 1 console statement(s):

### Line 96: error

**Original:**
```typescript
console.error('Error fetching community posts:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching community posts:', { requestId }, error);
```

---

## app\api\community\quests\complete\route.ts

Found 1 console statement(s):

### Line 53: error

**Original:**
```typescript
console.error('Quest completion failed:', error.message, error.stack);
```

**Replacement:**
```typescript
logger.error('Quest completion failed:', { requestId }, error.message, error.stack);
```

---

## app\api\community\training\confirm\route.ts

Found 1 console statement(s):

### Line 30: error

**Original:**
```typescript
console.error('Training confirmation failed:', error.message, error.stack);
```

**Replacement:**
```typescript
logger.error('Training confirmation failed:', { requestId }, error.message, error.stack);
```

---

## app\api\contact\route.ts

Found 2 console statement(s):

### Line 43: error

**Original:**
```typescript
console.error('Error sending contact message:', error);
```

**Replacement:**
```typescript
logger.error('Error sending contact message:', { requestId }, error);
```

---

### Line 103: error

**Original:**
```typescript
console.error('Error fetching contact messages:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching contact messages:', { requestId }, error);
```

---

## app\api\coupons\attach\route.ts

Found 1 console statement(s):

### Line 28: warn

**Original:**
```typescript
console.warn(`Attaching coupon to user: ${userId}`);
```

**Replacement:**
```typescript
logger.warn('Attaching coupon to user: ${userId}', { requestId });
```

---

## app\api\coupons\preview\route.ts

Found 1 console statement(s):

### Line 52: warn

**Original:**
```typescript
console.warn(`Coupon preview requested for ${items?.length || 0} items`);
```

**Replacement:**
```typescript
logger.warn('Coupon preview requested for ${items?.length || 0} items', { requestId });
```

---

## app\api\debug\printify\route.ts

Found 1 console statement(s):

### Line 9: warn

**Original:**
```typescript
console.warn('Printify debug requested from:', request.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Printify debug requested from:', { requestId }, request.headers.get('user-agent'));
```

---

## app\api\gacha\route.ts

Found 2 console statement(s):

### Line 16: warn

**Original:**
```typescript
console.warn('Gacha pull requested from:', request.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Gacha pull requested from:', { requestId }, request.headers.get('user-agent'));
```

---

### Line 136: error

**Original:**
```typescript
console.error('Error in gacha:', error);
```

**Replacement:**
```typescript
logger.error('Error in gacha:', { requestId }, error);
```

---

## app\api\health\clerk\route.ts

Found 1 console statement(s):

### Line 65: error

**Original:**
```typescript
console.error('Clerk health check failed:', error);
```

**Replacement:**
```typescript
logger.error('Clerk health check failed:', { requestId }, error);
```

---

## app\api\log-client-error\route.ts

Found 2 console statement(s):

### Line 91: error

**Original:**
```typescript
console.error('[ClientError]', JSON.stringify(logEntry, null, 2));
```

**Replacement:**
```typescript
logger.error('[ClientError]', { requestId }, JSON.stringify(logEntry, null, 2));
```

---

### Line 97: error

**Original:**
```typescript
console.error('[CLIENT-ERROR-API] Failed to process error log:', error);
```

**Replacement:**
```typescript
logger.error('[CLIENT-ERROR-API] Failed to process error log:', { requestId }, error);
```

---

## app\api\metrics\route.ts

Found 6 console statement(s):

### Line 11: warn

**Original:**
```typescript
console.warn(`Metrics requested: ${Object.keys(metrics).length} metric types`);
```

**Replacement:**
```typescript
logger.warn('Metrics requested: ${Object.keys(metrics).length} metric types', { requestId });
```

---

### Line 16: warn

**Original:**
```typescript
console.warn(`Historical metrics from: ${new Date(oneDayAgo).toISOString()}`);
```

**Replacement:**
```typescript
logger.warn('Historical metrics from: ${new Date(oneDayAgo).toISOString()}', { requestId });
```

---

### Line 35: error

**Original:**
```typescript
console.error('Error fetching metrics:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching metrics:', { requestId }, error);
```

---

### Line 43: warn

**Original:**
```typescript
console.warn('Metrics POST received:', { metricCount: Object.keys(data).length });
```

**Replacement:**
```typescript
logger.warn('Metrics POST received:', { requestId }, { metricCount: Object.keys(data).length });
```

---

### Line 48: warn

**Original:**
```typescript
console.warn('Metrics data received:', Object.keys(data));
```

**Replacement:**
```typescript
logger.warn('Metrics data received:', { requestId }, Object.keys(data));
```

---

### Line 57: error

**Original:**
```typescript
console.error('Error storing metrics:', error);
```

**Replacement:**
```typescript
logger.error('Error storing metrics:', { requestId }, error);
```

---

## app\api\music\playlist\route.ts

Found 1 console statement(s):

### Line 20: error

**Original:**
```typescript
console.error('Music playlist API error:', error);
```

**Replacement:**
```typescript
logger.error('Music playlist API error:', { requestId }, error);
```

---

## app\api\newsletter\signup\route.ts

Found 1 console statement(s):

### Line 18: error

**Original:**
```typescript
console.error('Newsletter signup error:', error);
```

**Replacement:**
```typescript
logger.error('Newsletter signup error:', { requestId }, error);
```

---

## app\api\orders\by-session\route.ts

Found 1 console statement(s):

### Line 90: error

**Original:**
```typescript
console.error('Order fetch error', error);
```

**Replacement:**
```typescript
logger.error('Order fetch error', { requestId }, error);
```

---

## app\api\orders\route.ts

Found 2 console statement(s):

### Line 17: warn

**Original:**
```typescript
console.warn('Orders requested from:', req.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Orders requested from:', { requestId }, req.headers.get('user-agent'));
```

---

### Line 88: error

**Original:**
```typescript
console.error('Error fetching orders:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching orders:', { requestId }, error);
```

---

## app\api\orders\[id]\route.ts

Found 1 console statement(s):

### Line 37: error

**Original:**
```typescript
console.error('Error fetching order:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching order:', { requestId }, error);
```

---

## app\api\petals\balance\route.ts

Found 1 console statement(s):

### Line 22: error

**Original:**
```typescript
console.error('petals/balance error', err);
```

**Replacement:**
```typescript
logger.error('petals/balance error', { requestId }, err);
```

---

## app\api\petals\click\route.ts

Found 3 console statement(s):

### Line 165: warn

**Original:**
```typescript
console.warn('Achievement creation failed (may not exist yet):', err.message);
```

**Replacement:**
```typescript
logger.warn('Achievement creation failed (may not exist yet):', { requestId }, err.message);
```

---

### Line 189: warn

**Original:**
```typescript
console.warn('Milestone achievement creation failed (may not exist yet):', err.message);
```

**Replacement:**
```typescript
logger.warn('Milestone achievement creation failed (may not exist yet):', { requestId }, err.message);
```

---

### Line 207: error

**Original:**
```typescript
console.error('Petal click error:', error);
```

**Replacement:**
```typescript
logger.error('Petal click error:', { requestId }, error);
```

---

## app\api\petals\collect\route.ts

Found 1 console statement(s):

### Line 84: error

**Original:**
```typescript
console.error('Petals collection failed:', error);
```

**Replacement:**
```typescript
logger.error('Petals collection failed:', { requestId }, error);
```

---

## app\api\petals\global\route.ts

Found 1 console statement(s):

### Line 9: error

**Original:**
```typescript
console.error('Error fetching global petals:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching global petals:', { requestId }, error);
```

---

## app\api\petals\me\route.ts

Found 2 console statement(s):

### Line 15: error

**Original:**
```typescript
console.error('Error fetching user petals:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching user petals:', { requestId }, error);
```

---

### Line 42: error

**Original:**
```typescript
console.error('Error incrementing user petals:', error);
```

**Replacement:**
```typescript
logger.error('Error incrementing user petals:', { requestId }, error);
```

---

## app\api\petals\merge\route.ts

Found 2 console statement(s):

### Line 12: warn

**Original:**
```typescript
console.warn('Petal merge requested from:', request.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Petal merge requested from:', { requestId }, request.headers.get('user-agent'));
```

---

### Line 148: error

**Original:**
```typescript
console.error('Guest merge error:', error);
```

**Replacement:**
```typescript
logger.error('Guest merge error:', { requestId }, error);
```

---

## app\api\petals\route.ts

Found 3 console statement(s):

### Line 78: error

**Original:**
```typescript
console.error('Error earning petals:', error);
```

**Replacement:**
```typescript
logger.error('Error earning petals:', { requestId }, error);
```

---

### Line 89: warn

**Original:**
```typescript
console.warn('Petal balance requested from:', request.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Petal balance requested from:', { requestId }, request.headers.get('user-agent'));
```

---

### Line 142: error

**Original:**
```typescript
console.error('Error fetching petal data:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching petal data:', { requestId }, error);
```

---

## app\api\petals\spend\route.ts

Found 1 console statement(s):

### Line 15: warn

**Original:**
```typescript
console.warn('Petal spend request:', { userId, amount, reason, metadata: metadata || {} });
```

**Replacement:**
```typescript
logger.warn('Petal spend request:', { requestId }, { userId, amount, reason, metadata: metadata || {} });
```

---

## app\api\prefs\nsfw\affirm\route.ts

Found 1 console statement(s):

### Line 23: error

**Original:**
```typescript
console.error('NSFW affirmation error:', error);
```

**Replacement:**
```typescript
logger.error('NSFW affirmation error:', { requestId }, error);
```

---

## app\api\printify\products\route.ts

Found 2 console statement(s):

### Line 55: error

**Original:**
```typescript
console.error(`Printify API error: ${res.status} - ${errorText}`);
```

**Replacement:**
```typescript
logger.error('Printify API error: ${res.status} - ${errorText}', { requestId });
```

---

### Line 104: error

**Original:**
```typescript
console.error('Printify fetch failed:', err.message);
```

**Replacement:**
```typescript
logger.error('Printify fetch failed:', { requestId }, err.message);
```

---

## app\api\products\featured\route.ts

Found 1 console statement(s):

### Line 68: error

**Original:**
```typescript
console.error('Error fetching featured products:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching featured products:', { requestId }, error);
```

---

## app\api\profile\equip\route.ts

Found 1 console statement(s):

### Line 27: error

**Original:**
```typescript
console.error('Error equipping item:', error);
```

**Replacement:**
```typescript
logger.error('Error equipping item:', { requestId }, error);
```

---

## app\api\profile\equip-banner\route.ts

Found 1 console statement(s):

### Line 28: error

**Original:**
```typescript
console.error('Error equipping banner:', error);
```

**Replacement:**
```typescript
logger.error('Error equipping banner:', { requestId }, error);
```

---

## app\api\profile\presets\route.ts

Found 2 console statement(s):

### Line 13: warn

**Original:**
```typescript
console.warn('Profile presets requested from:', req.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Profile presets requested from:', { requestId }, req.headers.get('user-agent'));
```

---

### Line 29: error

**Original:**
```typescript
console.error('Error fetching profile presets:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching profile presets:', { requestId }, error);
```

---

## app\api\quests\claim\route.ts

Found 5 console statement(s):

### Line 30: warn

**Original:**
```typescript
console.warn('Daily quest cap check bypassed - Redis not configured', { cacheKey });
```

**Replacement:**
```typescript
logger.warn('Daily quest cap check bypassed - Redis not configured', { requestId }, { cacheKey });
```

---

### Line 87: warn

**Original:**
```typescript
console.warn(`Quest claim tracking key: ${dailyCapKey} (Redis disabled, using DB)`);
```

**Replacement:**
```typescript
logger.warn('Quest claim tracking key: ${dailyCapKey} (Redis disabled, using DB)', { requestId });
```

---

### Line 97: warn

**Original:**
```typescript
//   console.warn("Redis get failed", error);
```

**Replacement:**
```typescript
logger.warn('Redis get failed', { requestId }, error);
```

---

### Line 142: warn

**Original:**
```typescript
//   console.warn("Redis set failed", error);
```

**Replacement:**
```typescript
logger.warn('Redis set failed', { requestId }, error);
```

---

### Line 168: error

**Original:**
```typescript
console.error('Quest claim error', error);
```

**Replacement:**
```typescript
logger.error('Quest claim error', { requestId }, error);
```

---

## app\api\quests\list\route.ts

Found 1 console statement(s):

### Line 51: error

**Original:**
```typescript
console.error('Quest list error:', error);
```

**Replacement:**
```typescript
logger.error('Quest list error:', { requestId }, error);
```

---

## app\api\quests\track\route.ts

Found 1 console statement(s):

### Line 117: error

**Original:**
```typescript
console.error('Quest track error', error);
```

**Replacement:**
```typescript
logger.error('Quest track error', { requestId }, error);
```

---

## app\api\rate-limit.ts

Found 1 console statement(s):

### Line 41: warn

**Original:**
```typescript
console.warn('Redis rate limit failed, falling back to memory:', error);
```

**Replacement:**
```typescript
logger.warn('Redis rate limit failed, falling back to memory:', { requestId }, error);
```

---

## app\api\runes\unlock\route.ts

Found 2 console statement(s):

### Line 95: warn

**Original:**
```typescript
console.warn('Rune unlocked:', { userId, slug, unlockId: unlock.id });
```

**Replacement:**
```typescript
logger.warn('Rune unlocked:', { requestId }, { userId, slug, unlockId: unlock.id });
```

---

### Line 113: error

**Original:**
```typescript
console.error('Rune unlock failed:', error);
```

**Replacement:**
```typescript
logger.error('Rune unlock failed:', { requestId }, error);
```

---

## app\api\shop\orders\route.ts

Found 1 console statement(s):

### Line 54: error

**Original:**
```typescript
console.error('Error creating order:', error);
```

**Replacement:**
```typescript
logger.error('Error creating order:', { requestId }, error);
```

---

## app\api\shop\orders\[id]\route.ts

Found 1 console statement(s):

### Line 7: warn

**Original:**
```typescript
console.warn('Deprecated shop orders endpoint accessed for order:', params.id);
```

**Replacement:**
```typescript
logger.warn('Deprecated shop orders endpoint accessed for order:', { requestId }, params.id);
```

---

## app\api\shop\products\route.ts

Found 3 console statement(s):

### Line 17: error

**Original:**
```typescript
console.error('Failed to fetch from v1 Printify API:', response.status);
```

**Replacement:**
```typescript
logger.error('Failed to fetch from v1 Printify API:', { requestId }, response.status);
```

---

### Line 24: error

**Original:**
```typescript
console.error('Printify API returned error:', data.error);
```

**Replacement:**
```typescript
logger.error('Printify API returned error:', { requestId }, data.error);
```

---

### Line 69: error

**Original:**
```typescript
console.error('Shop products API error:', error);
```

**Replacement:**
```typescript
logger.error('Shop products API error:', { requestId }, error);
```

---

## app\api\shop\products\[id]\route.ts

Found 1 console statement(s):

### Line 44: error

**Original:**
```typescript
console.error('Error fetching product:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching product:', { requestId }, error);
```

---

## app\api\shop\purchase\route.ts

Found 1 console statement(s):

### Line 56: warn

**Original:**
```typescript
console.warn('Shop purchase completed:', {
```

**Replacement:**
```typescript
// TODO: Replace with logger.warn()
```

⚠️ **Needs manual review**

---

## app\api\soapstones\route.ts

Found 1 console statement(s):

### Line 18: error

**Original:**
```typescript
console.error('soapstones:get', e);
```

**Replacement:**
```typescript
logger.error('soapstones:get', { requestId }, e);
```

---

## app\api\storage\delete\route.ts

Found 1 console statement(s):

### Line 45: error

**Original:**
```typescript
console.error('Storage delete error', error);
```

**Replacement:**
```typescript
logger.error('Storage delete error', { requestId }, error);
```

---

## app\api\storage\upload-url\route.ts

Found 1 console statement(s):

### Line 50: error

**Original:**
```typescript
console.error('upload error', err);
```

**Replacement:**
```typescript
logger.error('upload error', { requestId }, err);
```

---

## app\api\stripe\webhook\route.ts

Found 8 console statement(s):

### Line 26: error

**Original:**
```typescript
console.error('Missing Stripe signature header');
```

**Replacement:**
```typescript
logger.error('Missing Stripe signature header', { requestId });
```

---

### Line 31: error

**Original:**
```typescript
console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
```

**Replacement:**
```typescript
logger.error('Missing STRIPE_WEBHOOK_SECRET environment variable', { requestId });
```

---

### Line 53: warn

**Original:**
```typescript
console.warn('Payment succeeded:', {
```

**Replacement:**
```typescript
// TODO: Replace with logger.warn()
```

⚠️ **Needs manual review**

---

### Line 63: error

**Original:**
```typescript
console.error('Payment failed:', {
```

**Replacement:**
```typescript
// TODO: Replace with logger.error()
```

⚠️ **Needs manual review**

---

### Line 77: error

**Original:**
```typescript
console.error('Webhook error:', error);
```

**Replacement:**
```typescript
logger.error('Webhook error:', { requestId }, error);
```

---

### Line 106: error

**Original:**
```typescript
console.error(`Order not found for Stripe session: ${session.id}`);
```

**Replacement:**
```typescript
logger.error('Order not found for Stripe session: ${session.id}', { requestId });
```

---

### Line 160: error

**Original:**
```typescript
console.error('Error handling checkout completed:', error);
```

**Replacement:**
```typescript
logger.error('Error handling checkout completed:', { requestId }, error);
```

---

### Line 233: error

**Original:**
```typescript
console.error('Error creating Printify order:', error);
```

**Replacement:**
```typescript
logger.error('Error creating Printify order:', { requestId }, error);
```

---

## app\api\system-check\route.ts

Found 1 console statement(s):

### Line 21: error

**Original:**
```typescript
console.error('System check failed:', error);
```

**Replacement:**
```typescript
logger.error('System check failed:', { requestId }, error);
```

---

## app\api\test-inngest\route.ts

Found 2 console statement(s):

### Line 40: error

**Original:**
```typescript
console.error('Error testing Inngest:', error);
```

**Replacement:**
```typescript
logger.error('Error testing Inngest:', { requestId }, error);
```

---

### Line 81: error

**Original:**
```typescript
console.error('Error sending custom event:', error);
```

**Replacement:**
```typescript
logger.error('Error sending custom event:', { requestId }, error);
```

---

## app\api\test-simple\route.ts

Found 1 console statement(s):

### Line 14: error

**Original:**
```typescript
console.error('Error in simple test:', error);
```

**Replacement:**
```typescript
logger.error('Error in simple test:', { requestId }, error);
```

---

## app\api\titles\award\route.ts

Found 1 console statement(s):

### Line 53: error

**Original:**
```typescript
console.error('Title award error:', err);
```

**Replacement:**
```typescript
logger.error('Title award error:', { requestId }, err);
```

---

## app\api\trade\fuse\route.ts

Found 1 console statement(s):

### Line 55: error

**Original:**
```typescript
console.error('trade/fuse error', err);
```

**Replacement:**
```typescript
logger.error('trade/fuse error', { requestId }, err);
```

---

## app\api\trade\inventory\route.ts

Found 1 console statement(s):

### Line 56: error

**Original:**
```typescript
console.error('trade/inventory error', err);
```

**Replacement:**
```typescript
logger.error('trade/inventory error', { requestId }, err);
```

---

## app\api\trade\offer\route.ts

Found 2 console statement(s):

### Line 11: warn

**Original:**
```typescript
console.warn('Trade offer requested from:', req.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Trade offer requested from:', { requestId }, req.headers.get('user-agent'));
```

---

### Line 24: error

**Original:**
```typescript
console.error('Error processing trade offer:', error);
```

**Replacement:**
```typescript
logger.error('Error processing trade offer:', { requestId }, error);
```

---

## app\api\trade\offers\route.ts

Found 1 console statement(s):

### Line 15: error

**Original:**
```typescript
console.error('trade/offers error', err);
```

**Replacement:**
```typescript
logger.error('trade/offers error', { requestId }, err);
```

---

## app\api\trade\propose\route.ts

Found 1 console statement(s):

### Line 19: error

**Original:**
```typescript
console.error('trade/propose error', err);
```

**Replacement:**
```typescript
logger.error('trade/propose error', { requestId }, err);
```

---

## app\api\trade\route.ts

Found 1 console statement(s):

### Line 12: warn

**Original:**
```typescript
console.warn('Trade list requested from:', req.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Trade list requested from:', { requestId }, req.headers.get('user-agent'));
```

---

## app\api\user\avatar\route.ts

Found 2 console statement(s):

### Line 79: error

**Original:**
```typescript
console.error('user/avatar GET error', err);
```

**Replacement:**
```typescript
logger.error('user/avatar GET error', { requestId }, err);
```

---

### Line 143: error

**Original:**
```typescript
console.error('user/avatar POST error', err);
```

**Replacement:**
```typescript
logger.error('user/avatar POST error', { requestId }, err);
```

---

## app\api\user\files\route.ts

Found 1 console statement(s):

### Line 25: error

**Original:**
```typescript
console.error('Files error:', err);
```

**Replacement:**
```typescript
logger.error('Files error:', { requestId }, err);
```

---

## app\api\user\profile\route.ts

Found 2 console statement(s):

### Line 46: error

**Original:**
```typescript
console.error('Error fetching user profile:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching user profile:', { requestId }, error);
```

---

### Line 90: error

**Original:**
```typescript
console.error('Error updating user profile:', error);
```

**Replacement:**
```typescript
logger.error('Error updating user profile:', { requestId }, error);
```

---

## app\api\user\state\route.ts

Found 2 console statement(s):

### Line 13: warn

**Original:**
```typescript
console.warn('User state requested from:', req.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('User state requested from:', { requestId }, req.headers.get('user-agent'));
```

---

### Line 66: error

**Original:**
```typescript
console.error('Error fetching user state:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching user state:', { requestId }, error);
```

---

## app\api\user\titles\route.ts

Found 1 console statement(s):

### Line 25: error

**Original:**
```typescript
console.error('Titles error:', err);
```

**Replacement:**
```typescript
logger.error('Titles error:', { requestId }, err);
```

---

## app\api\v1\achievements\unlock\route.ts

Found 3 console statement(s):

### Line 107: warn

**Original:**
```typescript
console.warn('Failed to track achievement unlock analytics:', analyticsError);
```

**Replacement:**
```typescript
logger.warn('Failed to track achievement unlock analytics:', { requestId }, analyticsError);
```

---

### Line 142: error

**Original:**
```typescript
console.error('Failed to award achievement petals:', petalResult.error);
```

**Replacement:**
```typescript
logger.error('Failed to award achievement petals:', { requestId }, petalResult.error);
```

---

### Line 208: error

**Original:**
```typescript
console.error('Error unlocking achievement:', error);
```

**Replacement:**
```typescript
logger.error('Error unlocking achievement:', { requestId }, error);
```

---

## app\api\v1\achievements\[userId]\route.ts

Found 2 console statement(s):

### Line 62: warn

**Original:**
```typescript
console.warn(`Achievement request completed in ${duration}ms`);
```

**Replacement:**
```typescript
logger.warn('Achievement request completed in ${duration}ms', { requestId });
```

---

### Line 233: error

**Original:**
```typescript
console.error('Achievement error after', duration, 'ms:', error);
```

**Replacement:**
```typescript
logger.error('Achievement error after', { requestId }, duration, 'ms:', error);
```

---

## app\api\v1\admin\feature-flags\route.ts

Found 2 console statement(s):

### Line 84: error

**Original:**
```typescript
console.error('Error fetching admin feature flags:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching admin feature flags:', { requestId }, error);
```

---

### Line 125: error

**Original:**
```typescript
console.error('Error updating feature flag:', error);
```

**Replacement:**
```typescript
logger.error('Error updating feature flag:', { requestId }, error);
```

---

## app\api\v1\analytics\session\route.ts

Found 2 console statement(s):

### Line 76: error

**Original:**
```typescript
console.error('Session analytics error:', error);
```

**Replacement:**
```typescript
logger.error('Session analytics error:', { requestId }, error);
```

---

### Line 142: error

**Original:**
```typescript
console.error('Session stats error:', error);
```

**Replacement:**
```typescript
logger.error('Session stats error:', { requestId }, error);
```

---

## app\api\v1\avatar\export\route.safe.ts

Found 9 console statement(s):

### Line 23: warn

**Original:**
```typescript
console.warn('Avatar export requested:', {
```

**Replacement:**
```typescript
// TODO: Replace with logger.warn()
```

⚠️ **Needs manual review**

---

### Line 97: error

**Original:**
```typescript
console.error('Avatar export error:', error);
```

**Replacement:**
```typescript
logger.error('Avatar export error:', { requestId }, error);
```

---

### Line 105: warn

**Original:**
```typescript
console.warn('Generating GLB export with quality:', quality, 'config keys:', Object.keys(config));
```

**Replacement:**
```typescript
logger.warn('Generating GLB export with quality:', { requestId }, quality, 'config keys:', Object.keys(config));
```

---

### Line 116: warn

**Original:**
```typescript
console.warn('Generating FBX export with quality:', quality);
```

**Replacement:**
```typescript
logger.warn('Generating FBX export with quality:', { requestId }, quality);
```

---

### Line 127: warn

**Original:**
```typescript
console.warn('Generating OBJ export with quality:', quality);
```

**Replacement:**
```typescript
logger.warn('Generating OBJ export with quality:', { requestId }, quality);
```

---

### Line 138: warn

**Original:**
```typescript
console.warn('Generating PNG export with quality:', quality);
```

**Replacement:**
```typescript
logger.warn('Generating PNG export with quality:', { requestId }, quality);
```

---

### Line 149: warn

**Original:**
```typescript
console.warn('Generating JPG export with quality:', quality);
```

**Replacement:**
```typescript
logger.warn('Generating JPG export with quality:', { requestId }, quality);
```

---

### Line 160: warn

**Original:**
```typescript
console.warn('Generating SVG export, config gender:', config.gender || 'female');
```

**Replacement:**
```typescript
logger.warn('Generating SVG export, config gender:', { requestId }, config.gender || 'female');
```

---

### Line 170: warn

**Original:**
```typescript
console.warn(`Creating download URL for ${username}, format: ${format}`);
```

**Replacement:**
```typescript
logger.warn('Creating download URL for ${username}, format: ${format}', { requestId });
```

---

## app\api\v1\avatar\generate\route.safe.ts

Found 2 console statement(s):

### Line 40: error

**Original:**
```typescript
console.error('Avatar generation error:', error);
```

**Replacement:**
```typescript
logger.error('Avatar generation error:', { requestId }, error);
```

---

### Line 55: warn

**Original:**
```typescript
console.warn('Generating avatar with style:', style, 'theme:', theme);
```

**Replacement:**
```typescript
logger.warn('Generating avatar with style:', { requestId }, style, 'theme:', theme);
```

---

## app\api\v1\avatar\load\route.safe.ts

Found 2 console statement(s):

### Line 11: warn

**Original:**
```typescript
console.warn('Avatar load requested from:', request.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Avatar load requested from:', { requestId }, request.headers.get('user-agent'));
```

---

### Line 60: error

**Original:**
```typescript
console.error('Avatar load error:', error);
```

**Replacement:**
```typescript
logger.error('Avatar load error:', { requestId }, error);
```

---

## app\api\v1\avatar\save\route.safe.ts

Found 1 console statement(s):

### Line 339: error

**Original:**
```typescript
console.error('Avatar save error:', error);
```

**Replacement:**
```typescript
logger.error('Avatar save error:', { requestId }, error);
```

---

## app\api\v1\cart\route.ts

Found 3 console statement(s):

### Line 11: warn

**Original:**
```typescript
console.warn('Cart GET requested from:', req.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Cart GET requested from:', { requestId }, req.headers.get('user-agent'));
```

---

### Line 63: error

**Original:**
```typescript
console.error('Error fetching cart:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching cart:', { requestId }, error);
```

---

### Line 144: error

**Original:**
```typescript
console.error('Error updating cart:', error);
```

**Replacement:**
```typescript
logger.error('Error updating cart:', { requestId }, error);
```

---

## app\api\v1\cart\[id]\route.ts

Found 1 console statement(s):

### Line 34: error

**Original:**
```typescript
console.error('Error deleting cart item:', error);
```

**Replacement:**
```typescript
logger.error('Error deleting cart item:', { requestId }, error);
```

---

## app\api\v1\character\config\route.ts

Found 2 console statement(s):

### Line 139: error

**Original:**
```typescript
console.error('Failed to fetch character config:', error);
```

**Replacement:**
```typescript
logger.error('Failed to fetch character config:', { requestId }, error);
```

---

### Line 304: error

**Original:**
```typescript
console.error('Failed to save character config:', error);
```

**Replacement:**
```typescript
logger.error('Failed to save character config:', { requestId }, error);
```

---

## app\api\v1\character\presets\route.ts

Found 1 console statement(s):

### Line 93: error

**Original:**
```typescript
console.error('Character presets fetch error', error);
```

**Replacement:**
```typescript
logger.error('Character presets fetch error', { requestId }, error);
```

---

## app\api\v1\character\presets\unlock\route.ts

Found 1 console statement(s):

### Line 140: error

**Original:**
```typescript
console.error('Character preset unlock error:', error);
```

**Replacement:**
```typescript
logger.error('Character preset unlock error:', { requestId }, error);
```

---

## app\api\v1\checkout\order\route.ts

Found 4 console statement(s):

### Line 110: warn

**Original:**
```typescript
console.warn(
```

**Replacement:**
```typescript
// TODO: Replace with logger.warn()
```

⚠️ **Needs manual review**

---

### Line 119: error

**Original:**
```typescript
console.error('[Printify] Order submission failed:', error);
```

**Replacement:**
```typescript
logger.error('[Printify] Order submission failed:', { requestId }, error);
```

---

### Line 139: error

**Original:**
```typescript
console.error('[Printify] Failed to log error to database:', dbError);
```

**Replacement:**
```typescript
logger.error('[Printify] Failed to log error to database:', { requestId }, dbError);
```

---

### Line 177: error

**Original:**
```typescript
console.error('[Printify] Failed to get order sync status:', error);
```

**Replacement:**
```typescript
logger.error('[Printify] Failed to get order sync status:', { requestId }, error);
```

---

## app\api\v1\checkout\session\route.ts

Found 1 console statement(s):

### Line 28: error

**Original:**
```typescript
console.error('[checkout/session] Stripe not configured - missing STRIPE_SECRET_KEY');
```

**Replacement:**
```typescript
logger.error('[checkout/session] Stripe not configured - missing STRIPE_SECRET_KEY', { requestId });
```

---

## app\api\v1\comments\like\route.ts

Found 1 console statement(s):

### Line 90: error

**Original:**
```typescript
console.error('Comment like error:', error);
```

**Replacement:**
```typescript
logger.error('Comment like error:', { requestId }, error);
```

---

## app\api\v1\comments\report\route.ts

Found 1 console statement(s):

### Line 85: error

**Original:**
```typescript
console.error('Comment report error:', error);
```

**Replacement:**
```typescript
logger.error('Comment report error:', { requestId }, error);
```

---

## app\api\v1\comments\route.ts

Found 2 console statement(s):

### Line 113: error

**Original:**
```typescript
console.error('Comments fetch error:', error);
```

**Replacement:**
```typescript
logger.error('Comments fetch error:', { requestId }, error);
```

---

### Line 220: error

**Original:**
```typescript
console.error('Comment creation error:', error);
```

**Replacement:**
```typescript
logger.error('Comment creation error:', { requestId }, error);
```

---

## app\api\v1\comments\[id]\route.ts

Found 2 console statement(s):

### Line 95: error

**Original:**
```typescript
console.error('Comment update error:', error);
```

**Replacement:**
```typescript
logger.error('Comment update error:', { requestId }, error);
```

---

### Line 159: error

**Original:**
```typescript
console.error('Comment deletion error:', error);
```

**Replacement:**
```typescript
logger.error('Comment deletion error:', { requestId }, error);
```

---

## app\api\v1\community\soapstones\route.ts

Found 2 console statement(s):

### Line 63: error

**Original:**
```typescript
console.error('Error fetching soapstones:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching soapstones:', { requestId }, error);
```

---

### Line 100: error

**Original:**
```typescript
console.error('Error creating soapstone:', error);
```

**Replacement:**
```typescript
logger.error('Error creating soapstone:', { requestId }, error);
```

---

## app\api\v1\community\soapstones\[id]\reply\route.ts

Found 2 console statement(s):

### Line 19: warn

**Original:**
```typescript
console.warn('Soapstone reply requested for ID:', soapstoneId);
```

**Replacement:**
```typescript
logger.warn('Soapstone reply requested for ID:', { requestId }, soapstoneId);
```

---

### Line 34: error

**Original:**
```typescript
console.error('Error replying to soapstone:', error);
```

**Replacement:**
```typescript
logger.error('Error replying to soapstone:', { requestId }, error);
```

---

## app\api\v1\content\blog\route.ts

Found 2 console statement(s):

### Line 82: error

**Original:**
```typescript
console.error('Sanity blog content fetch failed:', error);
```

**Replacement:**
```typescript
logger.error('Sanity blog content fetch failed:', { requestId }, error);
```

---

### Line 130: error

**Original:**
```typescript
console.error('Blog content API error:', error);
```

**Replacement:**
```typescript
logger.error('Blog content API error:', { requestId }, error);
```

---

## app\api\v1\content\blog\[slug]\route.ts

Found 1 console statement(s):

### Line 43: error

**Original:**
```typescript
console.error('Blog post API error:', error);
```

**Replacement:**
```typescript
logger.error('Blog post API error:', { requestId }, error);
```

---

## app\api\v1\content\community\route.ts

Found 1 console statement(s):

### Line 92: error

**Original:**
```typescript
console.error('Community content API error:', error);
```

**Replacement:**
```typescript
logger.error('Community content API error:', { requestId }, error);
```

---

## app\api\v1\cosmetics\equip\route.ts

Found 1 console statement(s):

### Line 221: error

**Original:**
```typescript
console.error('[Cosmetics Equip] Error:', error);
```

**Replacement:**
```typescript
logger.error('[Cosmetics Equip] Error:', { requestId }, error);
```

---

## app\api\v1\cosmetics\list\route.ts

Found 1 console statement(s):

### Line 69: error

**Original:**
```typescript
console.error('Error fetching cosmetics:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching cosmetics:', { requestId }, error);
```

---

## app\api\v1\cosmetics\route.ts

Found 1 console statement(s):

### Line 76: error

**Original:**
```typescript
console.error('[Cosmetics GET] Error:', error);
```

**Replacement:**
```typescript
logger.error('[Cosmetics GET] Error:', { requestId }, error);
```

---

## app\api\v1\creator\load\route.ts

Found 1 console statement(s):

### Line 67: error

**Original:**
```typescript
console.error('CREATOR load error:', error);
```

**Replacement:**
```typescript
logger.error('CREATOR load error:', { requestId }, error);
```

---

## app\api\v1\creator\save\route.ts

Found 1 console statement(s):

### Line 343: error

**Original:**
```typescript
console.error('CREATOR save error:', error);
```

**Replacement:**
```typescript
logger.error('CREATOR save error:', { requestId }, error);
```

---

## app\api\v1\discount-rewards\route.ts

Found 1 console statement(s):

### Line 98: error

**Original:**
```typescript
console.error('Error fetching discount rewards:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching discount rewards:', { requestId }, error);
```

---

## app\api\v1\discounts\available\route.ts

Found 1 console statement(s):

### Line 70: error

**Original:**
```typescript
console.error('Error fetching available discounts:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching available discounts:', { requestId }, error);
```

---

## app\api\v1\feed\route.ts

Found 1 console statement(s):

### Line 138: error

**Original:**
```typescript
console.error('Activity feed error:', error);
```

**Replacement:**
```typescript
logger.error('Activity feed error:', { requestId }, error);
```

---

## app\api\v1\game-saves\auth\route.ts

Found 2 console statement(s):

### Line 7: warn

**Original:**
```typescript
console.warn('Game save auth check from:', request.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Game save auth check from:', { requestId }, request.headers.get('user-agent'));
```

---

### Line 28: error

**Original:**
```typescript
console.error('Auth check error:', error);
```

**Replacement:**
```typescript
logger.error('Auth check error:', { requestId }, error);
```

---

## app\api\v1\game-saves\route.ts

Found 3 console statement(s):

### Line 128: error

**Original:**
```typescript
console.error('Error saving game:', error);
```

**Replacement:**
```typescript
logger.error('Error saving game:', { requestId }, error);
```

---

### Line 138: error

**Original:**
```typescript
console.error('Error in game save handler:', error);
```

**Replacement:**
```typescript
logger.error('Error in game save handler:', { requestId }, error);
```

---

### Line 190: error

**Original:**
```typescript
console.error('Error fetching game saves:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching game saves:', { requestId }, error);
```

---

## app\api\v1\games\achievements\route.ts

Found 2 console statement(s):

### Line 13: warn

**Original:**
```typescript
console.warn('Game achievements requested from:', request.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Game achievements requested from:', { requestId }, request.headers.get('user-agent'));
```

---

### Line 90: error

**Original:**
```typescript
console.error('Error fetching achievements:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching achievements:', { requestId }, error);
```

---

## app\api\v1\games\coupons\route.ts

Found 2 console statement(s):

### Line 13: warn

**Original:**
```typescript
console.warn('Game coupons requested from:', request.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Game coupons requested from:', { requestId }, request.headers.get('user-agent'));
```

---

### Line 60: error

**Original:**
```typescript
console.error('Error fetching coupons:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching coupons:', { requestId }, error);
```

---

## app\api\v1\games\inventory\route.ts

Found 2 console statement(s):

### Line 13: warn

**Original:**
```typescript
console.warn('Game inventory requested from:', req.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Game inventory requested from:', { requestId }, req.headers.get('user-agent'));
```

---

### Line 52: error

**Original:**
```typescript
console.error('Error fetching inventory:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching inventory:', { requestId }, error);
```

---

## app\api\v1\games\route.ts

Found 2 console statement(s):

### Line 9: warn

**Original:**
```typescript
console.warn('Games list requested from:', request.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Games list requested from:', { requestId }, request.headers.get('user-agent'));
```

---

### Line 34: error

**Original:**
```typescript
console.error('Games API error:', error);
```

**Replacement:**
```typescript
logger.error('Games API error:', { requestId }, error);
```

---

## app\api\v1\games\start\route.ts

Found 1 console statement(s):

### Line 140: error

**Original:**
```typescript
console.error('Game start error:', error);
```

**Replacement:**
```typescript
logger.error('Game start error:', { requestId }, error);
```

---

## app\api\v1\games\stats\route.ts

Found 2 console statement(s):

### Line 13: warn

**Original:**
```typescript
console.warn('Game stats requested from:', request.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Game stats requested from:', { requestId }, request.headers.get('user-agent'));
```

---

### Line 96: error

**Original:**
```typescript
console.error('Error fetching game stats:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching game stats:', { requestId }, error);
```

---

## app\api\v1\games\teaser\route.ts

Found 1 console statement(s):

### Line 55: error

**Original:**
```typescript
console.error('Error fetching games:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching games:', { requestId }, error);
```

---

## app\api\v1\games\[slug]\route.ts

Found 1 console statement(s):

### Line 46: error

**Original:**
```typescript
console.error('Game detail API error:', error);
```

**Replacement:**
```typescript
logger.error('Game detail API error:', { requestId }, error);
```

---

## app\api\v1\leaderboard\route.ts

Found 1 console statement(s):

### Line 57: error

**Original:**
```typescript
console.error('Leaderboard error:', error);
```

**Replacement:**
```typescript
logger.error('Leaderboard error:', { requestId }, error);
```

---

## app\api\v1\leaderboard\submit\route.ts

Found 1 console statement(s):

### Line 156: error

**Original:**
```typescript
console.error('Score submission error:', error);
```

**Replacement:**
```typescript
logger.error('Score submission error:', { requestId }, error);
```

---

## app\api\v1\leaderboards\global-petals\route.ts

Found 1 console statement(s):

### Line 60: error

**Original:**
```typescript
console.error('Error fetching global petal leaderboard:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching global petal leaderboard:', { requestId }, error);
```

---

## app\api\v1\leaderboards\[gameId]\route.ts

Found 4 console statement(s):

### Line 208: warn

**Original:**
```typescript
console.warn('Friend table not available, using user-only scope:', err.message);
```

**Replacement:**
```typescript
logger.warn('Friend table not available, using user-only scope:', { requestId }, err.message);
```

---

### Line 295: error

**Original:**
```typescript
console.error('Leaderboard error:', error);
```

**Replacement:**
```typescript
logger.error('Leaderboard error:', { requestId }, error);
```

---

### Line 382: warn

**Original:**
```typescript
console.warn('Checking achievements for:', { userId, gameId, score, category, metadata });
```

**Replacement:**
```typescript
logger.warn('Checking achievements for:', { requestId }, { userId, gameId, score, category, metadata });
```

---

### Line 389: warn

**Original:**
```typescript
console.warn(`High score achievement candidate: ${score} in ${gameId}`);
```

**Replacement:**
```typescript
logger.warn('High score achievement candidate: ${score} in ${gameId}', { requestId });
```

---

## app\api\v1\notifications\route.ts

Found 2 console statement(s):

### Line 89: error

**Original:**
```typescript
console.error('Notifications fetch error', error);
```

**Replacement:**
```typescript
logger.error('Notifications fetch error', { requestId }, error);
```

---

### Line 126: error

**Original:**
```typescript
console.error('Mark notifications read error', error);
```

**Replacement:**
```typescript
logger.error('Mark notifications read error', { requestId }, error);
```

---

## app\api\v1\nsfw\verify\route.ts

Found 1 console statement(s):

### Line 93: error

**Original:**
```typescript
console.error('[NSFW Verify] Error:', error);
```

**Replacement:**
```typescript
logger.error('[NSFW Verify] Error:', { requestId }, error);
```

---

## app\api\v1\orders\recent\route.ts

Found 1 console statement(s):

### Line 66: error

**Original:**
```typescript
console.error('Failed to fetch recent orders:', error);
```

**Replacement:**
```typescript
logger.error('Failed to fetch recent orders:', { requestId }, error);
```

---

## app\api\v1\orders\route.ts

Found 3 console statement(s):

### Line 100: error

**Original:**
```typescript
console.error('Order creation error:', error);
```

**Replacement:**
```typescript
logger.error('Order creation error:', { requestId }, error);
```

---

### Line 145: warn

**Original:**
```typescript
console.warn('Orders requested with filters:', { limit, offset, status: status || 'all' });
```

**Replacement:**
```typescript
logger.warn('Orders requested with filters:', { requestId }, { limit, offset, status: status || 'all' });
```

---

### Line 181: error

**Original:**
```typescript
console.error('Order history error:', error);
```

**Replacement:**
```typescript
logger.error('Order history error:', { requestId }, error);
```

---

## app\api\v1\parties\invitations\[id]\route.ts

Found 1 console statement(s):

### Line 73: warn

**Original:**
```typescript
console.warn('Invitation updated:', {
```

**Replacement:**
```typescript
// TODO: Replace with logger.warn()
```

⚠️ **Needs manual review**

---

## app\api\v1\petals\balance\route.ts

Found 1 console statement(s):

### Line 46: error

**Original:**
```typescript
console.error('Error fetching petal balance:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching petal balance:', { requestId }, error);
```

---

## app\api\v1\petals\grant-daily\route.ts

Found 1 console statement(s):

### Line 50: error

**Original:**
```typescript
console.error('Error granting daily petals:', error);
```

**Replacement:**
```typescript
logger.error('Error granting daily petals:', { requestId }, error);
```

---

## app\api\v1\petals\purchase\route.ts

Found 1 console statement(s):

### Line 134: error

**Original:**
```typescript
console.error('Error processing petal purchase', error);
```

**Replacement:**
```typescript
logger.error('Error processing petal purchase', { requestId }, error);
```

---

## app\api\v1\petals\rewards\claim\route.ts

Found 1 console statement(s):

### Line 156: error

**Original:**
```typescript
console.error('[Claim Petal Reward] Error:', error);
```

**Replacement:**
```typescript
logger.error('[Claim Petal Reward] Error:', { requestId }, error);
```

---

## app\api\v1\petals\shop\discounts\purchase\route.ts

Found 1 console statement(s):

### Line 218: error

**Original:**
```typescript
console.error('Error purchasing discount reward:', error);
```

**Replacement:**
```typescript
logger.error('Error purchasing discount reward:', { requestId }, error);
```

---

## app\api\v1\petals\shop\discounts\route.ts

Found 1 console statement(s):

### Line 121: error

**Original:**
```typescript
console.error('Error fetching discount rewards:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching discount rewards:', { requestId }, error);
```

---

## app\api\v1\petals\shop\purchase\route.ts

Found 1 console statement(s):

### Line 330: error

**Original:**
```typescript
console.error('[Petal Shop Purchase] Error:', error);
```

**Replacement:**
```typescript
logger.error('[Petal Shop Purchase] Error:', { requestId }, error);
```

---

## app\api\v1\petals\shop\route.ts

Found 1 console statement(s):

### Line 91: error

**Original:**
```typescript
console.error('Error fetching shop items:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching shop items:', { requestId }, error);
```

---

## app\api\v1\petals\summary\route.ts

Found 1 console statement(s):

### Line 186: error

**Original:**
```typescript
console.error('Error fetching petal summary:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching petal summary:', { requestId }, error);
```

---

## app\api\v1\petals\sync\route.ts

Found 1 console statement(s):

### Line 126: error

**Original:**
```typescript
console.error('[Petal Sync] Error:', error);
```

**Replacement:**
```typescript
logger.error('[Petal Sync] Error:', { requestId }, error);
```

---

## app\api\v1\petals\transactions\route.ts

Found 1 console statement(s):

### Line 31: error

**Original:**
```typescript
console.error('Error fetching petal transactions:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching petal transactions:', { requestId }, error);
```

---

## app\api\v1\petals\vouchers\list\route.ts

Found 1 console statement(s):

### Line 78: error

**Original:**
```typescript
console.error('[Voucher List] Error:', error);
```

**Replacement:**
```typescript
logger.error('[Voucher List] Error:', { requestId }, error);
```

---

## app\api\v1\petals\vouchers\purchase\route.ts

Found 1 console statement(s):

### Line 201: error

**Original:**
```typescript
console.error('[Voucher Purchase] Error:', error);
```

**Replacement:**
```typescript
logger.error('[Voucher Purchase] Error:', { requestId }, error);
```

---

## app\api\v1\petals\wallet\route.ts

Found 1 console statement(s):

### Line 72: error

**Original:**
```typescript
console.error('[Petals Wallet] Error:', error);
```

**Replacement:**
```typescript
logger.error('[Petals Wallet] Error:', { requestId }, error);
```

---

## app\api\v1\praise\route.ts

Found 2 console statement(s):

### Line 139: error

**Original:**
```typescript
console.error('Error creating praise:', error);
```

**Replacement:**
```typescript
logger.error('Error creating praise:', { requestId }, error);
```

---

### Line 215: error

**Original:**
```typescript
console.error('Error fetching praises:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching praises:', { requestId }, error);
```

---

## app\api\v1\presence\friends\route.ts

Found 1 console statement(s):

### Line 69: error

**Original:**
```typescript
console.error('Friends presence error', error);
```

**Replacement:**
```typescript
logger.error('Friends presence error', { requestId }, error);
```

---

## app\api\v1\presence\heartbeat\route.ts

Found 1 console statement(s):

### Line 70: error

**Original:**
```typescript
console.error('Presence heartbeat error', error);
```

**Replacement:**
```typescript
logger.error('Presence heartbeat error', { requestId }, error);
```

---

## app\api\v1\printify\enhanced-sync\route.ts

Found 4 console statement(s):

### Line 18: warn

**Original:**
```typescript
console.warn('Starting enhanced Printify sync...', { validateLinks, fullSync });
```

**Replacement:**
```typescript
logger.warn('Starting enhanced Printify sync...', { requestId }, { validateLinks, fullSync });
```

---

### Line 30: warn

**Original:**
```typescript
console.warn('Enhanced Printify sync completed:', result);
```

**Replacement:**
```typescript
logger.warn('Enhanced Printify sync completed:', { requestId }, result);
```

---

### Line 37: error

**Original:**
```typescript
console.error('Enhanced Printify sync failed:', error);
```

**Replacement:**
```typescript
logger.error('Enhanced Printify sync failed:', { requestId }, error);
```

---

### Line 68: error

**Original:**
```typescript
console.error('Failed to get sync status:', error);
```

**Replacement:**
```typescript
logger.error('Failed to get sync status:', { requestId }, error);
```

---

## app\api\v1\printify\inventory\route.ts

Found 6 console statement(s):

### Line 16: warn

**Original:**
```typescript
console.warn('Printify inventory sync requested from:', request.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Printify inventory sync requested from:', { requestId }, request.headers.get('user-agent'));
```

---

### Line 31: warn

**Original:**
```typescript
console.warn('Advanced Printify service initialized for sync');
```

**Replacement:**
```typescript
logger.warn('Advanced Printify service initialized for sync', { requestId });
```

---

### Line 45: error

**Original:**
```typescript
console.error('Inventory sync API error:', error);
```

**Replacement:**
```typescript
logger.error('Inventory sync API error:', { requestId }, error);
```

---

### Line 65: warn

**Original:**
```typescript
console.warn('Printify inventory status requested from:', request.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Printify inventory status requested from:', { requestId }, request.headers.get('user-agent'));
```

---

### Line 79: error

**Original:**
```typescript
console.error('Failed to get inventory status:', error);
```

**Replacement:**
```typescript
logger.error('Failed to get inventory status:', { requestId }, error);
```

---

### Line 97: error

**Original:**
```typescript
console.error('Inventory status API error:', error);
```

**Replacement:**
```typescript
logger.error('Inventory status API error:', { requestId }, error);
```

---

## app\api\v1\printify\inventory\sync\route.ts

Found 2 console statement(s):

### Line 92: error

**Original:**
```typescript
console.error('Inventory sync error:', error);
```

**Replacement:**
```typescript
logger.error('Inventory sync error:', { requestId }, error);
```

---

### Line 136: error

**Original:**
```typescript
console.error('Inventory status error:', error);
```

**Replacement:**
```typescript
logger.error('Inventory status error:', { requestId }, error);
```

---

## app\api\v1\printify\products\route.ts

Found 6 console statement(s):

### Line 34: warn

**Original:**
```typescript
console.warn('[printify/products] Printify not configured - missing API key or shop ID');
```

**Replacement:**
```typescript
logger.warn('[printify/products] Printify not configured - missing API key or shop ID', { requestId });
```

---

### Line 62: error

**Original:**
```typescript
console.error('Background sync failed:', error);
```

**Replacement:**
```typescript
logger.error('Background sync failed:', { requestId }, error);
```

---

### Line 70: error

**Original:**
```typescript
console.error('Printify service error:', serviceError);
```

**Replacement:**
```typescript
logger.error('Printify service error:', { requestId }, serviceError);
```

---

### Line 150: error

**Original:**
```typescript
console.error('Printify products API error:', error);
```

**Replacement:**
```typescript
logger.error('Printify products API error:', { requestId }, error);
```

---

### Line 208: warn

**Original:**
```typescript
console.warn(`Background sync completed: ${products.length} products fetched`);
```

**Replacement:**
```typescript
logger.warn('Background sync completed: ${products.length} products fetched', { requestId });
```

---

### Line 213: error

**Original:**
```typescript
console.error('Background sync failed:', error);
```

**Replacement:**
```typescript
logger.error('Background sync failed:', { requestId }, error);
```

---

## app\api\v1\printify\recommendations\route.ts

Found 1 console statement(s):

### Line 76: error

**Original:**
```typescript
console.error('Printify recommendations error:', error);
```

**Replacement:**
```typescript
logger.error('Printify recommendations error:', { requestId }, error);
```

---

## app\api\v1\printify\sync\route.ts

Found 1 console statement(s):

### Line 71: error

**Original:**
```typescript
console.error('Printify sync API error:', error);
```

**Replacement:**
```typescript
logger.error('Printify sync API error:', { requestId }, error);
```

---

## app\api\v1\printify\sync-status\route.ts

Found 1 console statement(s):

### Line 22: error

**Original:**
```typescript
console.error('Failed to get sync status:', error);
```

**Replacement:**
```typescript
logger.error('Failed to get sync status:', { requestId }, error);
```

---

## app\api\v1\products\featured\route.ts

Found 4 console statement(s):

### Line 303: error

**Original:**
```typescript
console.error('[API] Response validation failed:', validated.error);
```

**Replacement:**
```typescript
logger.error('[API] Response validation failed:', { requestId }, validated.error);
```

---

### Line 348: error

**Original:**
```typescript
console.error('[API] Printify response validation failed:', validated.error);
```

**Replacement:**
```typescript
logger.error('[API] Printify response validation failed:', { requestId }, validated.error);
```

---

### Line 358: warn

**Original:**
```typescript
console.warn('[API] Printify fetch failed:', error);
```

**Replacement:**
```typescript
logger.warn('[API] Printify fetch failed:', { requestId }, error);
```

---

### Line 374: error

**Original:**
```typescript
console.error('[API] Featured products endpoint error:', error);
```

**Replacement:**
```typescript
logger.error('[API] Featured products endpoint error:', { requestId }, error);
```

---

## app\api\v1\products\soapstones\[id]\praise\route.ts

Found 1 console statement(s):

### Line 126: error

**Original:**
```typescript
console.error('Failed to praise soapstone:', error);
```

**Replacement:**
```typescript
logger.error('Failed to praise soapstone:', { requestId }, error);
```

---

## app\api\v1\products\[id]\route.ts

Found 2 console statement(s):

### Line 164: warn

**Original:**
```typescript
console.warn('[Products API] Printify fallback failed:', printifyError);
```

**Replacement:**
```typescript
logger.warn('[Products API] Printify fallback failed:', { requestId }, printifyError);
```

---

### Line 173: error

**Original:**
```typescript
console.error('[Products API] Error:', error);
```

**Replacement:**
```typescript
logger.error('[Products API] Error:', { requestId }, error);
```

---

## app\api\v1\products\[id]\soapstones\route.ts

Found 4 console statement(s):

### Line 61: warn

**Original:**
```typescript
console.warn('ProductSoapstone table missing. Returning empty soapstone list.');
```

**Replacement:**
```typescript
logger.warn('ProductSoapstone table missing. Returning empty soapstone list.', { requestId });
```

---

### Line 70: error

**Original:**
```typescript
console.error('Failed to fetch product soapstones:', error);
```

**Replacement:**
```typescript
logger.error('Failed to fetch product soapstones:', { requestId }, error);
```

---

### Line 150: warn

**Original:**
```typescript
console.warn('ProductSoapstone table missing. Unable to create soapstone.');
```

**Replacement:**
```typescript
logger.warn('ProductSoapstone table missing. Unable to create soapstone.', { requestId });
```

---

### Line 159: error

**Original:**
```typescript
console.error('Failed to create product soapstone:', error);
```

**Replacement:**
```typescript
logger.error('Failed to create product soapstone:', { requestId }, error);
```

---

## app\api\v1\profile\update\route.ts

Found 1 console statement(s):

### Line 57: error

**Original:**
```typescript
console.error('Profile update error:', error);
```

**Replacement:**
```typescript
logger.error('Profile update error:', { requestId }, error);
```

---

## app\api\v1\profile\[username]\route.ts

Found 1 console statement(s):

### Line 193: error

**Original:**
```typescript
console.error('Profile fetch error:', error);
```

**Replacement:**
```typescript
logger.error('Profile fetch error:', { requestId }, error);
```

---

## app\api\v1\recommendations\route.ts

Found 1 console statement(s):

### Line 71: error

**Original:**
```typescript
console.error('[Recommendations] Error:', error);
```

**Replacement:**
```typescript
logger.error('[Recommendations] Error:', { requestId }, error);
```

---

## app\api\v1\search\route.ts

Found 1 console statement(s):

### Line 208: warn

**Original:**
```typescript
console.warn('Search query:', { query, userId: currentUserId, filters: filters || {} });
```

**Replacement:**
```typescript
logger.warn('Search query:', { requestId }, { query, userId: currentUserId, filters: filters || {} });
```

---

## app\api\v1\shop\products\route.ts

Found 2 console statement(s):

### Line 37: error

**Original:**
```typescript
console.error(' Printify API error:', printifyResponse.status, errorText);
```

**Replacement:**
```typescript
logger.error(' Printify API error:', { requestId }, printifyResponse.status, errorText);
```

---

### Line 73: error

**Original:**
```typescript
console.error(' Error fetching products:', error);
```

**Replacement:**
```typescript
logger.error(' Error fetching products:', { requestId }, error);
```

---

## app\api\v1\soapstone\place\route.ts

Found 7 console statement(s):

### Line 277: error

**Original:**
```typescript
console.error('Soapstone placement error:', error);
```

**Replacement:**
```typescript
logger.error('Soapstone placement error:', { requestId }, error);
```

---

### Line 348: warn

**Original:**
```typescript
console.warn('Checking rate limits for user:', userId, { oneHourAgo, oneDayAgo });
```

**Replacement:**
```typescript
logger.warn('Checking rate limits for user:', { requestId }, userId, { oneHourAgo, oneDayAgo });
```

---

### Line 377: warn

**Original:**
```typescript
console.warn('Checking for duplicates:', { userId, messagelength: message.length, page });
```

**Replacement:**
```typescript
logger.warn('Checking for duplicates:', { requestId }, { userId, messagelength: message.length, page });
```

---

### Line 388: warn

**Original:**
```typescript
console.warn('Checking location cooldown:', { userId, page, section: section || 'none' });
```

**Replacement:**
```typescript
logger.warn('Checking location cooldown:', { requestId }, { userId, page, section: section || 'none' });
```

---

### Line 434: warn

**Original:**
```typescript
console.warn(`Updated soapstone stats for user ${userId}`);
```

**Replacement:**
```typescript
logger.warn('Updated soapstone stats for user ${userId}', { requestId });
```

---

### Line 447: warn

**Original:**
```typescript
console.warn('Getting soapstone count for user:', userId);
```

**Replacement:**
```typescript
logger.warn('Getting soapstone count for user:', { requestId }, userId);
```

---

### Line 462: warn

**Original:**
```typescript
console.warn(
```

**Replacement:**
```typescript
// TODO: Replace with logger.warn()
```

⚠️ **Needs manual review**

---

## app\api\v1\soapstone\route.ts

Found 2 console statement(s):

### Line 79: error

**Original:**
```typescript
console.error('Error fetching soapstone messages:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching soapstone messages:', { requestId }, error);
```

---

### Line 183: error

**Original:**
```typescript
console.error('Error creating soapstone message:', error);
```

**Replacement:**
```typescript
logger.error('Error creating soapstone message:', { requestId }, error);
```

---

## app\api\v1\soapstone\[id]\appraise\route.ts

Found 1 console statement(s):

### Line 58: error

**Original:**
```typescript
console.error('[Soapstone Appraise] Error:', error);
```

**Replacement:**
```typescript
logger.error('[Soapstone Appraise] Error:', { requestId }, error);
```

---

## app\api\v1\social\follow\route.ts

Found 2 console statement(s):

### Line 95: error

**Original:**
```typescript
console.error('Follow error:', error);
```

**Replacement:**
```typescript
logger.error('Follow error:', { requestId }, error);
```

---

### Line 162: error

**Original:**
```typescript
console.error('Unfollow error:', error);
```

**Replacement:**
```typescript
logger.error('Unfollow error:', { requestId }, error);
```

---

## app\api\v1\sync-external\route.ts

Found 2 console statement(s):

### Line 9: warn

**Original:**
```typescript
console.warn('External data sync triggered from:', request.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('External data sync triggered from:', { requestId }, request.headers.get('user-agent'));
```

---

### Line 21: error

**Original:**
```typescript
console.error('External sync error:', error);
```

**Replacement:**
```typescript
logger.error('External sync error:', { requestId }, error);
```

---

## app\api\v1\test-sentry\route.ts

Found 1 console statement(s):

### Line 8: warn

**Original:**
```typescript
console.warn('Sentry test error triggered from:', request.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('Sentry test error triggered from:', { requestId }, request.headers.get('user-agent'));
```

---

## app\api\v1\vouchers\from-petals\route.ts

Found 1 console statement(s):

### Line 246: error

**Original:**
```typescript
console.error('[Voucher Purchase] Error:', error);
```

**Replacement:**
```typescript
logger.error('[Voucher Purchase] Error:', { requestId }, error);
```

---

## app\api\v1\vouchers\redeem\route.ts

Found 1 console statement(s):

### Line 112: error

**Original:**
```typescript
console.error('[Voucher Redeem] Error:', error);
```

**Replacement:**
```typescript
logger.error('[Voucher Redeem] Error:', { requestId }, error);
```

---

## app\api\v1\websocket\route.ts

Found 2 console statement(s):

### Line 12: warn

**Original:**
```typescript
console.warn('WebSocket server requested from:', request.headers.get('user-agent'));
```

**Replacement:**
```typescript
logger.warn('WebSocket server requested from:', { requestId }, request.headers.get('user-agent'));
```

---

### Line 58: error

**Original:**
```typescript
console.error('WebSocket API error:', error);
```

**Replacement:**
```typescript
logger.error('WebSocket API error:', { requestId }, error);
```

---

## app\api\v1\wishlist\route.ts

Found 3 console statement(s):

### Line 105: warn

**Original:**
```typescript
console.warn('Added to wishlist:', { itemId: wishlistItem.id, productId });
```

**Replacement:**
```typescript
logger.warn('Added to wishlist:', { requestId }, { itemId: wishlistItem.id, productId });
```

---

### Line 133: error

**Original:**
```typescript
console.error('Error toggling wishlist item:', error);
```

**Replacement:**
```typescript
logger.error('Error toggling wishlist item:', { requestId }, error);
```

---

### Line 210: error

**Original:**
```typescript
console.error('Error fetching wishlist:', error);
```

**Replacement:**
```typescript
logger.error('Error fetching wishlist:', { requestId }, error);
```

---

## app\api\webhooks\clerk\route.ts

Found 5 console statement(s):

### Line 33: warn

**Original:**
```typescript
console.warn('Clerk webhook payload type:', body.type || 'unknown');
```

**Replacement:**
```typescript
logger.warn('Clerk webhook payload type:', { requestId }, body.type || 'unknown');
```

---

### Line 48: error

**Original:**
```typescript
console.error('Error verifying webhook:', err);
```

**Replacement:**
```typescript
logger.error('Error verifying webhook:', { requestId }, err);
```

---

### Line 75: error

**Original:**
```typescript
console.error('Error creating user profile:', error);
```

**Replacement:**
```typescript
logger.error('Error creating user profile:', { requestId }, error);
```

---

### Line 96: error

**Original:**
```typescript
console.error('Error updating user profile:', error);
```

**Replacement:**
```typescript
logger.error('Error updating user profile:', { requestId }, error);
```

---

### Line 114: error

**Original:**
```typescript
console.error('Error soft deleting user profile:', error);
```

**Replacement:**
```typescript
logger.error('Error soft deleting user profile:', { requestId }, error);
```

---

## app\api\webhooks\inngest\route.ts

Found 1 console statement(s):

### Line 88: error

**Original:**
```typescript
console.error('Error processing webhook:', error);
```

**Replacement:**
```typescript
logger.error('Error processing webhook:', { requestId }, error);
```

---

## app\api\webhooks\stripe\route.ts

Found 4 console statement(s):

### Line 76: warn

**Original:**
```typescript
console.warn('Simulated Printify order creation:', {
```

**Replacement:**
```typescript
// TODO: Replace with logger.warn()
```

⚠️ **Needs manual review**

---

### Line 109: error

**Original:**
```typescript
console.error('Invalid Stripe signature', err);
```

**Replacement:**
```typescript
logger.error('Invalid Stripe signature', { requestId }, err);
```

---

### Line 199: warn

**Original:**
```typescript
console.warn('Coupon redemption update failed', e);
```

**Replacement:**
```typescript
logger.warn('Coupon redemption update failed', { requestId }, e);
```

---

### Line 206: error

**Original:**
```typescript
console.error('Printify order creation failed:', printifyError);
```

**Replacement:**
```typescript
logger.error('Printify order creation failed:', { requestId }, printifyError);
```

---

## app\api\_debug\posthog\route.ts

Found 1 console statement(s):

### Line 66: error

**Original:**
```typescript
console.error('PostHog debug error:', error);
```

**Replacement:**
```typescript
logger.error('PostHog debug error:', { requestId }, error);
```

---

## app\api\_health\route.ts

Found 1 console statement(s):

### Line 68: error

**Original:**
```typescript
console.error('Health check failed:', error);
```

**Replacement:**
```typescript
logger.error('Health check failed:', { requestId }, error);
```

---

