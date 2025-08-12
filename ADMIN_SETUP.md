# Admin Dashboard & Resend Email Setup

This document covers the setup for the new admin dashboard and Resend email integration.

## 🚀 Quick Start

### 1. Environment Variables

Add these to your `.env.local` file:

```bash
# Resend (server only)
RESEND_API_KEY=__your_resend_key__
EMAIL_FROM="Otaku-Mori <orders@otaku-mori.com>"

# Supabase Admin (server only)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

**Get your keys:**
- **Resend**: Sign up at [resend.com](https://resend.com) and get your API key
- **Supabase Service Role**: Go to Supabase Dashboard → Project Settings → API → Copy the `service_role` key

### 2. DNS Setup for Resend

In your Resend dashboard, verify `otaku-mori.com` and add the DKIM CNAMEs they provide. This ensures emails are delivered properly.

### 3. Database Migration

Run the SQL migration to create the required tables:

```bash
# Option 1: Run directly in Supabase SQL editor
# Copy and paste the contents of supabase/migrations/20241201000000_admin_tables.sql

# Option 2: Use your existing migration script
npm run db:migrate
```

### 4. Grant Admin Role

In your Clerk Dashboard:
1. Go to Users → Find your account
2. Click Edit → Public Metadata
3. Add: `{"role": "admin"}`
4. Save

### 5. Test the Setup

1. Visit `/admin` - you should see the admin dashboard
2. Try creating a test page at `/admin/pages/new`
3. Test the Printify sync at `/admin/products`

## 📧 Email Integration

### How It Works

1. **Stripe Webhook** → **Printify Order** → **Resend Email**
2. When a customer completes checkout, the webhook:
   - Creates a Printify order (idempotent)
   - Sends a branded confirmation email via Resend
   - Uses the dark, cute template from `lib/email/mailer.ts`

### Email Template

The email template is:
- **Dark theme** with pink accents
- **Inline CSS** (no external dependencies)
- **Responsive** design
- **Branded** with Otaku-Mori styling

### Testing Emails

1. Make a test purchase in Stripe test mode
2. Check your webhook logs
3. Verify the email is sent from `orders@otaku-mori.com`

## 🛠️ Admin Dashboard Features

### Pages Management
- **Create/Edit**: MDX editor with live preview
- **Publish/Unpublish**: Draft → Published workflow
- **SEO-friendly**: Slug management and status control

### Blog Posts
- **Same as pages** + tags and cover images
- **MDX support** for rich content
- **Draft system** for content management

### Mini-games Configuration
- **JSON editor** for game settings
- **Version control** with automatic bumping
- **Live updates** without redeployment

### Soapstones Moderation
- **Hide/Unhide** messages
- **Delete** inappropriate content
- **Rate limiting** and profanity filtering

### Product Sync
- **Printify integration** with automatic categorization
- **Manual sync** button for admin control
- **Smart mapping** of products to categories

## 🔒 Security

### Admin Access
- **Clerk-guarded** routes
- **Role-based** permissions (`role === "admin"`)
- **Server-side** validation on all admin actions

### Database Security
- **Row Level Security (RLS)** enabled on all tables
- **Public read** access for published content
- **Admin write** access for management
- **User isolation** for game data

### API Protection
- **Admin-only** endpoints
- **Rate limiting** on public APIs
- **Input validation** and sanitization

## 🎮 Game Integration

### Petal Collector
- **Server-side** progress tracking
- **Daily goals** and achievements
- **Configurable** spawn rates and colors

### Soapstones
- **Site-wide** message system
- **Moderation tools** for admins
- **Rate limiting** (1 per 30s per user)

## 📊 Monitoring & Observability

### Webhook Logging
- **Stripe events** logged with details
- **Printify responses** tracked
- **Email send results** monitored

### Error Handling
- **Graceful degradation** if email fails
- **Retry logic** for Printify API calls
- **Non-blocking** webhook responses

## 🚀 Deployment

### Vercel
- **Environment variables** set in Vercel dashboard
- **Serverless functions** for webhooks and admin APIs
- **Edge runtime** optimized for performance

### Supabase
- **RLS policies** automatically applied
- **Real-time** subscriptions for live updates
- **Backup** and point-in-time recovery

## 🔧 Troubleshooting

### Common Issues

1. **"Forbidden" error on /admin**
   - Check your Clerk role is set to "admin"
   - Verify the role is in public metadata

2. **Email not sending**
   - Check Resend API key is correct
   - Verify DNS setup for your domain
   - Check webhook logs for errors

3. **Database connection issues**
   - Verify Supabase service role key
   - Check RLS policies are applied
   - Ensure tables exist from migration

4. **Printify sync failing**
   - Verify API key and shop ID
   - Check rate limits and API quotas
   - Review error logs for specific issues

### Debug Commands

```bash
# Check environment variables
npm run system:check

# View webhook logs
npm run logs:view

# Test database connection
npm run db:verify
```

## 📚 Next Steps

### Immediate
1. Test the admin dashboard
2. Create a test page/post
3. Verify email sending works
4. Test Printify sync

### Future Enhancements
1. **Media management** for images and files
2. **Analytics dashboard** for sales and traffic
3. **Automated backups** and maintenance
4. **Advanced moderation** tools
5. **Bulk operations** for content management

## 🆘 Support

If you encounter issues:
1. Check the logs first
2. Verify all environment variables
3. Test with a simple example
4. Check Supabase and Clerk dashboards for errors

The system is designed to be robust and fail gracefully, so most issues are configuration-related and easily resolved.
