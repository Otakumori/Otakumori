export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import {
  buildCheckoutHealthEnv,
  buildCheckoutHealthReport,
} from '@/lib/checkout/health';
import { env } from '@/env';
import { authorizeAdminApi } from '@/app/lib/auth/admin';

export async function GET(request: Request) {
  const authorization = await authorizeAdminApi(request, 'clerk_admin_or_internal_service');
  if (!authorization.ok) return authorization.response;

  const envValues = buildCheckoutHealthEnv(env);
  const report = await buildCheckoutHealthReport(envValues, prisma);

  return NextResponse.json(report, { status: report.ready ? 200 : 503 });
}
