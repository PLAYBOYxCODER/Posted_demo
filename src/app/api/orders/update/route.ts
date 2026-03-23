import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://build.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build-key';

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { orderId, status, secretAuth } = payload;
    
    // 1. Validate Input Strictness
    if (!orderId || !status || !secretAuth) {
       return NextResponse.json({ error: 'Malformed encrypted payload rejected' }, { status: 400 });
    }

    // 2. Privilege Escalation Defense: Verify Admin Identity natively in Backend
    const { email, password } = secretAuth;
    if (!email) return NextResponse.json({ error: 'Admin Identity Unverified' }, { status: 401 });

    const { data: configData } = await supabaseAdmin.from('admin_configs').select('value').eq('key', 'admin_credentials').single();
    
    // Check if the request is from Master Admin OR Approved Staff Email
    const isMaster = configData?.value?.email === email && configData?.value?.password === password;
    const isStaff = configData?.value?.staff_emails?.includes(email);

    if (!isMaster && !isStaff) {
       return NextResponse.json({ error: 'Zero-Trust Policy blocked unauthorized admin promotion request.' }, { status: 403 });
    }

    // 3. Execute restricted Update safely from Server
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ delivery_status: status })
      .eq('id', orderId);

    if (updateError) {
       console.error(updateError);
       return NextResponse.json({ error: 'Failed to commit authorized mutation' }, { status: 500 });
    }

    return NextResponse.json({ success: true, updatedId: orderId, newStatus: status });

  } catch(e) {
    return NextResponse.json({ error: 'Fatal System Shield trigger.' }, { status: 500 });
  }
}
