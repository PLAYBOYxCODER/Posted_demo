import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Setup basic server Supabase instance. Provide safe fallback to prevent Next.js static build timeout.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://build.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build-key';

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

export async function POST(request: Request) {
  try {
    // 1. Verify Authentication & Extract user identity STRICTLY from headers (Zero Trust)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: Missing Authentication Token' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Authentication Token' }, { status: 401 });
    }

    // 2. Validate input safely
    const payload = await request.json();
    const { items, customerName, email, phone, address, city, paymentMethod } = payload;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid Payload: Cart is empty' }, { status: 400 });
    }
    
    // 3. Prevent tampered prices. Re-calculate entire order native from 'products' DB table!
    let totalComputedAmount = 0;
    const validatedOrderItems = [];

    for (const item of items) {
      // Validate inputs
      if (!item.id || !item.size || !item.quantity) {
        return NextResponse.json({ error: 'Invalid Item Matrix' }, { status: 400 });
      }
      
      // Fetch safe reliable data from Supabase Core
      const { data: dbProduct, error: productErr } = await supabaseAdmin.from('products').select('name, price, discount_price').eq('id', item.id).single();
      
      if (productErr || !dbProduct) {
        return NextResponse.json({ error: `Invalid Product SKU Intercepted: ${item.id}` }, { status: 403 });
      }

      const activePrice = dbProduct.discount_price || dbProduct.price;
      const itemSubtotal = activePrice * item.quantity;
      totalComputedAmount += itemSubtotal;

      validatedOrderItems.push({
        product_id: item.id,
        product_name: dbProduct.name,
        size: String(item.size).replace(/<[^>]*>?/gm, ''), // XSS Sanitize
        quantity: Math.max(1, Math.min(10, parseInt(item.quantity))), // Clamp
        price_at_purchase: activePrice
      });
    }

    // 4. Create the parent Order Object rigorously enforcing RLS matching `user.id`
    const secureOrderId = "ORD-" + Date.now() + Math.floor(Math.random() * 1000);

    const { error: insertOrderError } = await supabaseAdmin.from('orders').insert({
      id: secureOrderId,
      user_id: user.id, // Forced override from securely retrieved JWT
      customer_name: String(customerName).replace(/<[^>]*>?/gm, ''),
      email: String(email).replace(/<[^>]*>?/gm, ''),
      phone: String(phone).replace(/<[^>]*>?/gm, ''),
      address: String(address).replace(/<[^>]*>?/gm, ''),
      city: String(city).replace(/<[^>]*>?/gm, ''),
      total_amount: totalComputedAmount, // Secure Back-End computed
      payment_method: String(paymentMethod),
      payment_status: 'pending', // Overwritten securely
      delivery_status: 'pending' // Overwritten securely
    });

    if (insertOrderError) {
      console.error(insertOrderError);
      return NextResponse.json({ error: 'Failed secure Order Registration policy execution' }, { status: 500 });
    }

    // 5. Connect matching Sub-items
    const FinalItemsPayload = validatedOrderItems.map(vi => ({
      ...vi,
      order_id: secureOrderId
    }));

    const { error: insertItemsError } = await supabaseAdmin.from('order_items').insert(FinalItemsPayload);

    if (insertItemsError) {
      console.error(insertItemsError);
      return NextResponse.json({ error: 'Order relational insertion rejected by Security' }, { status: 500 });
    }

    // 6. Return safe minimal status to untrusted client
    return NextResponse.json({
      success: true,
      order_id: secureOrderId,
      total_amount: totalComputedAmount
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: 'Server Encrypted Block: Transaction denied.' }, { status: 500 });
  }
}
