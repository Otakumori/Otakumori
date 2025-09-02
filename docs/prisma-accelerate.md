# Prisma Accelerate Integration

This document explains how Prisma Accelerate is integrated into the Otakumori application for improved database performance and caching.

## Overview

Prisma Accelerate is a connection pooling and caching service that provides:
- **Connection pooling** for serverless environments
- **Query caching** to reduce database load
- **Edge runtime support** for global performance
- **Automatic retries** and failover

## Installation

The Prisma Accelerate extension is already installed:

```bash
npm install @prisma/extension-accelerate
```

## Configuration

### Database Client Setup

The database client is configured in `app/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

export const db = new PrismaClient().$extends(withAccelerate());
```

### Environment Variables

Add these to your `.env.local`:

```bash
# Prisma Accelerate
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=your_api_key"
```

## Caching Strategies

### Cache TTL Values

Different types of data have different cache durations:

```typescript
export const CACHE_STRATEGIES = {
  USER: { ttl: 300 },        // 5 minutes - user data
  PRODUCT: { ttl: 600 },     // 10 minutes - product data
  SEARCH: { ttl: 120 },      // 2 minutes - search results
  REALTIME: { ttl: 30 },     // 30 seconds - real-time data
  STATIC: { ttl: 3600 },     // 1 hour - static data
};
```

### Usage Examples

#### Basic Caching

```typescript
// Cache user data for 5 minutes
const user = await db.user.findUnique({
  where: { clerkId: userId },
  cacheStrategy: { ttl: 300 },
});
```

#### Search with Caching

```typescript
// Cache search results for 2 minutes
const products = await db.product.findMany({
  where: { active: true },
  cacheStrategy: CACHE_STRATEGIES.SEARCH,
});
```

#### Complex Queries with Caching

```typescript
// Cache product recommendations
const recommendations = await db.product.findMany({
  where: {
    active: true,
    category: { in: userCategories },
  },
  include: {
    ProductVariant: {
      where: { isEnabled: true, inStock: true },
    },
  },
  cacheStrategy: CACHE_STRATEGIES.SEARCH,
});
```

## Performance Benefits

### Before Accelerate
- Direct database connections
- No query caching
- Higher latency for repeated queries
- Connection limits in serverless

### After Accelerate
- Connection pooling
- Intelligent query caching
- Reduced database load
- Better serverless performance

## Best Practices

### 1. Cache Strategy Selection

Choose TTL based on data freshness requirements:

- **User data**: 5 minutes (balance changes, profile updates)
- **Product data**: 10 minutes (prices, inventory)
- **Search results**: 2 minutes (dynamic content)
- **Real-time data**: 30 seconds (live updates)
- **Static data**: 1 hour (categories, settings)

### 2. Cache Invalidation

Accelerate automatically invalidates cache when data changes. For manual invalidation:

```typescript
// Force fresh data by omitting cacheStrategy
const freshUser = await db.user.findUnique({
  where: { clerkId: userId },
  // No cacheStrategy = always fresh
});
```

### 3. Error Handling

Accelerate provides automatic retries and failover:

```typescript
try {
  const result = await db.user.findMany({
    cacheStrategy: { ttl: 300 },
  });
} catch (error) {
  // Accelerate handles retries automatically
  console.error('Database error:', error);
}
```

## Monitoring

### Cache Hit Rates

Monitor cache performance in the Prisma Accelerate dashboard:
- Cache hit percentage
- Query performance metrics
- Connection pool status

### Performance Metrics

Track these metrics:
- Query response times
- Database connection usage
- Cache effectiveness

## Migration Guide

### From Standard Prisma

1. **Update imports**:
   ```typescript
   // Before
   import { PrismaClient } from '@prisma/client';
   
   // After
   import { PrismaClient } from '@prisma/client/edge';
   import { withAccelerate } from '@prisma/extension-accelerate';
   ```

2. **Extend client**:
   ```typescript
   // Before
   const db = new PrismaClient();
   
   // After
   const db = new PrismaClient().$extends(withAccelerate());
   ```

3. **Add caching**:
   ```typescript
   // Before
   const users = await db.user.findMany();
   
   // After
   const users = await db.user.findMany({
     cacheStrategy: { ttl: 300 },
   });
   ```

## Troubleshooting

### Common Issues

1. **Cache not working**: Check TTL values and query structure
2. **Connection errors**: Verify DATABASE_URL format
3. **Performance issues**: Monitor cache hit rates

### Debug Mode

Enable debug logging:

```typescript
const db = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
}).$extends(withAccelerate());
```

## Security Considerations

- **API Keys**: Store securely in environment variables
- **Data Privacy**: Cache doesn't store sensitive data
- **Access Control**: Use proper authentication

## Cost Optimization

- **TTL Tuning**: Optimize cache durations
- **Query Optimization**: Use efficient queries
- **Connection Pooling**: Reduce connection overhead

## Support

- **Documentation**: [Prisma Accelerate Docs](https://www.prisma.io/docs/accelerate)
- **Community**: [Prisma Discord](https://pris.ly/discord)
- **Issues**: [GitHub Issues](https://github.com/prisma/prisma/issues)
