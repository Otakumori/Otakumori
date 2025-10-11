# Inngest & Printify Setup Guide

## 🔴 **Issue Identified**

Your `.env.local` file is **missing** Inngest and Printify environment variables, which is why these services aren't loading properly.

---

## ✅ **Quick Fix**

Add these variables to your `.env.local` file:

```bash
# ===== INNGEST CONFIGURATION =====
INNGEST_EVENT_KEY=your_event_key_here
INNGEST_SIGNING_KEY=your_signing_key_here
INNGEST_SERVE_URL=http://localhost:8288/api/inngest

# For production (in Vercel):
# INNGEST_SERVE_URL=https://www.otaku-mori.com/api/inngest

# Optional: Set to 'off' to disable health probe
# INNGEST_PROBE=off

# ===== PRINTIFY CONFIGURATION =====
PRINTIFY_API_KEY=your_printify_api_key_here
PRINTIFY_SHOP_ID=your_printify_shop_id_here
PRINTIFY_API_URL=https://api.printify.com/v1
PRINTIFY_WEBHOOK_SECRET=your_printify_webhook_secret_here
```

---

## 📋 **Where to Get These Values**

### **Inngest Keys:**

1. Go to [Inngest Dashboard](https://app.inngest.com)
2. Select your app/environment
3. Go to **Settings** → **Keys**
4. Copy:
   - **Event Key** → `INNGEST_EVENT_KEY`
   - **Signing Key** → `INNGEST_SIGNING_KEY`

### **Printify Keys:**

1. Go to [Printify Account](https://printify.com/app/account/api)
2. **API Settings** → Generate API Token
3. Copy:
   - **API Token** → `PRINTIFY_API_KEY`
4. Go to **My Shops** → Copy your Shop ID
   - **Shop ID** → `PRINTIFY_SHOP_ID`
5. **Webhooks** → Create webhook → Copy secret
   - **Webhook Secret** → `PRINTIFY_WEBHOOK_SECRET`

---

## 🔍 **Verify Setup**

After adding the variables to `.env.local`:

### **1. Restart Dev Server**

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### **2. Test Locally**

Visit these endpoints in your browser:

- **Diagnostic (all services):** http://localhost:3000/api/diagnostic
- **Inngest health:** http://localhost:3000/api/health/inngest
- **Inngest endpoint:** http://localhost:3000/api/inngest
- **Printify debug:** http://localhost:3000/api/debug/printify
- **Printify products:** http://localhost:3000/api/v1/printify/products

### **3. Check Console Output**

You should see:

```bash
✓ [Inngest] GET http://localhost:8288/api/inngest succeeded: 200
✓ [Inngest] POST http://localhost:8288/api/inngest succeeded: 200
```

If you see errors:

```bash
✗ [Inngest] Missing env: INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY
```

→ Environment variables not loaded correctly

---

## 🚀 **Production Setup (Vercel)**

### **1. Go to Vercel Dashboard**

- Your Project → **Settings** → **Environment Variables**

### **2. Add ALL Variables**

Add each variable for **Production** environment:

| Variable Name             | Value                                    | Environment |
| ------------------------- | ---------------------------------------- | ----------- |
| `INNGEST_EVENT_KEY`       | `your_event_key`                         | Production  |
| `INNGEST_SIGNING_KEY`     | `your_signing_key`                       | Production  |
| `INNGEST_SERVE_URL`       | `https://www.otaku-mori.com/api/inngest` | Production  |
| `PRINTIFY_API_KEY`        | `your_api_key`                           | Production  |
| `PRINTIFY_SHOP_ID`        | `your_shop_id`                           | Production  |
| `PRINTIFY_API_URL`        | `https://api.printify.com/v1`            | Production  |
| `PRINTIFY_WEBHOOK_SECRET` | `your_webhook_secret`                    | Production  |

### **3. Redeploy**

```bash
# Or trigger a new deployment in Vercel
git push
```

---

## 🧪 **Test Production**

After deployment, visit:

```
https://www.otaku-mori.com/api/diagnostic
```

You should see:

```json
{
  "inngest": {
    "status": "reachable",
    "configured": {
      "INNGEST_EVENT_KEY": true,
      "INNGEST_SIGNING_KEY": true
    }
  },
  "printify": {
    "status": "reachable",
    "productsFound": 100,
    "totalProducts": 250
  }
}
```

---

## ❌ **Common Errors & Solutions**

### **Error: "Missing env: INNGEST_EVENT_KEY"**

- **Cause:** Environment variable not set
- **Fix:** Add to `.env.local` (local) or Vercel (production)

### **Error: "Inngest GET failed: 401"**

- **Cause:** Invalid signing key
- **Fix:** Check key is correct in Inngest dashboard

### **Error: "Printify API error: 401 Unauthorized"**

- **Cause:** Invalid API key or expired token
- **Fix:** Generate new API token in Printify settings

### **Error: "Printify API error: 403 Forbidden"**

- **Cause:** API key doesn't have access to shop
- **Fix:** Verify shop ID and API key permissions

### **Error: "fetch failed" (Inngest)**

- **Cause:** Inngest dev server not running locally
- **Fix:** Run `npx inngest-cli dev` in separate terminal OR set `INNGEST_PROBE=off`

---

## 🎯 **Inngest Dev Server (Local Only)**

For local Inngest function testing:

```bash
# Terminal 1: Run Inngest dev server
npx inngest-cli dev

# Terminal 2: Run your Next.js app
npm run dev
```

Visit: http://localhost:8288 (Inngest UI)

---

## ✅ **Checklist**

- [ ] Added Inngest keys to `.env.local`
- [ ] Added Printify keys to `.env.local`
- [ ] Restarted dev server
- [ ] Tested `/api/diagnostic` locally
- [ ] Added same variables to Vercel (Production)
- [ ] Redeployed to Vercel
- [ ] Tested `/api/diagnostic` in production
- [ ] Verified Inngest endpoint is reachable
- [ ] Verified Printify API returns products

---

## 🆘 **Still Having Issues?**

Run the diagnostic and share the output:

```bash
curl http://localhost:3000/api/diagnostic | jq
# or
curl https://www.otaku-mori.com/api/diagnostic | jq
```

This will show exactly which services are misconfigured!
