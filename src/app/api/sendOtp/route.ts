import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY || 're_default');

// Use powerful Service Key if available, else fallback to anon key to write OTP records
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://build.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build-key'
);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Step 2: Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Step 3: Store OTP in Supabase `otp_codes` table
    const { error: dbError } = await supabase
      .from('otp_codes')
      .insert([
        { 
          email: email.toLowerCase(), 
          otp: otp 
          // expiry_time is optionally verifiable by checking created_at < 15 mins ago
        }
      ]);

    if (dbError) {
      console.error("DB Save Error:", dbError);
      return NextResponse.json({ error: 'Failed to record OTP in Database. Did you create the otp_codes table?' }, { status: 500 });
    }

    // Step 4: Send via Resend
    // USING onboarding@resend.dev IS MANDATORY for unverified domains during testing!
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>', // Free tier verified testing sender
      to: [email.trim().toLowerCase()],
      subject: "Your Access OTP Code",
      html: `
        <div style="font-family: sans-serif; background: #000; color: #fff; padding: 40px; border-radius: 12px; text-align: center;">
            <h2 style="color: #10b981; margin-bottom: 20px;">Verification Required</h2>
            <p style="color: #9ca3af; margin-bottom: 30px;">You are attempting to log in. Please use the confirmation code below.</p>
            <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #fff; background: #18181b; padding: 20px; border-radius: 8px; display: inline-block border: 1px solid #10b981;">
                ${otp}
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">This code will expire shortly.</p>
        </div>
      `
    });

    if (resendError) {
       console.error("Resend delivery failed:", resendError);
       return NextResponse.json({ error: `Resend API Error: ${resendError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP Dispatched' }, { status: 200 });
  } catch (error: any) {
    console.error('OTP Send Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch OTP' },
      { status: 500 }
    );
  }
}
