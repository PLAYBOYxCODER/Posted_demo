import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// This endpoint receives automated tracking updates directly from Shiprocket
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Shiprocket generally sends `awb`, `current_status`, `shipment_status`
    const { awb, current_status, shipment_status } = payload;
    
    // Fallback variable for safety
    const trackingStatus = (current_status || shipment_status || '').toUpperCase();

    if (!awb || !trackingStatus) {
      return NextResponse.json({ error: 'Missing AWB or tracking status' }, { status: 400 });
    }

    // 1. Map Shiprocket Status to Our Internal Status
    let newInternalStatus: string | null = null;
    let description = trackingStatus;

    if (trackingStatus.includes('DELIVERED')) {
       newInternalStatus = 'delivered';
       description = 'Package successfully delivered.';
    } else if (trackingStatus.includes('OUT FOR DELIVERY') || trackingStatus.includes('REACHED DESTINATION')) {
       newInternalStatus = 'near_city';
       description = 'Package has reached your local city and is out for delivery.';
    } else if (trackingStatus.includes('IN TRANSIT') || trackingStatus.includes('SHIPPED')) {
       newInternalStatus = 'shipped';
       description = 'Package is currently moving through courier network.';
    } else if (trackingStatus.includes('RTO') || trackingStatus.includes('CANCELLED') || trackingStatus.includes('RETURNED')) {
       newInternalStatus = 'cancelled';
       description = 'Shipment returned or cancelled by courier.';
    }

    if (!newInternalStatus) {
       // Just acknowledge but don't change core status if we don't recognize the intermediate state
       return NextResponse.json({ success: true, message: `Ignored intermediate status: ${trackingStatus}` });
    }

    // 2. Fetch the corresponding order in our DB using the AWB tracking ID!
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('tracking_id', awb)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found for AWB' }, { status: 404 });
    }

    // Don't update if it's already the exact same status
    if (order.status === newInternalStatus) {
       return NextResponse.json({ success: true, message: 'Status already up to date.' });
    }

    // 3. Update the Order in Supabase
    const updatePayload: any = {
       status: newInternalStatus,
       updated_at: new Date().toISOString()
    };
    if (newInternalStatus === 'delivered') {
       updatePayload.delivered_at = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', order.id);

    if (updateError) throw new Error('Failed to update order status');

    // 4. Log to history
    await supabaseAdmin
      .from('order_status_history')
      .insert({
        order_id: order.id,
        old_status: order.status,
        new_status: newInternalStatus,
        changed_by: 'Shiprocket Webhook',
        notes: `Automated Courier Update: ${description}`
      });

    // We successfully completed an automated webhook trigger!
    console.log(`Shiprocket Webhook Automated Order ${order.id} via AWB ${awb} to ${newInternalStatus}`);

    return NextResponse.json({ success: true, mapped_status: newInternalStatus });

  } catch (err: any) {
    console.error('Shiprocket Webhook Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
