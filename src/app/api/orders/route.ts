import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Dedicated server client to bypass RLS for DB inserts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummyproject.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key'
);

// Enhanced Orders API with Shiprocket Integration
// This handles order creation, management, and status updates

export async function POST(request: NextRequest) {
  try {
    const {
      customer_email,
      customer_name,
      customer_phone,
      shipping_address,
      product_details,
      payment_method = 'razorpay',
      payment_id,
      notes
    } = await request.json();

    // Validate required fields
    if (!customer_email || !shipping_address || !product_details) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_email, shipping_address, product_details' },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const orderId = "ORD" + Date.now();

    // Create order in database
    const subtotalCalc = product_details?.subtotal || product_details?.total || 0;
    const totalCalc = product_details?.total || 0;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        customer_email,
        customer_name: customer_name || '',
        customer_phone: customer_phone || '',
        shipping_address,
        product_details,
        subtotal: subtotalCalc,
        discount_amount: 0.00,
        total_paid: totalCalc,
        payment_method,
        payment_id,
        payment_status: 'pending',
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      );
    }

    // Create order status history entry
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: order.id,
        old_status: null,
        new_status: 'pending',
        changed_by: 'customer',
        notes: 'Order created successfully',
      });

    if (historyError) {
      console.error('Failed to create status history:', historyError);
    }

    // Send order confirmation email (async, don't wait)
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      await fetch(`${appUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customer_email,
          orderId: orderId,
          customerName: customer_name,
          type: 'order_confirmation',
          paymentMethod: payment_method,
          totalPrice: totalCalc,
          productDetails: product_details
        }),
      });
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_id: order.order_id,
        status: order.status,
        payment_status: order.payment_status,
        created_at: order.created_at,
        customer_email: order.customer_email,
        total: product_details.total,
      },
    });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating order' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerEmail = searchParams.get('customer_email');
    const orderId = searchParams.get('order_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_status_history (
          id,
          old_status,
          new_status,
          changed_by,
          notes,
          created_at
        ),
        shipping_events (
          id,
          event_type,
          event_description,
          event_timestamp,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (customerEmail) {
      query = query.eq('customer_email', customerEmail);
    }
    if (orderId) {
      query = query.eq('order_id', orderId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error: ordersError } = await query;

    if (ordersError) {
      console.error('Orders fetch error:', ordersError);
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: ordersError.message },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase.from('orders').select('*', { count: 'exact', head: true });
    
    if (customerEmail) countQuery = countQuery.eq('customer_email', customerEmail);
    if (orderId) countQuery = countQuery.eq('order_id', orderId);
    if (status) countQuery = countQuery.eq('status', status);

    const { count, error: countError } = await countQuery;

    return NextResponse.json({
      success: true,
      orders: orders || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0),
      },
    });

  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching orders' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update order status
export async function PUT(request: NextRequest) {
  try {
    const { orderId, status, notes, reason, changed_by = 'admin' } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'ready_to_transport', 'shipped', 'near_city', 'delivered', 'cancelled', 'return_requested', 'returned'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status', validStatuses },
        { status: 400 }
      );
    }

    // Get current order
    // Get current order safely
    let currentOrder = null;
    let isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

    if (isUuid) {
        const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
        currentOrder = data;
    }
    
    if (!currentOrder) {
        const { data, error: fetchError } = await supabase.from('orders').select('*').eq('order_id', orderId).single();
        currentOrder = data;

        if (!currentOrder) {
          return NextResponse.json(
            { error: 'Order not found', details: fetchError?.message },
            { status: 404 }
          );
        }
    }

    // Update order status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Add timestamps for specific status changes
    if (status === 'shipped' && currentOrder.status !== 'shipped') {
      updateData.shipped_at = new Date().toISOString();
    }
    if (status === 'delivered' && currentOrder.status !== 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq(isUuid ? 'id' : 'order_id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Order update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order', details: updateError.message },
        { status: 500 }
      );
    }

    // Create order status history entry
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: updatedOrder.id,
        old_status: currentOrder.status,
        new_status: status,
        changed_by,
        notes: notes || `Status changed from ${currentOrder.status} to ${status}`,
      });

    if (historyError) {
      console.error('Failed to create status history:', historyError);
    }

    // Create shipping event for shipped status
    if (status === 'shipped') {
      const { error: eventError } = await supabase
        .from('shipping_events')
        .insert({
          order_id: updatedOrder.id,
          event_type: 'status_changed',
          event_description: `Order status changed to ${status}`,
          event_timestamp: new Date().toISOString(),
        });

      if (eventError) {
        console.error('Failed to create shipping event:', eventError);
      }
    }
    
    // Automatically send Rejection/Cancellation Email to Customer
    if (status === 'cancelled') {
        try {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          fetch(`${appUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentOrder.customer_email,
              orderId: currentOrder.order_id,
              customerName: currentOrder.customer_name,
              type: 'order_cancelled',
              reason: notes || reason || 'No specific reason provided.'
            }),
          }).catch(e => console.error("Non-blocking email send failure: ", e));
        } catch (emailError) {
          console.error("Failed to initiate cancellation email:", emailError);
        }
    }

    // New Dispatch Ready Email condition
    if (status === 'ready_to_transport') {
        try {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          fetch(`${appUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentOrder.customer_email,
              orderId: currentOrder.order_id,
              customerName: currentOrder.customer_name,
              type: 'order_status_update',
              statusTemplateText: "Your order is ready to be dispatched to our local logistics partner.",
              titleText: "Order Prepared for Dispatch"
            }),
          }).catch(e => console.error("Non-blocking email send failure: ", e));
        } catch (emailError) {
          console.error("Failed to initiate ready-to-transport email:", emailError);
        }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      previousStatus: currentOrder.status,
      newStatus: status,
    });

  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating order' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to cancel order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { error: 'Order not found', details: fetchError?.message },
        { status: 404 }
      );
    }

    // Check if order can be cancelled
    if (currentOrder.status === 'shipped' || currentOrder.status === 'delivered') {
      return NextResponse.json(
        { error: 'Cannot cancel order that has been shipped or delivered' },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    const { data: cancelledOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Order cancellation error:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel order', details: updateError.message },
        { status: 500 }
      );
    }

    // Create order status history entry
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: cancelledOrder.id,
        old_status: currentOrder.status,
        new_status: 'cancelled',
        changed_by: 'customer',
        notes: 'Order cancelled by customer',
      });

    if (historyError) {
      console.error('Failed to create status history:', historyError);
    }

    return NextResponse.json({
      success: true,
      order: cancelledOrder,
      message: 'Order cancelled successfully',
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json(
      { error: 'Internal server error while cancelling order' },
      { status: 500 }
    );
  }
}
