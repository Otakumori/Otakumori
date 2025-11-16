import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { getPrintifyService } from '@/app/lib/printify/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Printify Diagnostic Endpoint
 * Returns status of Printify integration without exposing secrets
 */
export async function GET(_request: NextRequest) {
  const diagnostics: {
    configured: boolean;
    apiKeyPresent: boolean;
    shopIdPresent: boolean;
    connectionStatus: 'ok' | 'error' | 'not-configured';
    error?: string;
    shopId?: string; // Safe to expose - it's just an ID
  } = {
    configured: false,
    apiKeyPresent: false,
    shopIdPresent: false,
    connectionStatus: 'not-configured',
  };

  try {
    // Check environment variables
    diagnostics.apiKeyPresent = Boolean(env.PRINTIFY_API_KEY);
    diagnostics.shopIdPresent = Boolean(env.PRINTIFY_SHOP_ID);
    diagnostics.configured = diagnostics.apiKeyPresent && diagnostics.shopIdPresent;

    if (diagnostics.configured) {
      diagnostics.shopId = env.PRINTIFY_SHOP_ID;

      // Test connection by fetching shop info (lightweight request)
      try {
        const service = getPrintifyService();
        // Try to get products with limit 1 to test connection
        await service.getProducts(1, 1);
        diagnostics.connectionStatus = 'ok';
      } catch (error) {
        diagnostics.connectionStatus = 'error';
        diagnostics.error =
          error instanceof Error ? error.message : 'Failed to connect to Printify API';
      }
    } else {
      diagnostics.error = 'Printify not configured - missing API key or shop ID';
    }

    return NextResponse.json(
      {
        ok: true,
        data: diagnostics,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Diagnostic check failed',
        data: diagnostics,
      },
      { status: 500 },
    );
  }
}
