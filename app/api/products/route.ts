export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseWithToken } from '@/app/lib/supabaseClient';
import { env } from '@/env';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const includeVariants = searchParams.get('variants') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = `
      SELECT 
        p.*,
        ${includeVariants ? 'v.id as variant_id, v.title as variant_title, v.price_cents as variant_price_cents, v.sku, v.options' : ''}
      FROM products p
      ${includeVariants ? 'LEFT JOIN variants v ON p.id = v.product_id' : ''}
      WHERE p.visible = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (subcategory) {
      query += ` AND p.subcategory = $${paramIndex}`;
      params.push(subcategory);
      paramIndex++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // For now, use the basic Supabase client since this is public data
    // In production, you might want to add rate limiting here
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase.rpc('exec_sql', {
      query,
      params
    });

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Transform data if variants are included
    let products;
    if (includeVariants) {
      // Group by product and collect variants
      const productMap = new Map();
      data.forEach((row: any) => {
        if (!productMap.has(row.id)) {
          productMap.set(row.id, {
            id: row.id,
            title: row.title,
            description: row.description,
            category: row.category,
            subcategory: row.subcategory,
            image_url: row.image_url,
            price_cents: row.price_cents,
            created_at: row.created_at,
            updated_at: row.updated_at,
            variants: []
          });
        }
        
        if (row.variant_id) {
          productMap.get(row.id).variants.push({
            id: row.variant_id,
            title: row.variant_title,
            price_cents: row.variant_price_cents,
            sku: row.sku,
            options: row.options
          });
        }
      });
      products = Array.from(productMap.values());
    } else {
      products = data;
    }

    return NextResponse.json({
      products,
      pagination: {
        limit,
        offset,
        total: products.length
      }
    });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
