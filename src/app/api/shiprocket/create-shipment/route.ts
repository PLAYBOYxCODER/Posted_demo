import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Dedicated server client to bypass RLS for DB inserts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummyproject.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key'
);

// Shiprocket Create Shipment API
// This endpoint creates a shipment with Shiprocket and updates the order

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order details from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found', details: orderError?.message },
        { status: 404 }
      );
    }

    // Check if order is already shipped
    if (order.status === 'shipped' || order.tracking_id) {
      return NextResponse.json(
        { error: 'Order is already shipped' },
        { status: 400 }
      );
    }

    // Get Shiprocket credentials from environment variables
    const shiprocketEmail = process.env.SHIPROCKET_EMAIL;
    const shiprocketPassword = process.env.SHIPROCKET_PASSWORD;

    if (!shiprocketEmail || !shiprocketPassword) {
      return NextResponse.json(
        { error: 'Shiprocket credentials not configured' },
        { status: 500 }
      );
    }

    // Authenticate with Shiprocket
    const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: shiprocketEmail,
        password: shiprocketPassword,
      }),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      return NextResponse.json(
        { error: 'Shiprocket authentication failed', details: errorData },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();
    const token = authData.token;

    // Parse shipping address
    const shippingAddress = order.shipping_address;
    const productDetails = order.product_details;

    // Prepare shipment data for Shiprocket
    const shipmentData = {
      order_id: order.order_id,
      order_date: order.created_at,
      pickup_location: "Primary", // or your pickup location
      channel_id: "", // optional
      comment: "Order created via Poster Store",
      billing_customer_name: order.customer_name || "Customer",
      billing_last_name: "",
      billing_address: shippingAddress.street,
      billing_address_2: "",
      billing_city: shippingAddress.city,
      billing_pincode: shippingAddress.postal_code,
      billing_state: shippingAddress.state,
      billing_country: shippingAddress.country,
      billing_email: order.customer_email,
      billing_phone: order.customer_phone,
      shipping_is_billing: true,
      shipping_customer_name: order.customer_name || "Customer",
      shipping_last_name: "",
      shipping_address: shippingAddress.street,
      shipping_address_2: "",
      shipping_city: shippingAddress.city,
      shipping_pincode: shippingAddress.postal_code,
      shipping_state: shippingAddress.state,
      shipping_country: shippingAddress.country,
      shipping_email: order.customer_email,
      shipping_phone: order.customer_phone,
      order_items: productDetails.items.map((item: any) => ({
        name: item.name,
        sku: item.id,
        units: item.quantity,
        selling_price: item.price,
        discount: "",
        tax: "",
        hsn: "",
      })),
      payment_method: order.payment_method === 'razorpay' ? "Prepaid" : "COD",
      shipping_charges: order.shipping_cost || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: productDetails.subtotal,
      length: 20, // Default dimensions - you may want to calculate based on products
      breadth: 15,
      height: 5,
      weight: 0.5, // Default weight - you may want to calculate based on products
    };

    // Create shipment with Shiprocket
    const shipmentResponse = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shipmentData),
    });

    if (!shipmentResponse.ok) {
      const errorData = await shipmentResponse.json();
      return NextResponse.json(
        { error: 'Failed to create shipment', details: errorData },
        { status: 400 }
      );
    }

    const shipmentResult = await shipmentResponse.json();

    // Extract shipment details
    const shipmentId = shipmentResult.shipment_id;
    const awbCode = shipmentResult.awb_code;
    const courierName = shipmentResult.courier_name;
    const trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;

    // Update order in database with tracking information
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'shipped',
        tracking_id: awbCode,
        courier_name: courierName,
        shiprocket_order_id: shipmentResult.order_id?.toString(),
        shiprocket_shipment_id: shipmentId?.toString(),
        shiprocket_tracking_url: trackingUrl,
        shipped_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update order:', updateError);
      return NextResponse.json(
        { error: 'Shipment created but failed to update order', details: updateError.message },
        { status: 500 }
      );
    }

    // Create order status history entry
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: updatedOrder.id,
        old_status: order.status,
        new_status: 'shipped',
        changed_by: 'system',
        notes: `Shipment created via Shiprocket. AWB: ${awbCode}, Courier: ${courierName}`,
      });

    if (historyError) {
      console.error('Failed to create status history:', historyError);
    }

    // Create shipping event
    const { error: eventError } = await supabase
      .from('shipping_events')
      .insert({
        order_id: updatedOrder.id,
        event_type: 'shipped',
        event_description: `Shipment created with ${courierName}`,
        event_timestamp: new Date().toISOString(),
        raw_shiprocket_data: shipmentResult,
      });

    if (eventError) {
      console.error('Failed to create shipping event:', eventError);
    }

    // Trigger email notification (call email API)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: order.customer_email,
          orderId: order.order_id,
          trackingId: awbCode,
          customerName: order.customer_name,
        }),
      });
    } catch (emailError) {
      console.error('Failed to send shipping email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      shipment: {
        shipment_id: shipmentId,
        awb_code: awbCode,
        courier_name: courierName,
        tracking_url: trackingUrl,
        estimated_delivery: shipmentResult.estimated_delivery_date,
      },
      order: updatedOrder,
    });

  } catch (error) {
    console.error('Create shipment error:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating shipment' },
      { status: 500 }
    );
  }
}

// GET endpoint to track shipment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get('tracking_id');

    if (!trackingId) {
      return NextResponse.json(
        { error: 'Tracking ID is required' },
        { status: 400 }
      );
    }

    // Get Shiprocket credentials
    const shiprocketEmail = process.env.SHIPROCKET_EMAIL;
    const shiprocketPassword = process.env.SHIPROCKET_PASSWORD;

    if (!shiprocketEmail || !shiprocketPassword) {
      return NextResponse.json(
        { error: 'Shiprocket credentials not configured' },
        { status: 500 }
      );
    }

    // Authenticate
    const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: shiprocketEmail,
        password: shiprocketPassword,
      }),
    });

    if (!authResponse.ok) {
      return NextResponse.json(
        { error: 'Shiprocket authentication failed' },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();
    const token = authData.token;

    // Track shipment
    const trackingResponse = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${trackingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!trackingResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to track shipment' },
        { status: 400 }
      );
    }

    const trackingData = await trackingResponse.json();

    return NextResponse.json({
      success: true,
      tracking_data: trackingData,
    });

  } catch (error) {
    console.error('Track shipment error:', error);
    return NextResponse.json(
      { error: 'Internal server error while tracking shipment' },
      { status: 500 }
    );
  }
}
