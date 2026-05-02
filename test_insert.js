const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testInsert() {
  const { data, error } = await supabase
      .from('orders')
      .insert({
        order_id: "ORD" + Date.now(),
        customer_email: "test@test.com",
        customer_name: "Test User",
        customer_phone: "1234567890",
        shipping_address: { city: "Test", country: "IN", postal_code: "123456", state: "Test", street: "Test" },
        product_details: { currency: "INR", items: [], subtotal: 0, total: 0 },
        payment_method: "COD",
        payment_status: "pending",
        status: "pending",
        notes: "test note"
      })
      .select()
      .single();

  if (error) {
    console.error("DEBUG ERROR: ", error);
  } else {
    console.log("DEBUG SUCCESS: ", data);
  }
}

testInsert();
