#!/usr/bin/env bash
set -euo pipefail

echo "› Typecheck"
pnpm typecheck

echo "› Lint"
pnpm lint

echo "› Build"
pnpm build

echo "› Route/file duplicates"
# Duplicate component basenames
dupes_components=$(find app/components -type f -name '*.tsx' -exec basename {} \; | sort | uniq -d || true)
if [ -n "$dupes_components" ]; then
  echo "ERROR: duplicate component names detected:"
  echo "$dupes_components"
  exit 1
fi

# Multiple page.tsx per route depth check (rough)
find app -type f -name 'page.tsx' | sort > /tmp/_pages.txt
if [ "$(wc -l < /tmp/_pages.txt)" -lt 1 ]; then
  echo "ERROR: no pages found (did something get deleted?)"
  exit 1
fi

echo "› Orphan scan (production)"
npx -y knip --production || { echo "Knip reported issues"; exit 1; }

echo "› Asset integrity"
if git diff --name-only -- public/assets | grep -q . ; then
  echo "ERROR: public/assets changed. Guardrails forbid asset changes."
  git diff --name-status -- public/assets
  exit 1
fi

echo "All sanity checks passed."
