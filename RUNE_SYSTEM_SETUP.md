# 🌸 Rune System Setup Guide

## Overview

The Rune System is a comprehensive petal economy enhancement that adds collectible runes, combo mechanics, and purchase-based rewards to your Otakumori project.

## 🚀 Quick Start

### 1. Database Setup

First, ensure your database is up to date with the new schema:

```bash
# Generate and apply Prisma migrations
npx prisma generate
npx prisma migrate dev --name add_rune_system

# Seed the database with initial rune data
npm run db:seed:runes
```

### 2. Environment Variables

Ensure these environment variables are set in your `.env.local`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Database
DATABASE_URL="postgresql://..."

# Petal System
PETAL_SALT="your-secure-salt-here"
```

### 3. Test the System

Start your development server and test the components:

```bash
npm run dev
```

Visit these URLs to test:

- **Homepage**: `http://localhost:3000` - Should show cherry tree with floating petals
- **Admin Panel**: `http://localhost:3000/admin` - Manage runes, rewards, and burst settings
- **Petal Collection**: Click petals on homepage to test collection
- **Guest System**: Test as unauthenticated user (capped at 50 petals)

## 🏗️ System Architecture

### Core Components

#### 1. **Database Models** (`prisma/schema.prisma`)

- `SiteConfig` - Global configuration singleton
- `RuneDef` - Rune definitions with Printify UPC mappings
- `RuneCombo` - Rune combination requirements
- `UserRune` - User-acquired runes
- `Order` - Purchase records with rune associations
- `PetalLedger` - Petal transaction history

#### 2. **Frontend Components**

- `CherryTree` - Animated cherry blossom tree overlay
- `Ps1Petals` - PS1-style floating petals with click interaction
- `PetalHUD` - Floating petal count display
- `AdminRunesPage` - Rune management interface
- `AdminRewardsPage` - Reward configuration
- `AdminBurstPage` - Burst effect settings

#### 3. **API Routes**

- `/api/petals/collect` - Petal collection endpoint
- `/api/petals/merge` - Guest-to-user petal merging
- `/api/stripe/webhook` - Stripe purchase processing
- `/api/orders/by-session` - Order details for thank-you page
- `/api/admin/runes/*` - Rune management APIs
- `/api/admin/rewards` - Reward configuration API
- `/api/admin/burst` - Burst configuration API

## 🎯 Key Features

### 1. **Petal Economy**

- **Guest Collection**: Unauthenticated users can collect up to 50 petals
- **User Collection**: Authenticated users have unlimited collection
- **Merge System**: Guest petals automatically merge on sign-in
- **Rate Limiting**: 10 clicks per second per user/IP

### 2. **Rune System**

- **8 Base Runes**: Sakura, Moonlight, Star Fire, Water Flow, Earth Stone, Wind Song, Lightning Bolt, Ice Crystal
- **Printify Integration**: UPC-to-rune mapping for automatic assignment
- **Gacha Fallback**: Unmapped UPCs get random rune assignment
- **Combo Mechanics**: 4 predefined combinations with special effects

### 3. **Purchase Rewards**

- **Base Rate**: 1 petal per $3 spent (configurable)
- **Streak Bonuses**: Daily purchase multipliers
- **Seasonal Adjustments**: Configurable seasonal multipliers
- **Daily Caps**: Soft cap (200) and hard cap (400) system
- **First Purchase Bonus**: +20 petals for new customers

### 4. **Burst Effects**

- **Purchase Triggers**: Automatic bursts on successful purchases
- **Combo Reveals**: Special bursts when rune combinations are completed
- **Performance Optimized**: Respects `prefers-reduced-motion`
- **Configurable**: Particle counts, cooldowns, and rarity weights

## 🔧 Configuration

### Site Configuration

The system uses a singleton `SiteConfig` record with these sections:

```typescript
interface SiteConfig {
  guestCap: number; // Guest petal limit
  burst: BurstConfig; // Burst effect settings
  tree: TreeConfig; // Cherry tree animation
  theme: ThemeConfig; // Visual customization
  seasonal: SeasonalConfig; // Seasonal adjustments
  rewards: RewardsConfig; // Petal reward rules
  runes: RuneConfig; // Rune system settings
}
```

### Admin Panel Access

Navigate to `/admin` to access:

- **Rune System**: Manage rune definitions and combos
- **Rewards**: Configure petal reward rates and caps
- **Burst System**: Adjust burst effects and performance

## 🧪 Testing

### 1. **Petal Collection Test**

```bash
# Test petal collection API
curl -X POST http://localhost:3000/api/petals/collect \
  -H "Content-Type: application/json" \
  -d '{"guestSessionId": "test_session"}'
```

### 2. **Stripe Webhook Test**

```bash
# Test webhook processing (requires Stripe CLI)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 3. **Database Validation**

```bash
# Check database state
npm run db:test

# Verify rune data
npx prisma studio
```

## 🚨 Troubleshooting

### Common Issues

#### 1. **Petal Collection Not Working**

- Check rate limiting in browser console
- Verify `PETAL_SALT` environment variable
- Check database connection

#### 2. **Admin Panel Access Denied**

- Ensure user is signed in with Clerk
- Check Clerk environment variables
- Verify database user records

#### 3. **Stripe Webhook Failures**

- Verify webhook secret in environment
- Check Stripe dashboard for webhook status
- Review server logs for signature verification errors

#### 4. **Database Migration Issues**

```bash
# Reset database (WARNING: Destructive)
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

### Performance Monitoring

```bash
# Check API health
npm run api:health

# Monitor database performance
npx prisma studio
```

## 📈 Production Deployment

### 1. **Environment Setup**

- Set production Stripe keys
- Configure production Clerk domain
- Set secure `PETAL_SALT`
- Enable database connection pooling

### 2. **Monitoring**

- Set up Stripe webhook monitoring
- Configure error tracking (Sentry)
- Monitor petal collection rates
- Track rune acquisition patterns

### 3. **Scaling Considerations**

- Database connection pooling
- Redis caching for rate limiting
- CDN for static assets
- Load balancing for high traffic

## 🔮 Future Enhancements

### Planned Features

- **Seasonal Events**: Special rune releases
- **Community Challenges**: Collaborative rune collection
- **Advanced Combos**: Dynamic combo generation
- **Rune Trading**: User-to-user rune exchange
- **Achievement System**: Rune-based accomplishments

### Integration Opportunities

- **Discord Bot**: Rune status and notifications
- **Mobile App**: Petal collection on mobile
- **Analytics Dashboard**: Rune system metrics
- **A/B Testing**: Reward rate optimization

## 📚 Additional Resources

### Documentation

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Stripe Webhook Guide](https://stripe.com/docs/webhooks)
- [Clerk Authentication](https://clerk.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

### Support

- Check server logs for detailed error messages
- Use browser developer tools for frontend debugging
- Monitor database queries with Prisma Studio
- Test API endpoints with tools like Postman or curl

---

**🎉 Congratulations!** Your Rune System is now fully implemented and ready for production use.
