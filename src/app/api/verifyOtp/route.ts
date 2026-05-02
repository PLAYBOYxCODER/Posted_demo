import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://build.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build-key'
);

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Note: To make this hyper-secure, order by created_at DESC and check expiry time.
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    
    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', cleanEmail)
      .eq('otp', cleanOtp)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error("Verify OTP Failed against DB. RLS issue or incorrect OTP.", error);
      return NextResponse.json({ error: 'Invalid or expired OTP code. (Check Supabase RLS is turned OFF for otp_codes table!)' }, { status: 401 });
    }

    // Since it's valid, optionally delete the used OTP to prevent replay attacks
    await supabase.from('otp_codes').delete().eq('id', data.id);

    return NextResponse.json({ success: true, message: 'OTP Verified Successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('OTP Verify Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
