# Clerk + Supabase Setup - Complete Implementation Guide

This document provides a comprehensive guide for the completed Clerk + Supabase integration using RS256 JWT flow.

## ✅ What's Been Implemented

### 1. Environment Configuration
- Updated `env.example` with required Clerk and Supabase variables
- Configured for RS256 JWT flow with Clerk as issuer

### 2. App Structure
- Updated `app/layout.tsx` with proper ClerkProvider configuration
- Enhanced `components/layout/Navigation.tsx` with shop dropdown and auth CTAs
- Updated `app/page.tsx` with search placeholder and fallback links
- Created new `app/profile/page.tsx` using Clerk's UserProfile component
- Added legal pages: `/terms`, `/privacy`, `/data-deletion`
- Created `components/TestSupabaseButton.tsx` for development testing

### 3. Supabase Integration
- Enhanced `app/lib/supabaseClient.ts` with Clerk token support
- Created `supabase/setup-rls.sql` for Row Level Security policies

## 🚀 Next Steps to Complete Setup

### 1. Environment Variables
Create `.env.local` with your actual values:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
NEXT_PUBLIC_CLERK_FRONTEND_API=your_clerk_domain_here
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/profile

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
DATABASE_URL=your_supabase_database_url_here
```

### 2. Supabase Database Setup
Run the SQL script in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/setup-rls.sql`
4. Execute the script

### 3. Clerk Configuration

#### A. Connect with Supabase
1. In Clerk Dashboard → Connect with Supabase
2. Enable the connection
3. Set Clerk domain: `https://clerk.otaku-mori.com`

#### B. External JWT Settings
1. In Supabase → Auth → Third-party auth
2. Enable External JWT
3. Set Issuer/Provider domain: `https://clerk.otaku-mori.com`

#### C. Social Providers
1. **Facebook OAuth:**
   - App Domains: `clerk.otaku-mori.com`
   - Privacy Policy: `https://www.otaku-mori.com/privacy`
   - Terms of Service: `https://www.otaku-mori.com/terms`
   - Data Deletion: `https://www.otaku-mori.com/data-deletion`
   - Valid OAuth Redirect URIs: `https://clerk.otaku-mori.com/v1/oauth_callback`

2. **Google OAuth:**
   - Authorized redirect URIs: `https://clerk.otaku-mori.com/v1/oauth_callback`
   - Add your production domain when ready

#### D. Account Portal Redirects
1. In Clerk → Account Portal → User redirects
2. Set:
   - After sign-up fallback: `https://www.otaku-mori.com/profile`
   - After sign-in fallback: `https://www.otaku-mori.com/`
   - After logo click: `https://www.otaku-mori.com/`

### 4. Test the Integration

#### A. Basic Auth Flow
1. Start your development server: `npm run dev`
2. Visit the home page
3. Click "Join the quest" → should open Clerk sign-up modal
4. Complete sign-up → should redirect to `/profile`
5. Sign out → should redirect to `/`

#### B. Supabase Integration Test
1. Sign in to your account
2. Look for the blue "Test DB" button in bottom-left corner
3. Click it and check browser console for results
4. Should see successful connection or specific error details

#### C. Token Verification
1. Open browser console
2. Sign in and check the token:
```javascript
// In console, the TestSupabaseButton logs should show:
// - Token structure with iss: https://clerk.otaku-mori.com
// - sub: your_clerk_user_id
// - Supabase query results
```

### 5. Production Deployment

#### A. Update Environment Variables
1. Set production Clerk keys
2. Update Supabase URLs for production
3. Ensure all redirect URIs use production domain

#### B. Legal Pages
1. Update contact information in legal pages
2. Verify all links work in production
3. Test Facebook app review requirements

## 🔧 Troubleshooting

### Common Issues

#### 1. "JWT verification failed" in Supabase
- Verify External JWT is enabled in Supabase
- Check issuer domain matches exactly: `https://clerk.otaku-mori.com`
- Ensure Clerk domain is correct in connection settings

#### 2. Auth redirects not working
- Check `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- Verify Account Portal redirects are set correctly
- Test with both development and production URLs

#### 3. Supabase RLS blocking queries
- Run the RLS setup SQL script
- Verify policies are created correctly
- Check that `clerk_id` matches the JWT `sub` claim

#### 4. Social login errors
- Verify OAuth redirect URIs are correct
- Check Facebook app is in live mode
- Ensure legal pages are accessible over HTTPS

### Debug Commands

```bash
# Check environment variables
npm run dev 2>&1 | grep -E "(CLERK|SUPABASE)"

# Test Supabase connection
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://your-project.supabase.co/rest/v1/profiles?select=*&limit=1"
```

## 📋 Acceptance Test Checklist

- [ ] Auth UI: "Join the quest" opens modal
- [ ] Sign-up lands on `/profile`
- [ ] Sign-in lands on `/`
- [ ] Fallback links to Account Portal work
- [ ] Token shape: `iss: https://clerk.otaku-mori.com`, `sub: <clerk_user_id>`
- [ ] Supabase queries succeed with Authorization header
- [ ] RLS: user can see own profile, not others
- [ ] Facebook/Google OAuth complete successfully
- [ ] Legal pages load over HTTPS
- [ ] Test DB button shows successful connection

## 🎯 Next Development Steps

1. **Profile Management**: Enhance profile page with custom fields
2. **Data Sync**: Implement automatic profile creation on Clerk signup
3. **Additional Tables**: Create tables for achievements, friends, etc.
4. **Error Handling**: Add proper error boundaries and user feedback
5. **Testing**: Add unit tests for auth flow and database queries

## 📚 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [RS256 JWT Flow](https://supabase.com/docs/guides/auth/auth-with-clerk)
- [Facebook App Review](https://developers.facebook.com/docs/app-review)

---

**Status**: ✅ Implementation Complete  
**Last Updated**: ${new Date().toLocaleDateString()}  
**Next Action**: Complete environment setup and test integration
