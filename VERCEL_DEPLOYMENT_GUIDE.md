# 🚀 Vercel Deployment Guide for Otakumori

## **Overview**
This guide will help you deploy your Otakumori project to Vercel with all integrations (Clerk, Supabase, Inngest, Stripe, Printify) working flawlessly.

## **🔧 Pre-Deployment Checklist**

### **1. Environment Variables Setup**
You MUST set these environment variables in Vercel before deployment:

#### **Clerk Authentication:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_clerk_key
CLERK_SECRET_KEY=sk_test_your_actual_clerk_secret
CLERK_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
```

#### **Supabase Database:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=your_storage_bucket_name
```

#### **Stripe Payments:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_key
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_actual_stripe_webhook_secret
STRIPE_WEBHOOK_URL=https://your-domain.vercel.app/api/webhooks/stripe
```

#### **Printify Integration:**
```bash
PRINTIFY_API_KEY=your_actual_printify_api_key
PRINTIFY_SHOP_ID=your_actual_printify_shop_id
```

#### **Inngest Background Jobs:**
```bash
INNGEST_EVENT_KEY=your_actual_inngest_event_key
INNGEST_SIGNING_KEY=your_actual_inngest_signing_key
INNGEST_SERVE_URL=https://your-domain.vercel.app/api/inngest
```

#### **Site Configuration:**
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
AUTH_SECRET=your_secure_random_string_here
```

## **🚀 Deployment Steps**

### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

### **Step 2: Login to Vercel**
```bash
vercel login
```

### **Step 3: Deploy to Vercel**
```bash
vercel --prod
```

### **Step 4: Set Environment Variables**
Go to your Vercel dashboard → Project Settings → Environment Variables and add ALL the variables listed above.

### **Step 5: Redeploy with Environment Variables**
```bash
vercel --prod
```

## **🔗 Webhook Configuration**

### **1. Clerk Webhooks**
- **URL**: `https://your-domain.vercel.app/api/webhooks/clerk`
- **Events**: `user.created`, `user.updated`, `user.deleted`
- **Secret**: Use the `CLERK_WEBHOOK_SECRET` from your environment variables

### **2. Stripe Webhooks**
- **URL**: `https://your-domain.vercel.app/api/webhooks/stripe`
- **Events**: `payment_intent.succeeded`, `payment_intent.payment_failed`
- **Secret**: Use the `STRIPE_WEBHOOK_SECRET` from your environment variables

### **3. Printify Webhooks**
- **URL**: `https://your-domain.vercel.app/api/webhooks/printify`
- **Events**: `product.updated`, `inventory.changed`
- **Secret**: Use a custom webhook secret

## **🧪 Post-Deployment Testing**

### **1. Test Authentication**
```bash
# Test Clerk integration
curl https://your-domain.vercel.app/api/user/profile

# Expected: 401 Unauthorized (no auth token)
```

### **2. Test Inngest Functions**
```bash
# Test Inngest endpoint
curl https://your-domain.vercel.app/api/test-inngest

# Expected: 200 OK with success message
```

### **3. Test Webhook Endpoints**
```bash
# Test webhook endpoints
curl https://your-domain.vercel.app/api/webhooks/inngest
curl https://your-domain.vercel.app/api/webhooks/clerk
```

### **4. Test Product API**
```bash
# Test product endpoint
curl https://your-domain.vercel.app/api/shop/products

# Expected: 200 OK with products or mock data
```

## **🔒 Security Configuration**

### **1. Vercel Security Headers**
Create `vercel.json` in your project root:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### **2. Environment Variable Security**
- ✅ **Public variables** start with `NEXT_PUBLIC_`
- ❌ **Secret variables** should NOT start with `NEXT_PUBLIC_`
- 🔒 **Never commit** `.env.local` to git

## **📊 Monitoring & Debugging**

### **1. Vercel Analytics**
- Enable Vercel Analytics in your dashboard
- Monitor function execution times
- Track API endpoint performance

### **2. Inngest Dashboard**
- Access at `https://your-domain.vercel.app/api/inngest`
- Monitor background job execution
- Debug failed functions

### **3. Error Logs**
- Check Vercel Function Logs
- Monitor Clerk webhook delivery
- Track Stripe webhook success rates

## **🚨 Troubleshooting**

### **Common Issues:**

1. **Environment Variables Not Loading**
   - Ensure variables are set in Vercel dashboard
   - Redeploy after setting variables
   - Check variable names match exactly

2. **Webhooks Not Working**
   - Verify webhook URLs are correct
   - Check webhook secrets match
   - Ensure endpoints are accessible

3. **Authentication Errors**
   - Verify Clerk keys are correct
   - Check domain configuration in Clerk
   - Ensure middleware is configured properly

4. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies are configured
   - Ensure database is accessible from Vercel

### **Debug Commands:**
```bash
# Check deployment status
vercel ls

# View function logs
vercel logs

# Redeploy specific function
vercel --prod --force
```

## **🎯 Production Checklist**

- [ ] All environment variables set in Vercel
- [ ] Webhook endpoints configured in external services
- [ ] Database migrations run in Supabase
- [ ] Clerk domain configured for production
- [ ] Stripe webhooks pointing to production URL
- [ ] Inngest functions registered and working
- [ ] All API endpoints returning correct responses
- [ ] Authentication flow working end-to-end
- [ ] Payment processing tested
- [ ] Product sync working with Printify

## **📚 Additional Resources**

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Clerk Production Setup](https://clerk.com/docs/deployments)
- [Supabase Production](https://supabase.com/docs/guides/deployment)
- [Inngest Production](https://www.inngest.com/docs/deploy)

---

**Need Help?** Check Vercel Function Logs and Inngest Dashboard for detailed error information.
