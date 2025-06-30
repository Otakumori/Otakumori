import { NextResponse } from 'next/server';
import { supabase } from '../../../../../utils/supabase/client';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

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
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
