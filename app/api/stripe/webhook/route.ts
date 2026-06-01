export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  return Response.json(
    {
      ok: false,
      error: 'This Stripe webhook endpoint is retired. Use /api/webhooks/stripe.',
    },
    { status: 410 },
  );
}
