#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const checks = [
  {
    name: 'WebhookEvent has provider/externalEventId unique constraint',
    file: 'prisma/schema.prisma',
    pattern: /model WebhookEvent[\s\S]*@@unique\(\[provider,\s*externalEventId\]\)/,
  },
  {
    name: 'Printify order sync is unique per local order',
    file: 'prisma/schema.prisma',
    pattern: /model PrintifyOrderSync[\s\S]*localOrderId\s+String\s+@unique/,
  },
  {
    name: 'Stripe webhook verifies raw body signature',
    file: 'app/api/webhooks/stripe/route.ts',
    pattern: /readRawBody\(req\)[\s\S]*stripe\.webhooks\.constructEvent\(raw,\s*sig,\s*secret\)/,
  },
  {
    name: 'Stripe webhook duplicate events return duplicate response',
    file: 'app/api/webhooks/stripe/route.ts',
    pattern: /beginWebhookProcessing\(event\)[\s\S]*duplicate:\s*true/,
  },
  {
    name: 'Fulfillment is dispatched through provider-neutral orchestration after payment truth',
    file: 'app/api/webhooks/stripe/route.ts',
    pattern: /case 'checkout\.session\.completed'[\s\S]*recordStripePaidOrderLedger\([\s\S]*dispatchFulfillment\(order\.id,\s*{[\s\S]*source:\s*'stripe_webhook'/,
  },
  {
    name: 'Fulfillment dry-run supports provider-neutral env and legacy Stripe alias',
    file: 'env.mjs',
    pattern: /STRIPE_WEBHOOK_FULFILLMENT_DRY_RUN:\s*z\.string\(\)\.optional\(\)[\s\S]*FULFILLMENT_PROVIDER:\s*z\.enum\(\['printify',\s*'merchize',\s*'manual',\s*'disabled'\]\)\.optional\(\)[\s\S]*FULFILLMENT_DRY_RUN:\s*z\.string\(\)\.optional\(\)[\s\S]*FULFILLMENT_DRY_RUN:\s*process\.env\.FULFILLMENT_DRY_RUN/,
  },
  {
    name: 'Fulfillment attempts are durable and unique per dispatch',
    file: 'prisma/schema.prisma',
    pattern: /model FulfillmentAttempt[\s\S]*idempotencyKey\s+String\s+@unique[\s\S]*@@index\(\[provider,\s*status\]\)/,
  },
  {
    name: 'Accounting ledger and business expenses are modeled',
    file: 'prisma/schema.prisma',
    pattern: /model TaxLedgerEntry[\s\S]*idempotencyKey\s+String\s+@unique[\s\S]*model BusinessExpense[\s\S]*enum TaxLedgerEntryType[\s\S]*SALE_GROSS[\s\S]*NET_REVENUE_ESTIMATE/,
  },
  {
    name: 'Ledger idempotency includes order, entry type, source event, and source reference',
    file: 'lib/accounting/ledger.ts',
    pattern: /buildLedgerIdempotencyKey[\s\S]*orderId[\s\S]*entryType[\s\S]*sourceEventId[\s\S]*(providerReference\s*\|\|\s*sourceReference|sourceReference\s*\|\|\s*providerReference)/,
  },
  {
    name: 'Checkout session reloads product and variant data from Prisma',
    file: 'app/api/v1/checkout/session/route.ts',
    pattern: /prisma\.product\.findMany[\s\S]*prisma\.productVariant\.findMany/,
  },
  {
    name: 'Checkout metadata has local order and request reconciliation',
    file: 'app/api/v1/checkout/session/route.ts',
    pattern: /metadata:\s*{[\s\S]*local_order_id[\s\S]*idempotency_key[\s\S]*request_id[\s\S]*source:\s*'otakumori_checkout'/,
  },
  // Provider write lockdown / petal authority static guarantees.
  {
    name: 'Refund ledger records the per-event delta, not the cumulative total',
    file: 'app/api/webhooks/stripe/route.ts',
    pattern: /previous_attributes[\s\S]*recordStripeRefundLedger\(\s*{[\s\S]*amountRefunded:\s*refundDelta/,
  },
  {
    name: 'Petal click route derives the reward server-side via grantPetals',
    file: 'app/api/petals/route.ts',
    pattern: /resolveClickReward\([\s\S]*grantPetals\(/,
  },
  {
    name: 'Petal click route does not write a ledger amount from the request body',
    file: 'app/api/petals/route.ts',
    pattern: /petalBalance:\s*\{\s*increment|petalLedger\.create/,
    absent: true,
  },
  {
    name: 'Petal earn route derives the reward server-side via grantPetals',
    file: 'app/api/petals/earn/route.ts',
    pattern: /resolveClickReward\([\s\S]*grantPetals\(/,
  },
  {
    name: 'Petal earn route does not write a ledger amount from the request body',
    file: 'app/api/petals/earn/route.ts',
    pattern: /petalBalance:\s*\{\s*increment|petalLedger\.create|petalTransaction\.create/,
    absent: true,
  },
  {
    name: 'Petal grant route gates admin_grant behind admin/internal authorization',
    file: 'app/api/v1/petals/grant/route.ts',
    pattern: /source === 'admin_grant'[\s\S]*authorizeAdminApi\(req,\s*'clerk_admin_or_internal_service'\)/,
  },
  {
    name: 'Petal sync route does not inflate the server balance from client input',
    file: 'app/api/v1/petals/sync/route.ts',
    pattern: /Math\.max\([\s\S]*localBalance/,
    absent: true,
  },
  {
    name: 'Printify order creation is guarded before the provider request',
    file: 'app/api/shop/orders/route.ts',
    pattern: /authorizeProviderWrite\(request\)[\s\S]*if \(!guard\.ok\) return guard\.response[\s\S]*fetch\(/,
  },
  {
    name: 'EasyPost label purchase is guarded before the provider request',
    file: 'app/api/shipping/buy/route.ts',
    pattern: /authorizeProviderWrite\(req\)[\s\S]*if \(!guard\.ok\) return guard\.response[\s\S]*EP\.buyShipment\(/,
  },
  {
    name: 'Printify product diagnostics require admin or internal authorization',
    file: 'app/api/printify/products/route.ts',
    pattern: /authorizeAdminApi\(request,\s*'clerk_admin_or_internal_service'\)[\s\S]*if \(!authorization\.ok\) return authorization\.response[\s\S]*fetch\(/,
  },
  {
    name: 'Metrics GET requires admin or internal authorization',
    file: 'app/api/metrics/route.ts',
    pattern: /export async function GET\(req[\s\S]*authorizeAdminApi\(req,\s*'clerk_admin_or_internal_service'\)[\s\S]*if \(!authorization\.ok\) return authorization\.response/,
  },
];

let failures = 0;

for (const check of checks) {
  const source = readFileSync(check.file, 'utf8');
  const matched = check.pattern.test(source);
  const passed = check.absent ? !matched : matched;
  if (passed) {
    console.log(`PASS ${check.name}`);
  } else {
    failures += 1;
    console.error(`FAIL ${check.name}`);
  }
}

if (failures > 0) {
  console.error(`Commerce release static checks failed: ${failures}`);
  process.exit(1);
}

console.log('Commerce release static checks passed');
