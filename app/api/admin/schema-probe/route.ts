import { createHash } from 'node:crypto';
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/app/lib/auth/admin';
import { ADMIN_EMAILS, isAdminEmail } from '@/app/lib/config/admin';
import { env } from '@/env/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type DbInfoRow = {
  database: string;
  schema: string;
  server_addr: string | null;
  server_port: number | null;
};

type TableRow = {
  table_name: string;
};

type ColumnRow = {
  table_name: string;
  column_name: string;
};

type SessionClaimsLike = Record<string, unknown> & {
  email?: string;
  primary_email_address?: string;
  publicMetadata?: Record<string, unknown>;
  privateMetadata?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

function sanitizeSchemaProbeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  return message
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]')
    .replace(/(sk|pk)_(live|test)_[A-Za-z0-9_]+/gi, '$1_$2_[redacted]')
    .replace(/(postgres(?:ql)?:\/\/)[^\s"']+/gi, '$1[redacted]')
    .slice(0, 500);
}

function databaseFingerprint() {
  const value = env.DATABASE_URL ?? '';
  const hash = createHash('sha256').update(value).digest('hex').slice(0, 12);

  try {
    const parsed = new URL(value);
    return {
      hash,
      protocol: parsed.protocol.replace(':', ''),
      host: parsed.hostname,
      database: parsed.pathname.replace(/^\//, '') || null,
      schema: parsed.searchParams.get('schema') ?? 'public',
    };
  } catch {
    return {
      hash,
      protocol: null,
      host: null,
      database: null,
      schema: null,
    };
  }
}

function hasAdminClaim(sessionClaims: unknown): boolean {
  if (!sessionClaims || typeof sessionClaims !== 'object') {
    return false;
  }

  const claims = sessionClaims as SessionClaimsLike;
  const roleCandidates = [
    claims.publicMetadata?.role,
    claims.privateMetadata?.role,
    claims.metadata?.role,
    claims.role,
  ];

  if (roleCandidates.some((role) => role === 'admin')) {
    return true;
  }

  const emailCandidates = [
    claims.email,
    claims.primary_email_address,
    typeof claims.primary_email_address === 'string' ? claims.primary_email_address : null,
  ];

  return emailCandidates.some((email) => typeof email === 'string' && isAdminEmail(email));
}

function safeClaimKeys(sessionClaims: unknown): string[] {
  if (!sessionClaims || typeof sessionClaims !== 'object') {
    return [];
  }

  return Object.keys(sessionClaims as Record<string, unknown>)
    .filter((key) => !/token|secret|jwt|session/i.test(key))
    .slice(0, 30);
}

export async function GET() {
  let stage = 'auth';

  try {
    const authResult = await auth();
    const { userId, sessionClaims } = authResult;

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED' },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    let adminAllowed = hasAdminClaim(sessionClaims);
    let currentUserError: string | null = null;

    if (!adminAllowed) {
      stage = 'auth_current_user';

      try {
        const user = await currentUser();
        adminAllowed = isAdmin(user);
      } catch (error) {
        currentUserError = sanitizeSchemaProbeError(error);
      }
    }

    if (!adminAllowed) {
      return NextResponse.json(
        {
          ok: false,
          error: 'FORBIDDEN',
          auth: {
            hasUserId: Boolean(userId),
            hasSessionClaims: Boolean(sessionClaims),
            claimKeys: safeClaimKeys(sessionClaims),
            adminEmailsConfigured: ADMIN_EMAILS.length,
            currentUserError,
          },
        },
        { status: 403, headers: { 'x-otm-reason': 'FORBIDDEN' } },
      );
    }

    stage = 'db_info';
    const dbInfo = await prisma.$queryRaw<DbInfoRow[]>`
      select
        current_database() as database,
        current_schema() as schema,
        inet_server_addr()::text as server_addr,
        inet_server_port() as server_port
    `;

    stage = 'tables';
    const tables = await prisma.$queryRaw<TableRow[]>`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name in ('Product', 'ProductVariant', 'PrintifySyncLog', 'ProductImage')
      order by table_name
    `;

    stage = 'columns';
    const columns = await prisma.$queryRaw<ColumnRow[]>`
      select
        table_name,
        column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name in ('Product', 'ProductVariant', 'PrintifySyncLog')
        and column_name in (
          'category_slug',
          'integration_ref',
          'last_synced_at',
          'created_at',
          'updated_at'
        )
      order by table_name, column_name
    `;

    const tableNames = new Set(tables.map((row) => row.table_name));
    const columnNames = new Set(columns.map((row) => `${row.table_name}.${row.column_name}`));

    stage = 'response';
    return NextResponse.json({
      ok: true,
      data: {
        checkedAt: new Date().toISOString(),
        database: dbInfo[0] ?? null,
        databaseUrlFingerprint: databaseFingerprint(),
        tables: {
          Product: tableNames.has('Product'),
          ProductVariant: tableNames.has('ProductVariant'),
          ProductImage: tableNames.has('ProductImage'),
          PrintifySyncLog: tableNames.has('PrintifySyncLog'),
        },
        columns: {
          Product_category_slug: columnNames.has('Product.category_slug'),
          Product_integration_ref: columnNames.has('Product.integration_ref'),
          Product_last_synced_at: columnNames.has('Product.last_synced_at'),
          Product_created_at: columnNames.has('Product.created_at'),
          Product_updated_at: columnNames.has('Product.updated_at'),
          ProductVariant_last_synced_at: columnNames.has('ProductVariant.last_synced_at'),
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'SCHEMA_PROBE_FAILED',
          stage,
          message: sanitizeSchemaProbeError(error),
        },
      },
      { status: 500 },
    );
  }
}
