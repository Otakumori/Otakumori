# Database Setup Guide - Neon PostgreSQL

## ✅ Current Status

- **Database**: Neon PostgreSQL (as per README)
- **Supabase**: Legacy/optional (not used for main database)
- **Prisma**: Version 6.18.0 with Accelerate support

## 🔧 How to Add DATABASE_URL

### Step 1: Locate Your `.env` File

The `.env` file is in the **root folder** of your project (same level as `package.json`).

If it doesn't exist, create it:
```bash
# In project root (C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\)
New-Item -Path .env -ItemType File
```

### Step 2: Add Your Neon Database URL

Open `.env` and add:

```env
# Neon PostgreSQL Connection
# Get this from: https://console.neon.tech/ → Your Project → Connection Details
DATABASE_URL="postgresql://otakumori_owner:npg_xxxxxxxxxxxxx@ep-project-name.us-east-2.aws.neon.tech/otakumori?sslmode=require"

# Same URL for DIRECT_URL (used for migrations)
DIRECT_URL="postgresql://otakumori_owner:npg_xxxxxxxxxxxxx@ep-project-name.us-east-2.aws.neon.tech/otakumori?sslmode=require"
```

### Step 3: Find Your Actual Neon Connection String

**Option A: From Neon Dashboard**
1. Go to https://console.neon.tech/
2. Click on your **Otakumori** project
3. Click **"Connection Details"** or **"Quickstart"**
4. Copy the connection string that looks like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname
   ```

**Option B: From Vercel Environment Variables**
1. Go to https://vercel.com/
2. Find your Otakumori project
3. Go to **Settings → Environment Variables**
4. Look for `DATABASE_URL` - copy the value

**Option C: Check Vercel CLI**
```bash
vercel env pull .env
```
This will download all your environment variables into `.env`

## 🎯 Quick Fix Right Now

If you want to just **test the build** without connecting to a real database:

```env
# Temporary placeholder (won't work for actual database operations)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/otakumori_dev"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/otakumori_dev"
```

Then run:
```bash
# Generate Prisma client
npx prisma generate

# Test build
npm run build
```

This will let the build succeed, even though it won't connect to a real database.

## ✅ Verification

After adding the DATABASE_URL, verify it works:

```bash
# Test database connection
npx prisma db pull

# Generate Prisma client
npx prisma generate

# Run migrations (if needed)
npx prisma migrate deploy
```

## 📝 What I've Already Fixed

✅ Updated `prisma/schema.prisma` to support both `url` and `directUrl`  
✅ Updated `scripts/pre-build-validation.ts` to skip Prisma validation for Accelerate  
✅ Fixed all 5 ESLint warnings  
✅ TypeScript compiles cleanly (0 errors)  

## 🚀 Once DATABASE_URL is Added

The build will work! Then you can:
- Test the procedural avatar at `/avatar/demo`
- Deploy to Vercel
- All database operations will work

---

**TL;DR**: Add your Neon connection string from https://console.neon.tech/ to `.env` as `DATABASE_URL` and you're good to go! 🎉

