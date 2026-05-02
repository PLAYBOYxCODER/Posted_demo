import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';


// Auto-update shipped orders tracking status
export async function POST(request: NextRequest) {
  try {
    // Find all shipped orders that haven't been delivered yet
    const { data: orders, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'shipped')
      .not('tracking_id', 'is', null)
      .order('shipped_at', { ascending: false });

    if (findError) {
      console.error('Find orders error:', findError);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No shipped orders to update',
        updated: 0
      });
    }

    const results = {
      checked: orders.length,
      updated: 0,
      delivered: 0,
      errors: [] as string[]
    };

    // Check each order's tracking status
    for (const order of orders) {
      try {
        const trackingResult = await checkTrackingStatus(order.tracking_id!);
        
        if (trackingResult.error) {
          results.errors.push(`Order ${order.id}: ${trackingResult.error}`);
          continue;
        }

        // If delivered, update order status
        if (trackingResult.is_delivered && order.status !== 'delivered') {
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              status: 'delivered',
              delivered_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id);

          if (updateError) {
            results.errors.push(`Order ${order.id}: Failed to update`);
            continue;
          }

          // Add to history
          await supabase.from('order_status_history').insert({
            order_id: order.id,
            old_status: 'shipped',
            new_status: 'delivered',
            changed_by: 'auto_update',
            notes: `Auto-updated via tracking check: ${trackingResult.current_status}`,
            created_at: new Date().toISOString()
          });

          results.updated++;
          results.delivered++;
        }
      } catch (orderError) {
        console.error(`Error checking order ${order.id}:`, orderError);
        results.errors.push(`Order ${order.id}: ${(orderError as Error).message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Checked ${results.checked} orders, updated ${results.updated} to delivered`,
      ...results
    });

  } catch (error) {
    console.error('Auto Update Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to check tracking status
async function checkTrackingStatus(trackingId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/shiprocket/track/${trackingId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || 'Failed to fetch tracking' };
    }

    const data = await response.json();
    return {
      is_delivered: data.is_delivered,
      current_status: data.current_status,
      tracking_data: data.tracking_data
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

// GET method for manual trigger or status check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Auto-update tracking status endpoint',
    usage: 'POST to this endpoint to check and update all shipped orders',
    supported_methods: ['POST', 'GET']
  });
}
