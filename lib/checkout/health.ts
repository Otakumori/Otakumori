export type HealthStatus = 'pass' | 'warn' | 'fail';

export type HealthCheck = {
  name: string;
  status: HealthStatus;
  message: string;
  detail?: Record<string, unknown>;
};

export type CheckoutHealthEnv = Record<string, string | undefined>;

export type CheckoutHealthPrisma = {
  $queryRaw: (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>;
  product: {
    count: () => Promise<number>;
  };
  productVariant: {
    count: (args: { where: { isEnabled: true; inStock: true } }) => Promise<number>;
  };
  order: {
    count: (args: { where: { status: 'pending' } }) => Promise<number>;
  };
  checkoutSession: {
    count: () => Promise<number>;
  };
  printifySyncLog: {
    count: () => Promise<number>;
  };
};

export type CheckoutHealthReport = {
  ok: boolean;
  ready: boolean;
  checkedAt: string;
  summary: Record<HealthStatus, number>;
  checks: HealthCheck[];
  nextActions: string[];
};

const REQUIRED_ENV_NAMES = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
];

const OPTIONAL_ENV_NAMES = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_APP_URL',
  'PRINTIFY_API_KEY',
  'PRINTIFY_SHOP_ID',
  'PRINTIFY_WEBHOOK_SECRET',
  'MERCHIZE_API_URL',
  'MERCHIZE_STORE_API_URL',
  'MERCHIZE_ACCESS_TOKEN',
  'MERCHIZE_API_TOKEN',
  'MERCHIZE_WEBHOOK_SECRET',
  'BLOB_READ_WRITE_TOKEN',
  'INNGEST_EVENT_KEY',
  'INNGEST_SIGNING_KEY',
  'RESEND_API_KEY',
  'EMAIL_FROM',
];

function hasValue(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0;
}

function mask(value: string | undefined) {
  if (!value) return null;
  return value.length <= 8 ? 'configured' : `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export function buildCheckoutHealthEnv(source: CheckoutHealthEnv): CheckoutHealthEnv {
  return {
    NODE_ENV: source.NODE_ENV,
    INTERNAL_AUTH_TOKEN: source.INTERNAL_AUTH_TOKEN,
    STRIPE_SECRET_KEY: source.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: source.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: source.STRIPE_WEBHOOK_SECRET,
    DATABASE_URL: source.DATABASE_URL,
    CLERK_SECRET_KEY: source.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: source.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: source.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: source.NEXT_PUBLIC_APP_URL,
    PRINTIFY_API_KEY: source.PRINTIFY_API_KEY,
    PRINTIFY_SHOP_ID: source.PRINTIFY_SHOP_ID,
    PRINTIFY_WEBHOOK_SECRET: source.PRINTIFY_WEBHOOK_SECRET,
    MERCHIZE_API_URL: source.MERCHIZE_API_URL,
    MERCHIZE_STORE_API_URL: source.MERCHIZE_STORE_API_URL,
    MERCHIZE_ACCESS_TOKEN: source.MERCHIZE_ACCESS_TOKEN,
    MERCHIZE_API_TOKEN: source.MERCHIZE_API_TOKEN,
    MERCHIZE_WEBHOOK_SECRET: source.MERCHIZE_WEBHOOK_SECRET,
    BLOB_READ_WRITE_TOKEN: source.BLOB_READ_WRITE_TOKEN,
    INNGEST_EVENT_KEY: source.INNGEST_EVENT_KEY,
    INNGEST_SIGNING_KEY: source.INNGEST_SIGNING_KEY,
    RESEND_API_KEY: source.RESEND_API_KEY,
    EMAIL_FROM: source.EMAIL_FROM,
  };
}

export function authorizeCheckoutHealthRequest(request: Request, envValues: CheckoutHealthEnv) {
  if (envValues.NODE_ENV !== 'production') return null;

  const expected = envValues.INTERNAL_AUTH_TOKEN;
  if (!hasValue(expected)) {
    return { status: 404, body: { ok: false, error: 'Not found' } };
  }

  const authHeader = request.headers.get('authorization') ?? '';
  const headerToken = request.headers.get('x-internal-auth') ?? '';
  const supplied = authHeader.replace(/^Bearer\s+/i, '').trim() || headerToken.trim();

  if (supplied !== expected) {
    return { status: 401, body: { ok: false, error: 'Unauthorized' } };
  }

  return null;
}

export function checkCheckoutEnv(name: string, envValues: CheckoutHealthEnv, optional = false): HealthCheck {
  const value = envValues[name];

  if (!hasValue(value)) {
    return {
      name,
      status: optional ? 'warn' : 'fail',
      message: optional
        ? `${name} is not configured. Related features may be incomplete.`
        : `${name} is missing. Checkout is not ready until this is configured.`,
    };
  }

  return {
    name,
    status: 'pass',
    message: `${name} is configured.`,
    detail: { masked: mask(value) },
  };
}

export async function checkCheckoutDatabase(prisma: CheckoutHealthPrisma): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.push({
      name: 'database.connection',
      status: 'pass',
      message: 'Database connection responded successfully.',
    });
  } catch (error) {
    checks.push({
      name: 'database.connection',
      status: 'fail',
      message: 'Database connection failed. Checkout cannot create orders until this is fixed.',
      detail: { error: error instanceof Error ? error.message : String(error) },
    });
    return checks;
  }

  try {
    const [productCount, enabledVariantCount] = await Promise.all([
      prisma.product.count(),
      prisma.productVariant.count({ where: { isEnabled: true, inStock: true } }),
    ]);

    checks.push({
      name: 'catalog.sellableVariants',
      status: enabledVariantCount > 0 ? 'pass' : 'warn',
      message:
        enabledVariantCount > 0
          ? 'At least one enabled, in-stock product variant exists for checkout testing.'
          : 'No enabled, in-stock product variants were found. Add a testable product variant before checkout QA.',
      detail: { productCount, enabledVariantCount },
    });
  } catch (error) {
    checks.push({
      name: 'catalog.sellableVariants',
      status: 'fail',
      message: 'Catalog readiness check failed.',
      detail: { error: error instanceof Error ? error.message : String(error) },
    });
  }

  try {
    const pendingOrderCount = await prisma.order.count({ where: { status: 'pending' } });
    checks.push({
      name: 'orders.table',
      status: 'pass',
      message: 'Order table is reachable for checkout session creation.',
      detail: { pendingOrderCount },
    });
  } catch (error) {
    checks.push({
      name: 'orders.table',
      status: 'fail',
      message: 'Order table is not reachable.',
      detail: { error: error instanceof Error ? error.message : String(error) },
    });
  }

  try {
    const checkoutSessionCount = await prisma.checkoutSession.count();
    checks.push({
      name: 'checkout_sessions.table',
      status: 'pass',
      message: 'CheckoutSession table is reachable.',
      detail: { checkoutSessionCount },
    });
  } catch (error) {
    checks.push({
      name: 'checkout_sessions.table',
      status: 'fail',
      message: 'CheckoutSession table is not reachable.',
      detail: { error: error instanceof Error ? error.message : String(error) },
    });
  }

  try {
    const printifySyncLogCount = await prisma.printifySyncLog.count();
    checks.push({
      name: 'printify_sync_logs.table',
      status: 'pass',
      message: 'PrintifySyncLog table is reachable.',
      detail: { printifySyncLogCount },
    });
  } catch (error) {
    checks.push({
      name: 'printify_sync_logs.table',
      status: 'fail',
      message: 'PrintifySyncLog table is not reachable.',
      detail: { error: error instanceof Error ? error.message : String(error) },
    });
  }

  return checks;
}

export async function buildCheckoutHealthReport(
  envValues: CheckoutHealthEnv,
  prisma: CheckoutHealthPrisma,
  now: Date = new Date(),
): Promise<CheckoutHealthReport> {
  const checks: HealthCheck[] = [
    ...REQUIRED_ENV_NAMES.map((name) => checkCheckoutEnv(name, envValues)),
    ...OPTIONAL_ENV_NAMES.map((name) => checkCheckoutEnv(name, envValues, true)),
  ];

  checks.push(...(await checkCheckoutDatabase(prisma)));

  const summary = checks.reduce(
    (acc, check) => {
      acc[check.status] += 1;
      return acc;
    },
    { pass: 0, warn: 0, fail: 0 } as Record<HealthStatus, number>,
  );

  const ready = summary.fail === 0;

  return {
    ok: ready,
    ready,
    checkedAt: now.toISOString(),
    summary,
    checks,
    nextActions:
      summary.fail > 0
        ? ['Fix failing checks before treating checkout as usable.']
        : summary.warn > 0
          ? ['Core checkout skeleton is reachable, but warnings should be resolved before launch.']
          : ['Checkout skeleton health checks are passing. Run Stripe webhook tests next.'],
  };
}
