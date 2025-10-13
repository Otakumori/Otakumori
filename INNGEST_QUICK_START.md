# ⚡ Inngest Quick Start

## 1. Create `.env.local` File

Create a file named `.env.local` in your project root and add:

```bash
INNGEST_EVENT_KEY=bmYjVWMrDUWy8TX7U_ZWTEoCTxw98HtHLkqP9b5159JYzgfMIqvuOqt9FSjxGSVh9XjsS5Y3mYLwDciXnXWGsw
INNGEST_SIGNING_KEY=jLyt-9dCtRB9rb0c4kfKFRzWcJYsFpM2X3MYhdSUiHgS4m491-Ap6SjY5Qcf0P0-1tDGp5SsfAqSZ3zc49qjHw
INNGEST_SERVE_URL=http://localhost:3000/api/inngest
INNGEST_PROBE=on
```

## 2. Restart Your Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## 3. Test the Configuration

```bash
# Test health
curl http://localhost:3000/api/health/inngest

# Send test event
curl http://localhost:3000/api/test-inngest

# View registered functions
curl http://localhost:3000/api/inngest
```

## 4. For Production (Vercel)

Add these environment variables in Vercel Dashboard:

- `INNGEST_EVENT_KEY` → `bmYjVWMr...`
- `INNGEST_SIGNING_KEY` → `jLyt-9dCt...`
- `INNGEST_SERVE_URL` → `https://www.otaku-mori.com/api/inngest`
- `INNGEST_PROBE` → `on`

---

📖 **For detailed documentation**, see `INNGEST_CONFIGURATION_COMPLETE.md`
