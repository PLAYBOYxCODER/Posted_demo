import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Provide a fallback generic API key or let it fail elegantly if missing in dev
const resend = new Resend(process.env.RESEND_API_KEY || 're_default_fallback_placeholder');

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: 'Poster Store <hello@yourdomain.com>', // MUST BE VERIFIED IN RESEND
      to: [to],
      subject: subject,
      html: html,
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('Email API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch email' },
      { status: 500 }
    );
  }
}
