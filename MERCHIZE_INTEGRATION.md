# Merchize Integration

This branch adds a parallel Merchize integration scaffold for Otakumori.

## Environment variables

Add these in Vercel project settings. Do not commit them.

- `MERCHIZE_API_URL`
- `MERCHIZE_ACCESS_TOKEN`

## Added routes

- `/api/debug/merchize`
- `/api/merchize/products`
- `/admin/merchize`

## Why this is parallel first

The existing shop and Prisma catalog are tightly coupled to Printify field names. This first pass keeps Merchize isolated so the connection can be verified safely before replacing the live catalog pipeline.
