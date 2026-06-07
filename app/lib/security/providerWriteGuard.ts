import { type NextRequest, NextResponse } from 'next/server';
import { authorizeAdminApi } from '@/app/lib/auth/admin';

export type ProviderWriteCapability = 'printify_order_create' | 'shipping_label_purchase';

function isProviderWriteEnabled() {
  return (
    process.env.PROVIDER_WRITES_ENABLED === 'true' ||
    process.env.ALLOW_PROVIDER_WRITES === 'true'
  );
}

export async function authorizeProviderWrite(
  request: NextRequest,
  capability: ProviderWriteCapability,
) {
  if (!isProviderWriteEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error: 'PROVIDER_WRITES_DISABLED',
        capability,
      },
      { status: 503, headers: { 'x-otm-provider-write': 'disabled' } },
    );
  }

  const authorization = await authorizeAdminApi(request, 'clerk_admin_or_internal_service');
  if (!authorization.ok) return authorization.response;

  return null;
}
