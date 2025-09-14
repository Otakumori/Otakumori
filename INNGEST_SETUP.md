# 🚀 Inngest Integration Setup Guide for Otakumori

## **Overview**

Inngest is a powerful background job processor that will make your Otakumori project production-ready by handling:

- **Webhook processing** (Clerk, Stripe, Printify)
- **Background jobs** (product updates, inventory sync)
- **Scheduled tasks** (daily/weekly operations)
- **Error handling** and retries
- **Real-time monitoring**

## **🔧 Installation & Setup**

### 1. Install Dependencies

```bash
npm install inngest
```

### 2. Start Inngest Dev Server

```bash
npx inngest-cli@latest dev
```

### 3. Environment Variables

Add to your `.env.local`:

```bash
# Inngest Configuration
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=your_signing_key_here
INNGEST_SERVE_URL=http://localhost:8288
```

## **🏗️ Architecture Overview**

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   External      │    │   Inngest       │    │   Your App      │
│   Services      │───▶│   Functions     │───▶│   Database      │
│                 │    │                 │    │                 │
│ • Clerk        │    │ • User Sync     │    │ • Supabase      │
│ • Stripe       │    │ • Order Process │    │ • Products      │
│ • Printify     │    │ • Inventory     │    │ • Orders        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## **📋 Available Functions**

### **User Management**

- `syncUserToSupabase` - Syncs Clerk users to Supabase
- `userProfileUpdate` - Handles profile changes

### **Product Management**

- `updatePrintifyProducts` - Syncs products from Printify
- `syncInventory` - Updates inventory levels
- `dailyInventorySync` - Scheduled daily sync (2 AM)
- `weeklyProductUpdate` - Scheduled weekly update (Monday 3 AM)

### **Order Processing**

- `processOrder` - Multi-step order processing
- `sendOrderConfirmation` - Email confirmations
- `handlePaymentWebhook` - Stripe webhook processing

### **Utility Functions**

- `retryFailedOperation` - Automatic retry with backoff
- `cleanupOldData` - Scheduled cleanup (Sunday 4 AM)

## **🔗 Webhook Integration**

### **Clerk Webhooks**

```typescript
// Triggers when user signs up/updates
await inngest.send({
  name: 'clerk/user.created',
  data: { userId: 'user_123', email: 'user@example.com' },
});
```

### **Stripe Webhooks**

```typescript
// Triggers when payment succeeds/fails
await inngest.send({
  name: 'stripe/webhook',
  data: { type: 'payment_intent.succeeded', orderId: 'order_123' },
});
```

### **Printify Webhooks**

```typescript
// Triggers when products change
await inngest.send({
  name: 'printify/products.update',
  data: { shopId: 'shop_123', productCount: 50 },
});
```

## **📅 Scheduled Jobs**

### **Daily Operations (2 AM)**

- Inventory synchronization
- Order status updates
- Database maintenance

### **Weekly Operations (Monday 3 AM)**

- Product catalog updates
- Analytics aggregation
- System health checks

### **Monthly Operations (1st of month 5 AM)**

- Data archiving
- Performance optimization
- Security audits

## **🚨 Error Handling & Retries**

### **Automatic Retries**

- Failed operations retry with exponential backoff
- Maximum 3 retry attempts
- Dead letter queue for permanently failed jobs

### **Monitoring**

- Real-time function execution logs
- Error rate tracking
- Performance metrics

## **🔒 Security Features**

### **Webhook Verification**

- Signature validation for all incoming webhooks
- Rate limiting to prevent abuse
- IP whitelisting for production

### **Function Isolation**

- Each function runs in isolated environment
- No shared state between executions
- Secure environment variable access

## **📊 Monitoring & Debugging**

### **Inngest Dashboard**

- Real-time function execution
- Error logs and stack traces
- Performance metrics
- Function history

### **Logging**

```typescript
// Structured logging in functions
await step.run('operation-name', async () => {
  console.log('Processing operation', {
    operationId: 'op_123',
    timestamp: new Date().toISOString(),
  });

  // Your logic here

  return { success: true };
});
```

## **🚀 Production Deployment**

### **1. Deploy to Vercel/Netlify**

- Inngest functions automatically deploy with your app
- No additional infrastructure needed

### **2. Configure Production Webhooks**

- Update webhook URLs to production domain
- Set production environment variables
- Enable monitoring and alerts

### **3. Scale Configuration**

- Set function concurrency limits
- Configure timeout settings
- Set up rate limiting

## **🧪 Testing Functions**

### **Local Testing**

```bash
# Start Inngest dev server
npx inngest-cli@latest dev

# Test specific function
curl -X POST http://localhost:8288/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "test/function", "data": {"test": true}}'
```

### **Function Testing**

```typescript
// Test individual functions
import { syncUserToSupabase } from '../inngest/functions';

// Mock event data
const testEvent = {
  name: 'clerk/user.created',
  data: { userId: 'test_user', email: 'test@example.com' },
};

// Test function execution
const result = await syncUserToSupabase.run(testEvent);
console.log('Function result:', result);
```

## **📈 Performance Optimization**

### **Function Optimization**

- Use step.run() for complex operations
- Implement proper error handling
- Avoid blocking operations

### **Database Optimization**

- Use connection pooling
- Implement caching strategies
- Optimize queries for background jobs

## **🔍 Troubleshooting**

### **Common Issues**

1. **Function Not Triggering**
   - Check webhook endpoint configuration
   - Verify event names match
   - Check function registration

2. **Function Failing**
   - Review error logs in Inngest dashboard
   - Check environment variables
   - Verify external service connectivity

3. **Performance Issues**
   - Monitor function execution times
   - Check database query performance
   - Review external API response times

### **Debug Commands**

```bash
# Check Inngest status
npx inngest-cli@latest status

# View function logs
npx inngest-cli@latest logs

# Test webhook endpoint
curl -X GET http://localhost:3000/api/webhooks/inngest
```

## **🎯 Next Steps**

1. **Start Inngest dev server** with `npx inngest-cli@latest dev`
2. **Test webhook endpoints** with sample data
3. **Configure production webhooks** in external services
4. **Set up monitoring** and alerting
5. **Deploy to production** and verify functionality

## **📚 Resources**

- [Inngest Documentation](https://www.inngest.com/docs)
- [Next.js Integration Guide](https://www.inngest.com/docs/frameworks/nextjs)
- [Function Examples](https://www.inngest.com/docs/functions)
- [Webhook Integration](https://www.inngest.com/docs/webhooks)

---

**Need Help?** Check the Inngest dashboard at `http://localhost:8288` for real-time function execution and debugging information.
