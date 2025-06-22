'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.GET = GET;
const server_1 = require('next/server');
const supabase_js_1 = require('@supabase/supabase-js');
// Initialize Supabase client
const supabase = (0, supabase_js_1.createClient)(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
async function GET(request, { params }) {
  try {
    // Fetch order from Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', params.id)
      .single();
    if (error) {
      throw new Error('Failed to fetch order');
    }
    if (!order) {
      return server_1.NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return server_1.NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return server_1.NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
