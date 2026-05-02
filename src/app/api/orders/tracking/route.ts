import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    const { orderId, trackingId, trackingUrl, changed_by = 'admin' } = await request.json();

    if (!orderId || !trackingId || !trackingUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Identify Order Safely
    let currentOrder = null;
    let isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

    if (isUuid) {
        const { data } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).single();
        currentOrder = data;
    }
    
    if (!currentOrder) {
        const { data, error: fetchError } = await supabaseAdmin.from('orders').select('*').eq('order_id', orderId).single();
        currentOrder = data;

        if (!currentOrder) {
          return NextResponse.json(
            { error: 'Order not found for given identifier' },
            { status: 404 }
          );
        }
    }

    // Update tracking info and automatically push status to shipped
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        tracking_id: trackingId,
        shiprocket_tracking_url: trackingUrl,
        status: 'shipped',
        shipped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', currentOrder.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update order tracking' },
        { status: 500 }
      );
    }

    // Add status history entry
    const { error: historyError } = await supabaseAdmin
      .from('order_status_history')
      .insert({
        order_id: updatedOrder.id,
        old_status: currentOrder.status,
        new_status: 'shipped',
        changed_by,
        notes: `Manual Tracking Input. Link: ${trackingUrl}`
      });

    if (historyError) {
      console.error('Failed to create status history entry:', historyError);
    }

    // Set Shipping Events record to maintain accurate tracking view
    const { error: eventError } = await supabaseAdmin
      .from('shipping_events')
      .insert({
        order_id: updatedOrder.id,
        event_type: 'status_changed',
        event_description: `Order successfully shipped! Tracking ID: ${trackingId}`,
        event_timestamp: new Date().toISOString(),
      });

    if (eventError) {
      console.error('Failed to create shipping event:', eventError);
    }

    // Extremely important: Send tracking email to the customer
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      fetch(`${appUrl}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentOrder.customer_email,
          orderId: currentOrder.order_id,
          customerName: currentOrder.customer_name,
          trackingLink: trackingUrl,
          type: 'order_shipped'
        }),
      }).catch(e => console.error("Non-blocking email send failure: ", e));
    } catch (emailError) {
      console.error("Failed to initiate tracking email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Tracking updated & Email triggered',
      order: updatedOrder
    });

  } catch (err: any) {
    console.error('Order tracking API error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
