import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get('id');

    if (!trackingId) {
      return NextResponse.json({ error: 'Tracking ID is required' }, { status: 400 });
    }

    // Attempt to locate order by either Order ID or Shiprocket Tracking AWB logic
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('order_id, created_at, status, shipping_address, tracking_id, shiprocket_tracking_url')
      .eq('order_id', trackingId)
      .single();

    if (error || !order) {
       // Support fallbacks, see if it is tracking_id AWB
       const { data: awbOrder, error: awbError } = await supabaseAdmin
       .from('orders')
       .select('order_id, created_at, status, shipping_address, tracking_id, shiprocket_tracking_url')
       .eq('tracking_id', trackingId)
       .single();

       if(awbError || !awbOrder) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
       }
       
       return NextResponse.json({
          id: awbOrder.order_id,
          date: new Date(awbOrder.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          status: awbOrder.status,
          city: awbOrder.shipping_address?.city || 'Processing Hub',
          awb: awbOrder.tracking_id || null,
          trackingUrl: awbOrder.shiprocket_tracking_url || null
       });
    }

    return NextResponse.json({
      id: order.order_id,
      date: new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      status: order.status,
      city: order.shipping_address?.city || 'Processing Hub',
      awb: order.tracking_id || null,
      trackingUrl: order.shiprocket_tracking_url || null
    });

  } catch (error) {
    console.error('Tracking fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
