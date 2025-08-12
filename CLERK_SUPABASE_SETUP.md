# 🔐 Clerk + Supabase Integration Setup Guide

## **Overview**
This guide will help you set up the integration between Clerk (authentication) and Supabase (database) for your Otakumori project.

## **🚀 Step 1: Clerk Dashboard Setup**

### 1.1 Create JWT Template
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Navigate to **JWT Templates**
3. Create a new template called `supabase`
4. Set the template to:
   ```json
   {
     "sub": "{{user.id}}",
     "email": "{{user.primary_email_address.email}}",
     "aud": "authenticated",
     "exp": "{{exp}}",
     "iat": "{{iat}}"
   }
   ```

### 1.2 Configure Webhook
1. Go to **Webhooks** in Clerk Dashboard
2. Create a new webhook endpoint
3. Set the endpoint URL to: `https://your-domain.com/api/webhooks/clerk`
4. Select these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret** (you'll need this for `CLERK_WEBHOOK_SECRET`)

## **🗄️ Step 2: Supabase Setup**

### 2.1 Enable JWT Authentication
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **Settings**
3. Set **JWT Expiry** to `3600` (1 hour)
4. Copy your **JWT Secret** (you'll need this)

### 2.2 Configure JWT Settings
1. In Supabase, go to **Authentication** → **Settings**
2. Set **Enable Row Level Security (RLS)** to `ON`
3. Set **JWT Secret** to match your Clerk JWT secret

### 2.3 Run Database Migration
1. Connect to your Supabase database
2. Run the SQL from `supabase/migrations/001_create_users_table.sql`
3. This creates the users table with proper RLS policies

## **🔧 Step 3: Environment Variables**

Add these to your `.env.local`:

```bash
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## **📱 Step 4: Usage Examples**

### 4.1 Using the User Profile Hook
```tsx
import { useUserProfile } from '@/hooks/useUserProfile';

function ProfilePage() {
  const { profile, loading, error, updateProfile } = useUserProfile();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Welcome, {profile?.first_name}!</h1>
      <button onClick={() => updateProfile({ first_name: 'New Name' })}>
        Update Name
      </button>
    </div>
  );
}
```

### 4.2 Using the Cart Hook
```tsx
import { useUserCart } from '@/hooks/useUserProfile';

function CartPage() {
  const { cart, loading, error, refreshCart } = useUserCart();

  if (loading) return <div>Loading cart...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Your Cart ({cart.length} items)</h1>
      {cart.map(item => (
        <div key={item.id}>{item.products.title}</div>
      ))}
    </div>
  );
}
```

## **🔒 Step 5: Security Features**

### 5.1 Row Level Security (RLS)
- Users can only access their own data
- Automatic JWT verification
- Secure by default

### 5.2 Webhook Verification
- All Clerk webhooks are verified using Svix
- Prevents unauthorized data modifications
- Secure user synchronization

## **🚨 Troubleshooting**

### Common Issues:

1. **JWT Token Invalid**
   - Check Clerk JWT template configuration
   - Verify Supabase JWT secret matches

2. **Webhook Not Working**
   - Verify `CLERK_WEBHOOK_SECRET` is correct
   - Check webhook endpoint URL is accessible

3. **RLS Policy Errors**
   - Ensure RLS is enabled in Supabase
   - Check JWT claims are being passed correctly

4. **User Not Syncing**
   - Verify webhook events are configured
   - Check database migration was run
   - Ensure proper error handling in webhook

## **📚 Additional Resources**

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [JWT Templates Guide](https://clerk.com/docs/backend-requests/jwt-templates)
- [Webhooks Guide](https://clerk.com/docs/webhooks)

## **✅ Testing the Integration**

1. **Create a new user** in Clerk
2. **Check Supabase** - user should appear in `users` table
3. **Update user profile** - changes should sync
4. **Test authentication** - user should access their data only

## **🎯 Next Steps**

After setup:
1. Test user registration and login
2. Verify data synchronization
3. Implement additional user features
4. Add more RLS policies as needed
5. Set up monitoring and logging

---

**Need Help?** Check the error logs in your terminal and Supabase dashboard for detailed error messages.
