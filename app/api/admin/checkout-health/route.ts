export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { env } from '@/env';
import { authorizeCheckoutHealthRequest, buildCheckoutHealthEnv, buildCheckoutHealthReport } from '@/lib/checkout/health';

export async function GET(request: Request) {
  const envValues = buildCheckoutHealthEnv(env);
  const authFailure = authorizeCheckoutHealthRequest(request, envValues);
  if (authFailure) return NextResponse.json(authFailure.body, { status: authFailure.status });
  const report = await buildCheckoutHealthReport(envValues, prisma);

  return NextResponse.json(
    report,
    { status: report.ready ? 200 : 503 },
  );
}
