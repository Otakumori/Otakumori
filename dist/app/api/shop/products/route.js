'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.GET = GET;
const server_1 = require('next/server');
const printifyAPI_1 = require('@/utils/printifyAPI');
const client_1 = require('@/utils/supabase/client');
async function GET() {
  try {
    // Fetch products from Printify
    const printifyProducts = await (0, printifyAPI_1.fetchProducts)();
    // Transform and store in Supabase
    const transformedProducts = printifyProducts.data.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.variants[0]?.price / 100 || 0,
      images: product.images.map(img => img.src),
      variants: product.variants,
      category: product.tags[0] || 'Other',
      tags: product.tags,
      metadata: {
        printify_id: product.id,
        published: product.published,
        created_at: product.created_at,
        updated_at: product.updated_at,
      },
    }));
    // Upsert products to Supabase
    const { error } = await client_1.supabase.from('products').upsert(transformedProducts, {
      onConflict: 'id',
      ignoreDuplicates: false,
    });
    if (error) {
      (0, client_1.handleSupabaseError)(error);
    }
    return server_1.NextResponse.json({ products: transformedProducts }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/shop/products:', error);
    return server_1.NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}
