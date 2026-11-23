# Commerce and financial reporting release gate

This runbook records engineering prerequisites. It does not authorize checkout, fulfillment,
tax registration, filing, banking, refunds, or provider changes.

## Merchant authority

- Canonical Stripe merchant account: `acct_1RwMJgHN4OLBC1u4`.
- Production must set `STRIPE_EXPECTED_ACCOUNT_ID` to that account and `STRIPE_MODE=live` only
  with a live credential for that same account.
- Non-live acceptance must use a separately verified test or sandbox credential and
  `STRIPE_MODE=test`. Preview must not inherit live Stripe or Printify credentials.
- Runtime provider use calls Stripe's current-account endpoint and fails closed unless the
  returned account is the canonical US merchant.
- Webhook signing secrets are environment-specific. Rotate a key or signing secret by adding the
  replacement, verifying merchant identity and signed delivery, then revoking only the superseded
  credential. Never place values in source, logs, or reports.

## Tax owner and professional-review checklist

- Confirm the legal entity behind the DBA and whether Stripe's current `company` classification
  is correct. Do not change it without owner authorization and professional review.
- Confirm Massachusetts sales-tax registration and retain the ST-1 certificate before enabling
  collection there. Record only confirmed registrations in `lib/finance/tax-registry.ts`.
- Have a tax professional determine nexus and registration duties in every other destination
  jurisdiction. A known rate is not collection authority.
- Assign and review Stripe product tax codes. Massachusetts generally exempts qualifying clothing
  up to $175 per item, but classification, discounts, shipping, protective clothing, and mixed
  baskets require transaction-specific review.
- Verify Stripe Tax settings, registrations, product codes, shipping treatment, customer location
  collection, refunds, and filing service scope. Stripe calculation does not itself prove filing
  or remittance.
- Select filing frequencies and reconciliation ownership. Returns may be required for zero-tax
  periods after registration.

Primary references:

- Stripe Tax Checkout: https://docs.stripe.com/tax/checkout
- Stripe tax registrations: https://docs.stripe.com/tax/registrations-api
- Massachusetts sales and use tax: https://www.mass.gov/guides/sales-and-use-tax
- Massachusetts clothing exemption: https://www.mass.gov/info-details/mass-general-laws-c64h-ss-6

## Reporting and release boundaries

- Financial workbooks use cash-method reporting, `America/New_York`, integer minor units, and the
  canonical `Order`, `OrderItem`, `FinancialTransaction`, and `PrintifyOrderSync` records.
- Admin-generated workbooks are returned directly with private, no-store headers. Only a manifest
  is persisted; workbook bytes are not written to public storage.
- Scheduled workbook retention remains blocked until owner-approved private storage and an
  explicit report-storage admission gate exist. Reports must never be emailed, shared, filed, or
  submitted automatically.
- Checkout and Printify submission remain source-disabled. Production activation requires a
  separate owner-approved change after migrations, tax registrations, provider identity,
  fulfillment recovery, and test-mode transaction acceptance are complete.

## Preview configuration correction request

Keep the Neon-managed branch-specific `DATABASE_URL` and `DATABASE_URL_UNPOOLED`. Keep dedicated
development Clerk credentials. Preview must have no live Stripe, Printify, Redis, QStash, Blob,
Inngest, email, search-administration, or legacy database credentials. If an isolated Preview
resource is later required, add a branch-specific credential and its explicit isolation
attestation; never reuse Production values.
