import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Email notification API
// This endpoint sends order and shipping confirmation emails

export async function POST(request: NextRequest) {
  try {
    const { email, orderId, trackingId, trackingLink, customerName, type = 'shipping', paymentMethod, totalPrice, productDetails, reason, titleText, statusTemplateText } = await request.json();

    if (!email || !orderId) {
      return NextResponse.json(
        { error: 'Email and Order ID are required' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Get app URL for tracking links
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    // Just change ONE line below when you verify your domain:
    // from: "no-reply@posted.co.in"
    const fromEmail = "onboarding@resend.dev";

    let emailSubject = '';
    let emailHtml = '';
    let emailText = '';

    if (type === 'shipping' && trackingId) {
      // Shipping confirmation email
      emailSubject = `Your Order ${orderId} has been Shipped! 🚚`;
      
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Shipped - Poster Store</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              background-color: #f4f6f8;
              color: #1a1a1a;
              margin: 0;
              padding: 20px;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              border: 1px solid #e2e8f0;
              box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            }
            .header {
              background: linear-gradient(135deg, #10b981, #065f46);
              padding: 40px 30px;
              text-align: center;
              color: #ffffff;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #ffffff;
            }
            .content {
              padding: 40px 30px;
            }
            .order-info {
              background-color: #f8fafc;
              border-radius: 12px;
              padding: 20px;
              margin: 20px 0;
              border: 1px solid #cbd5e1;
            }
            .tracking-button {
              display: inline-block;
              background-color: #10b981;
              color: #ffffff;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin: 20px 0;
              transition: transform 0.2s;
            }
            .footer {
              background-color: #f1f5f9;
              padding: 20px 30px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
              border-top: 1px solid #cbd5e1;
            }
            .highlight {
              color: #059669;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚚 Your Order is on the way!</h1>
            </div>
            
            <div class="content">
              <p>Hi ${customerName || 'there'},</p>
              
              <p>Great news! Your order <span class="highlight">${orderId}</span> has been shipped and is now on its way to you.</p>
              
              <div class="order-info">
                <h3>Order Details:</h3>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Tracking ID:</strong> ${trackingId}</p>
                <p><strong>Status:</strong> Shipped</p>
              </div>
              
              <p>Track your package in real-time by clicking the button below:</p>
              
              <a href="https://shiprocket.co/tracking/${trackingId}" class="tracking-button">
                Track My Order
              </a>
              
              <p>You can also view your complete order details in your account:</p>
              <a href="${appUrl}/orders" style="color: #10b981; text-decoration: underline;">
                View My Orders
              </a>
              
              <p><strong>Estimated Delivery:</strong> 3-7 business days</p>
              
              <p>Thank you for choosing Poster Store! If you have any questions, please don't hesitate to contact our support team.</p>
            </div>
            
            <div class="footer">
              <p>© 2024 Poster Store. All rights reserved.</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      emailText = `
        Your Order ${orderId} has been Shipped! 🚚
        
        Hi ${customerName || 'there'},
        
        Great news! Your order ${orderId} has been shipped and is now on its way to you.
        
        Order Details:
        Order ID: ${orderId}
        Tracking ID: ${trackingId}
        Status: Shipped
        
        Track your package here: https://shiprocket.co/tracking/${trackingId}
        
        View your complete order details: ${appUrl}/orders
        
        Estimated Delivery: 3-7 business days
        
        Thank you for choosing Poster Store!
      `;
      
    } else if (type === 'order_confirmation') {
      // Build dynamic items list
      const isCod = paymentMethod === 'cod';
      const paymentStatus = isCod ? 'Pending (Cash on Delivery)' : 'Paid (Online)';
      const paymentDisplay = isCod ? 'Cash on Delivery (COD)' : 'Prepaid (Online)';
      
      let itemsListHtml = '';
      let itemsListText = '';
      
      if (productDetails && productDetails.items && Array.isArray(productDetails.items)) {
         itemsListHtml = `
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px; border-collapse: collapse;">
               <thead>
                  <tr>
                     <th style="padding: 10px; border-bottom: 1px solid #333; text-align: left; color: #10b981; font-weight: bold; text-transform: uppercase;">Item</th>
                     <th style="padding: 10px; border-bottom: 1px solid #333; text-align: center; color: #10b981; font-weight: bold; text-transform: uppercase;">Qty</th>
                     <th style="padding: 10px; border-bottom: 1px solid #333; text-align: right; color: #10b981; font-weight: bold; text-transform: uppercase;">Price</th>
                  </tr>
               </thead>
               <tbody>
                  ${productDetails.items.map((item: any) => `
                    <tr>
                       <td style="padding: 10px; border-bottom: 1px solid #222; font-size: 14px;">${item.name}</td>
                       <td style="padding: 10px; border-bottom: 1px solid #222; text-align: center; font-size: 14px;">${item.quantity}</td>
                       <td style="padding: 10px; border-bottom: 1px solid #222; text-align: right; font-size: 14px;">₹${item.price}</td>
                    </tr>
                  `).join('')}
               </tbody>
               <tfoot>
                  <tr>
                     <td colspan="2" style="padding: 12px 10px; text-align: right; font-weight: bold;">Shipping:</td>
                     <td style="padding: 12px 10px; text-align: right; font-size: 14px;">₹${productDetails.shipping || 0}</td>
                  </tr>
                  <tr>
                     <td colspan="2" style="padding: 12px 10px; text-align: right; font-weight: 900; color: #10b981;">TOTAL PRICE:</td>
                     <td style="padding: 12px 10px; text-align: right; font-size: 16px; font-weight: 900; color: #10b981;">₹${totalPrice || productDetails.total || 0}</td>
                  </tr>
               </tfoot>
            </table>
         `;
         
         itemsListText = productDetails.items.map((item: any) => 
            `- ${item.name} (Qty: ${item.quantity}) - ₹${item.price}`
         ).join('\n') + `\n\nShipping: ₹${productDetails.shipping || 0}\nTotal: ₹${totalPrice || productDetails.total || 0}`;
      } else {
         itemsListHtml = `<p>Error loading item list. No worries, your order is secured in our system.</p>`;
         itemsListText = `Error loading item list.`;
      }

      // Order confirmation email
      emailSubject = `Order Confirmation from Poster Store - ${orderId}`;
      
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation - Poster Store</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; color: #1a1a1a; margin: 0; padding: 20px; line-height: 1.6; }
            .container { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #10b981, #059669); padding: 50px 30px; text-align: center; border-bottom: 3px solid #047857; }
            .header img { display: block; margin: 0 auto 15px auto; max-height: 60px; object-fit: contain; }
            .header h1 { margin: 0; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #ffffff; }
            .header p.quote { margin: 10px 0 0 0; font-size: 14px; font-style: italic; color: #d1fae5; }
            .content { padding: 40px 30px; }
            .order-info { background-color: #f8fafc; border-radius: 8px; padding: 25px; margin: 20px 0; border: 1px solid #cbd5e1; }
            .order-info h3 { margin-top: 0; color: #0f172a; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; }
            .details-grid { display: flex; flex-wrap: wrap; margin-bottom: 20px; }
            .detail-item { width: 50%; padding-bottom: 10px; }
            .detail-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            .detail-value { font-size: 14px; font-weight: bold; color: #0f172a; }
            .footer { background-color: #f1f5f9; padding: 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #cbd5e1; }
            .highlight { color: #059669; font-weight: bold; }
            .btn { display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; text-transform: uppercase; margin-top: 20px; font-size: 14px; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>POSTER STORE</h1>
              <p class="quote">"Where your walls come alive"</p>
            </div>
            
            <div class="content">
              <h2 style="margin-top:0;">Thank you for your order, ${customerName || 'there'}!</h2>
              <p>We've received your order <span class="highlight">${orderId}</span>. We're getting your premium posters ready, and we will notify you the moment they ship.</p>
              
              <div class="order-info">
                <h3>Order Summary</h3>
                <div style="margin-bottom: 15px;">
                  <span class="detail-label">Order Number:</span> <span class="detail-value">${orderId}</span><br>
                  <span class="detail-label">Payment Method:</span> <span class="detail-value" style="${isCod ? 'color:#fbbf24;' : 'color:#10b981;'}">${paymentDisplay} (${paymentStatus})</span><br>
                  <span class="detail-label">Order Date:</span> <span class="detail-value">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric'})}</span>
                </div>
                
                <h3 style="margin-top: 25px;">Items Ordered</h3>
                ${itemsListHtml}
              </div>
              
              <center>
                <a href="${appUrl}/orders" class="btn">
                  View Order Status
                </a>
              </center>
              
              <p style="margin-top: 30px; font-size: 14px; color: #aaa;">If you have any questions or need to make changes to your order, please contact our support team immediately.</p>
            </div>
            
            <div class="footer">
              <p><strong>POSTER STORE</strong><br>Premium Anime, Movies, & Pop Culture Posters</p>
              <p>© ${new Date().getFullYear()} Poster Store. All rights reserved.</p>
              <p>This is an automated message. Please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      emailText = `
        Thank you for your order from POSTER STORE!
        
        Hi ${customerName || 'there'},
        
        We've received your order ${orderId}. We will notify you again once it has shipped.
        
        ORDER DETAILS:
        Order Number: ${orderId}
        Payment Method: ${paymentDisplay}
        Payment Status: ${paymentStatus}
        
        ITEMS ORDERED:
        ${itemsListText}
        
        View your complete order details here: ${appUrl}/orders
        
        Thank you for choosing Poster Store!
      `;
    } else if (type === 'admin_notification') {
        const orderValue = totalPrice || productDetails?.total || 0;
        emailSubject = `ACTION REQUIRED: New Order Received (${orderId})`;
        
        emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f8; color: #1a1a1a; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border-top: 5px solid #10b981; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            h2 { color: #047857; margin-top: 0; }
            .btn { display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>New Order Received! 🚀</h2>
            <p><strong>Customer:</strong> ${customerName || email}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Value:</strong> ₹${orderValue}</p>
            <p><strong>Payment:</strong> ${paymentMethod === 'cod' ? 'Cash on Delivery (Pending)' : 'Online (Paid)'}</p>
            <p>Log in to your Admin Dashboard to begin processing this order immediately.</p>
            <center><a href="${appUrl}/admin/orders" class="btn">View Order in Admin Panel</a></center>
          </div>
        </body>
        </html>
        `;

        emailText = `NEW ORDER RECEIVED: ${orderId} by ${customerName}. View it here: ${appUrl}/admin/orders`;
        
    } else if (type === 'order_cancelled') {
        emailSubject = `Update Regarding Your Order ${orderId}`;
        
        emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f8; color: #1a1a1a; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border-top: 5px solid #ef4444; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            h2 { color: #b91c1c; margin-top: 0; }
            .reason-box { background: #fef2f2; border: 1px solid #f87171; padding: 15px; border-radius: 6px; margin: 20px 0; color: #991b1b; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Order Cancellation Notice</h2>
            <p>Hi ${customerName || 'there'},</p>
            <p>We are writing to inform you that your order <strong>${orderId}</strong> could not be fulfilled and has been cancelled.</p>
            ${reason ? `
            <div class="reason-box">
               <strong>Reason for cancellation:</strong><br/>
               ${reason}
            </div>` : ''}
            <p>If you have already paid for this order online, a full refund will be automatically initiated to your original payment method within 3-5 business days.</p>
            <p>We apologize for any inconvenience. If you have any questions, please contact our support team.</p>
          </div>
        </body>
        </html>
        `;

        emailText = `Order ${orderId} has been cancelled. Reason: ${reason || 'Not specified'}. Contact support if you have questions.`;

    } else if (type === 'order_shipped') {
        const payloadTrackingLink = trackingLink || (typeof reason === 'string' && reason.startsWith('http') ? reason : '');
        const payloadTrackingId = trackingId || '';
        emailSubject = `Your Order ${orderId} has been Shipped! 🚀`;
        
        emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f8; color: #1a1a1a; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border-top: 5px solid #10b981; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            h2 { color: #047857; margin-top: 0; }
            .btn { display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
            .tracking-box { background: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 6px; margin: 20px 0; color: #166534; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Great news! Your order is on the way. 🚚</h2>
            <p>Hi ${customerName || 'there'},</p>
            <p>We are excited to let you know that your order <strong>${orderId}</strong> has been handed over to our delivery partner and is currently in transit!</p>
            ${payloadTrackingLink ? `
            <div class="tracking-box">
               <strong>Track Your Order:</strong><br/>
               ${payloadTrackingId ? `Tracking ID: ${payloadTrackingId}<br/>` : ''}
               <a href="${payloadTrackingLink}" target="_blank" class="btn">Click Here to Track Shipment</a>
            </div>` : ''}
            <p>Thank you for shopping with Poster Store!</p>
          </div>
        </body>
        </html>
        `;

        emailText = `Order ${orderId} has shipped. ${payloadTrackingLink ? `Track here: ${payloadTrackingLink}` : ''}`;

    } else if (type === 'order_status_update') {
        const payloadTitleText = titleText || `Order Update: ${orderId}`;
        const payloadStatusTemplateText = statusTemplateText || `Your order status has been updated.`;
        emailSubject = `${payloadTitleText} 📦`;
        
        emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f8; color: #1a1a1a; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border-top: 5px solid #10b981; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            h2 { color: #047857; margin-top: 0; }
            .btn { display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>${payloadTitleText}</h2>
            <p>Hi ${customerName || 'there'},</p>
            <p>${payloadStatusTemplateText}</p>
            <p>You can check the latest status of your order anytime through your dashboard.</p>
            <a href="${appUrl}/orders" target="_blank" class="btn">View Order Details</a>
            <p style="margin-top: 30px;">Thank you for shopping with Poster Store!</p>
          </div>
        </body>
        </html>
        `;

        emailText = `Order ${orderId}: ${payloadStatusTemplateText}`;

    } else {
      return NextResponse.json(
        { error: 'Invalid email type' },
        { status: 400 }
      );
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: data?.id,
    });

  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: 'Internal server error while sending email' },
      { status: 500 }
    );
  }
}

// GET endpoint to test email service
export async function GET(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email service is configured and ready',
      // Just change ONE line below when you verify your domain:
      // from: "no-reply@posted.co.in"
      fromEmail: "onboarding@resend.dev",
    });

  } catch (error) {
    console.error('Email service test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
