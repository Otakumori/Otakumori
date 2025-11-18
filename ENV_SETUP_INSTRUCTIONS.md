# Environment Variable Setup & Validation

## Where the Missing Variables Apply

The env schema (`env.mjs`) marks several server variables as **required**—`DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLERK_SECRET_KEY`, `PRINTIFY_API_KEY`, `PRINTIFY_SHOP_ID`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN`. If any of these are absent or malformed, validation fails and the app (or `pnpm env:verify`) throws.

The validation runs anywhere the app loads the env module: your local machine, CI (e.g., GitHub Actions), or production hosting (e.g., Vercel). The failure isn't coming from "GitHub" itself; it's whichever runtime doesn't have those variables populated.

## How to Fix in Each Environment

### Local

Create a `.env.local` (or `.env`) in the project root and set the required keys with real values. Restart `pnpm dev` afterward so the new vars load.

### Vercel (or Other Host)

Open the project's **Environment Variables** settings and add the same keys/values for the active environment (Preview/Production). Redeploy so the new vars are available.

### CI (GitHub Actions)

Add them as repository or environment secrets, then ensure your workflow exports them (e.g., `env:` block or dotenv step) before running `pnpm env:verify` or building.

## Quick Validation Steps

1. Populate the required keys in the target environment (local `.env.local`, Vercel dashboard, or GitHub secrets).

2. Rerun `pnpm env:verify` locally (or trigger a redeploy/CI run) to confirm validation passes.

3. Reload the app; the homepage error will clear once all required vars are present.
