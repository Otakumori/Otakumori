# Commerce persistence recovery

This local candidate adds only the Prisma persistence required by signed Stripe event
reconciliation and Printify submission tracking:

- `WebhookEvent.updatedAt`;
- `OrderItem.createdAt` and `OrderItem.updatedAt`;
- `StripeCustomer.createdAt` and `StripeCustomer.updatedAt`;
- `FinancialTransaction` with its Prisma-declared indexes and `Order` foreign key;
- `PrintifyOrderSync` with its unique local-order claim, indexes, and `Order` foreign key.

Existing rows receive `CURRENT_TIMESTAMP` during the additive timestamp backfill. Those values are
synthetic compatibility timestamps, not historical business-event timestamps. Prisma continues to
manage `@updatedAt`; the temporary database defaults are removed after the backfill.

The migration accepts either the reviewed 23-migration Production baseline or the 24-migration
baseline containing `20261102193000_beta_runtime_compatibility`. It does not duplicate or modify
that protected migration, and it fails if target objects already exist or the migration ledger has
unresolved entries.

Checkout remains source-disabled. Outbound Printify order submission has a separate,
source-controlled admission gate that defaults disabled even when credentials exist. Signed Stripe
events may still verify, record paid/refund truth, and leave fulfillment for operator review without
contacting Printify.

`20261112160000_commerce_persistence_compatibility` is the sole canonical migration identity.
The later local draft identity was removed before rehearsal so Prisma can never see two overlapping
commerce migrations.

Do not apply this migration to Production or an existing Preview without separate authorization,
positive target identity verification, a reviewed migration checksum, and an isolated rehearsal.
Do not automatically drop the new tables or columns after they have accepted audit records; prefer
an owner-approved forward repair or verified point-in-time recovery.
