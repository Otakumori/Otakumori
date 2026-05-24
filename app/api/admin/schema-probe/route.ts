import { createHash } from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
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

export const GET = withAdminAuth(async (_request: NextRequest) => {
  const dbInfo = await prisma.$queryRaw<DbInfoRow[]>`
    select
      current_database() as database,
      current_schema() as schema,
      inet_server_addr()::text as server_addr,
      inet_server_port() as server_port
  `;

  const tables = await prisma.$queryRaw<TableRow[]>`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('Product', 'ProductVariant', 'PrintifySyncLog', 'ProductImage')
    order by table_name
  `;

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
});
