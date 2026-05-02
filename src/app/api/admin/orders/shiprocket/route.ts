import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getShiprocketToken, createShiprocketOrder, assignAwb } from '@/lib/shiprocket';

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // 1. Fetch Order from Supabase
    // Try to match either the Supabase UUID or the readable order_id
    const { data: order, error: dbError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (dbError || !order) {
      return NextResponse.json({ error: 'Order not found in database', details: dbError }, { status: 404 });
    }

    // Verify it doesn't already have an AWB
    if (order.tracking_id) {
       return NextResponse.json({ error: 'Order already has a tracking ID associated', tracking_id: order.tracking_id }, { status: 400 });
    }

    // 2. Generate Shiprocket Token
    const token = await getShiprocketToken();
    if (!token) {
        return NextResponse.json({ error: 'Failed to authenticate with Shiprocket API' }, { status: 500 });
    }

    // 3. Prepare Payload
    const items = (order.product_details?.items || []).map((item: any) => ({
      name: item.name || 'Poster Artwork',
      sku: item.id || 'POSTER-01',
      units: item.quantity || 1,
      selling_price: item.price || 499,
      discount: 0,
      tax: 0,
      hsn: 491110 // standard printed items
    }));

    const dateStr = new Date(order.created_at).toISOString().split('T')[0];
    const shipping = order.shipping_address || {};

    const shiprocketPayload = {
      order_id: order.order_id, // Unique string e.g. ORD12345
      order_date: dateStr,
      pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary", // Configured in Shiprocket Dashboard -> Settings -> Pickup Address
      billing_customer_name: order.customer_name?.split(' ')[0] || 'Customer',
      billing_last_name: order.customer_name?.split(' ').slice(1).join(' ') || 'User',
      billing_address: shipping.street || 'Address Line 1',
      billing_city: shipping.city || 'Mumbai',
      billing_pincode: shipping.postal_code || '400001',
      billing_state: shipping.state || 'Maharashtra',
      billing_country: shipping.country || 'India',
      billing_email: order.customer_email || 'example@example.com',
      billing_phone: order.customer_phone || '9999999999',
      shipping_is_billing: true,
      order_items: items,
      payment_method: order.payment_status === 'paid' ? 'Prepaid' : 'COD',
      shipping_charges: order.shipping_cost || 0,
      sub_total: order.product_details?.subtotal || order.product_details?.total || 499,
      length: 10,  // Standard small poster dimension estimates
      breadth: 10,
      height: 10,
      weight: 0.5
    };

    // 4. Create Order in Shiprocket
    const srResponse = await createShiprocketOrder(token, shiprocketPayload);

    // If SR error (e.g. pickup location wrong, existing order)
    if (srResponse.error || !srResponse.order_id || !srResponse.shipment_id) {
        return NextResponse.json({ error: 'Shiprocket Order Rejection', details: srResponse }, { status: 400 });
    }

    const { order_id: sr_order_id, shipment_id } = srResponse;

    // 5. Instantly Assign AWB via Shiprocket
    const awbData = await assignAwb(token, shipment_id);
    const awb_code = awbData?.response?.data?.awb_code || null;

    // 6. Update Supabase with tracking details & new status
    const updatePayload: any = {
       shiprocket_order_id: sr_order_id.toString(),
       shiprocket_shipment_id: shipment_id.toString(),
       status: 'shipped', // Automatically push to shipped
       updated_at: new Date().toISOString(),
       shipped_at: new Date().toISOString()
    };
    
    if (awb_code) {
        updatePayload.tracking_id = awb_code;
        updatePayload.shiprocket_tracking_url = `https://shiprocket.co/tracking/${awb_code}`;
    }

    const { error: finalDbError } = await supabaseAdmin
       .from('orders')
       .update(updatePayload)
       .eq('id', orderId);

    if (finalDbError) {
        console.error('Final DB Update Error:', finalDbError);
    }

    return NextResponse.json({
        success: true,
        message: 'Successfully integrated with Shiprocket',
        tracking_id: awb_code,
        shiprocket_order_id: sr_order_id
    });

  } catch (error: any) {
    console.error('Shiprocket API route error:', error);
    return NextResponse.json({ error: error.message || 'Error executing Shiprocket sync' }, { status: 500 });
  }
}
