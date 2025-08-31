# 🚀 API Monitoring & Health Check System

## Overview

This comprehensive monitoring system ensures your APIs never break again by providing:

- **Automated health checks** before deployments
- **Continuous monitoring** in production
- **Early warning alerts** for API failures
- **GitHub Actions integration** for CI/CD

## 🧪 Quick Health Check

### Before Every Deployment

```bash
# Run comprehensive API health check
npm run api:health

# Or use the alias
npm run api:test
```

### Pre-deployment (includes build + health check)

```bash
npm run pre-deploy
```

## 📊 What Gets Tested

### 1. Health Endpoints

- `/api/health` - Basic health status
- `/api/health/comprehensive` - Detailed system health

### 2. Shop & E-commerce

- `/api/v1/shop/products` - Printify integration
- `/api/shop/products` - Legacy shop API

### 3. Authentication & User Management

- `/api/gacha` - Gacha system (should return 401 when unauthenticated)
- `/api/v1/petals/balance` - User petals (should return 401 when unauthenticated)
- `/api/profile/me` - User profile (should return 401 when unauthenticated)

### 4. Content & Community

- `/api/blog/posts` - Blog content
- `/api/community/posts` - Community posts
- `/api/soapstones` - User messages

### 5. Game Systems

- `/api/v1/games/stats` - Game statistics
- `/api/leaderboard/game` - Leaderboards

### 6. System & Admin

- `/api/system-check` - System diagnostics
- `/api/metrics` - Performance metrics

## 🚨 Failure Prevention

### Environment Variables Check

The system automatically verifies:

- ✅ Database connection (Supabase)
- ✅ Printify API credentials
- ✅ Clerk authentication
- ✅ Redis connection (if enabled)

### Common Failure Points & Solutions

#### 1. Printify API 401 Errors

**Symptoms:** Shop products not loading
**Causes:** Expired API key, invalid shop ID
**Solutions:**

```bash
# Check environment variables
npm run api:health

# Verify in .env file
PRINTIFY_API_KEY=your_key_here
PRINTIFY_SHOP_ID=your_shop_id
```

#### 2. Clerk Authentication Issues

**Symptoms:** Protected routes returning 500 instead of 401
**Causes:** Missing middleware, invalid environment variables
**Solutions:**

```bash
# Check middleware.ts configuration
# Verify Clerk environment variables
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
```

#### 3. Database Connection Failures

**Symptoms:** Soapstones, blog, or user APIs returning 500
**Causes:** Invalid DATABASE_URL, network issues
**Solutions:**

```bash
# Check Supabase connection
# Verify DATABASE_URL in environment
# Test database connectivity
```

## 🔄 Continuous Monitoring

### Production Monitoring

```bash
# Start continuous monitoring
npm run monitor:apis

# Or run directly
npx tsx scripts/monitor-apis.ts
```

### GitHub Actions Integration

The system automatically runs on:

- ✅ Every push to main/develop
- ✅ Every pull request
- ✅ Prevents broken code from merging

## 📈 Monitoring Dashboard

### Real-time Status

```bash
# Check monitoring status
curl http://localhost:3000/api/health/comprehensive
```

### Performance Metrics

- Response times for all endpoints
- Success/failure rates
- Database connection status
- External API health (Printify, Clerk)

## 🛠️ Troubleshooting

### Debug Mode

```bash
# Enable verbose logging
DEBUG=api:* npm run api:health
```

### Manual Testing

```bash
# Test specific endpoint
curl -X GET http://localhost:3000/api/health
curl -X GET http://localhost:3000/api/v1/shop/products?limit=1
```

### Database Diagnostics

```bash
# Check database connection
npx prisma db push --preview-feature
npx prisma studio
```

## 🚀 Deployment Checklist

### Before Deploying

1. ✅ Run `npm run pre-deploy`
2. ✅ All API health checks pass
3. ✅ Build completes successfully
4. ✅ No TypeScript errors
5. ✅ Environment variables verified

### After Deploying

1. ✅ Verify production health endpoint
2. ✅ Test critical user flows
3. ✅ Monitor error logs
4. ✅ Check performance metrics

## 🔧 Configuration

### Customizing Health Checks

Edit `scripts/api-health-check.ts` to:

- Add new endpoints
- Change expected status codes
- Modify test criteria

### Monitoring Settings

Edit `scripts/monitor-apis.ts` to:

- Adjust check intervals
- Set alert thresholds
- Configure webhook notifications

### GitHub Actions

Edit `.github/workflows/api-health-check.yml` to:

- Add new branches
- Modify environment variables
- Change Node.js version

## 📚 Best Practices

### 1. Always Run Health Checks

- Before every deployment
- After environment changes
- When adding new APIs

### 2. Monitor Production

- Enable continuous monitoring
- Set up alert notifications
- Track performance trends

### 3. Document Changes

- Update this guide when adding APIs
- Note expected behavior changes
- Document troubleshooting steps

### 4. Fail Fast

- Catch issues in development
- Prevent broken deployments
- Maintain high reliability

## 🎯 Success Metrics

### Target Performance

- ✅ **API Success Rate**: >99.5%
- ✅ **Response Time**: <500ms average
- ✅ **Uptime**: >99.9%
- ✅ **Zero Critical Failures**

### Monitoring Goals

- 🚨 **Alert Response**: <5 minutes
- 🔍 **Issue Detection**: <1 minute
- 🛠️ **Resolution Time**: <30 minutes
- 📊 **Prevention Rate**: >95%

---

**Remember:** This monitoring system is your safety net. Use it proactively to prevent issues, not reactively to fix them after they break!
