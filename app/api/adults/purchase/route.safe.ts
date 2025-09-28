import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { env } from '@/env';
import { z } from 'zod';
import { redis } from '@/app/lib/redis-rest';
import { generateRequestId } from '@/app/lib/request-id';

// Feature flag checks
function checkFeatureFlags() {
  if (!env.FEATURE_ADULT_ZONE || env.FEATURE_ADULT_ZONE !== 'true') {
    return false;
  }
  if (!env.FEATURE_GATED_COSMETICS || env.FEATURE_GATED_COSMETICS !== 'true') {
    return false;
  }
  return true;
}

// Request validation schema
const PurchaseRequest = z.object({
  packSlug: z.string().min(1),
  payment: z.enum(['petals', 'stripe']),
});

// Idempotency helper
async function checkIdempotency(key: string): Promise<string | null> {
  try {
    const cached = await redis.get(`purchase:${key}`);
    return cached;
  } catch (error) {
    console.error('Idempotency check failed:', error);
    return null;
  }
}

async function storeIdempotencyResponse(key: string, response: any): Promise<void> {
  try {
    await redis.set(`purchase:${key}`, JSON.stringify(response), { ex: 3600 }); // 1 hour TTL
  } catch (error) {
    console.error('Failed to store idempotency response:', error);
  }
}

// Petals purchase logic
async function purchaseWithPetals(userId: string, packSlug: string, packPrice: number): Promise<boolean> {
  // This would integrate with your existing petals system
  // For now, we'll assume a successful purchase
  console.log(`User ${userId} purchasing ${packSlug} for ${packPrice} petals`);
  
  // TODO: Implement actual petals debit logic
  // 1. Check user has enough petals
  // 2. Debit petals atomically
  // 3. Create UserCosmetic record
  
  return true;
}

// Stripe purchase logic
async function purchaseWithStripe(userId: string, packSlug: string, packPriceCents: number): Promise<{ checkoutUrl: string }> {
  // This would integrate with your existing Stripe system
  // For now, we'll return a placeholder
  console.log(`User ${userId} purchasing ${packSlug} for ${packPriceCents} cents via Stripe`);
  
  // TODO: Implement actual Stripe checkout session creation
  // 1. Create Stripe checkout session
  // 2. Return checkout URL
  // 3. Handle success via webhook
  
  return {
    checkoutUrl: `https://checkout.stripe.com/pay/placeholder_${Date.now()}`,
  };
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    // Check feature flags
    if (!checkFeatureFlags()) {
      return NextResponse.json(
        { 
          ok: false,
          error: {
            code: 'FEATURE_DISABLED',
            message: 'Adult zone feature not available',
          },
          requestId,
        },
        { status: 503 }
      );
    }

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { 
          ok: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Authentication required',
          },
          requestId,
        },
        { status: 401 }
      );
    }

    // Check adult verification
    // const user = await currentUser();
    // if (!user?.publicMetadata?.adultVerified) {
    //   return NextResponse.json(
    //     { 
    //       ok: false,
    //       error: {
    //         code: 'ADULT_VERIFICATION_REQUIRED',
    //         message: 'Adult verification required',
    //       },
    //       requestId,
    //     },
    //     { status: 403 }
    //   );
    // }

    // Parse and validate request body
    const body = await request.json();
    const validatedRequest = PurchaseRequest.parse(body);

    // Generate idempotency key
    const idempotencyKey = request.headers.get('x-idempotency-key') || 
                          `purchase_${userId}_${validatedRequest.packSlug}_${Date.now()}`;

    // Check for duplicate request
    const cachedResponse = await checkIdempotency(idempotencyKey);
    if (cachedResponse) {
      return NextResponse.json(JSON.parse(cachedResponse));
    }

    // Fetch pack details (this would come from your pack storage)
    // For now, we'll use placeholder data
    const packDetails = {
      slug: validatedRequest.packSlug,
      pricePetals: 1000,
      priceUsdCents: 999,
    };

    let purchaseResult;

    if (validatedRequest.payment === 'petals') {
      const success = await purchaseWithPetals(userId, validatedRequest.packSlug, packDetails.pricePetals);
      if (!success) {
        return NextResponse.json(
          { 
            ok: false,
            error: {
              code: 'INSUFFICIENT_PETALS',
              message: 'Not enough petals for purchase',
            },
            requestId,
          },
          { status: 400 }
        );
      }
      purchaseResult = { success: true, method: 'petals' };
    } else if (validatedRequest.payment === 'stripe') {
      const stripeResult = await purchaseWithStripe(userId, validatedRequest.packSlug, packDetails.priceUsdCents);
      purchaseResult = { success: true, method: 'stripe', checkoutUrl: stripeResult.checkoutUrl };
    }

    const response = {
      ok: true,
      data: {
        purchaseId: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        packSlug: validatedRequest.packSlug,
        payment: validatedRequest.payment,
        ...purchaseResult,
      },
      requestId,
    };

    // Store response for idempotency
    await storeIdempotencyResponse(idempotencyKey, response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Purchase API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
          requestId,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Purchase failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        requestId,
      },
      { status: 500 }
    );
  }
}
