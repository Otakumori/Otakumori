# Environment Setup - Copy These Lines to Your `.env` File

## ✅ What to Add to Your `.env` File

Open `C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\.env` and add these lines:

```env
# Supabase PostgreSQL Connection (Pooled - for queries)
DATABASE_URL="postgresql://postgres.ydbhokoxqwqbtqqeibef:te8ZdCF5oFh2mbDc@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase PostgreSQL Connection (Direct - for migrations)
DIRECT_URL="postgresql://postgres.ydbhokoxqwqbtqqeibef:te8ZdCF5oFh2mbDc@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

## ✅ Your Prisma Schema is Already Correct!

I already updated `prisma/schema.prisma` - it has:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Nothing else to change there! ✅

## 🎯 After Adding to `.env`

Run these commands:

```bash
# Step 1: Generate Prisma client
npx prisma generate

# Step 2: Test the build
npm run build

# Step 3: Start dev server and test avatar demo
npm run dev
# Then visit: http://localhost:3000/avatar/demo
```

## 📝 Why These URLs?

- **DATABASE_URL** (port 6543): Connection pooling via PgBouncer - faster for queries
- **DIRECT_URL** (port 5432): Direct Postgres connection - required for schema migrations

Both point to your **Supabase database** where all your 80+ tables and data live!

## ⚠️ What About Prisma Accelerate?

Your Accelerate credentials (`db.prisma.io`) seem to point to a **different database**. Since your actual data is in Supabase (you showed 80+ tables there), **use Supabase directly** to avoid connecting to the wrong database.

If you want to use Accelerate in the future, you'd need to configure it to proxy to your Supabase database.

## 🚀 Quick Copy-Paste

**Just copy these 2 lines into your `.env` file:**

```
DATABASE_URL="postgresql://postgres.ydbhokoxqwqbtqqeibef:te8ZdCF5oFh2mbDc@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.ydbhokoxqwqbtqqeibef:te8ZdCF5oFh2mbDc@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
```

Then run: `npx prisma generate && npm run build`

Done! 🎉
