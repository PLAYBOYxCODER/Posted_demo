# Shiprocket Integration Setup Guide

## Overview
This guide explains how to set up Shiprocket integration for order tracking and shipment management.

## Architecture Flow

```
Customer Order → Admin Panel → Accept Order → Shiprocket API → Tracking ID
                      ↓
              Customer Sees Tracking ID + Link
                      ↓
              Delivery Update → Database Updated
```

## Setup Steps

### 1. Get Shiprocket Credentials

1. Create a Shiprocket account at https://app.shiprocket.in
2. Complete KYC verification
3. Go to Settings → API → Generate API Keys
4. Note down:
   - **Email** (your Shiprocket login email)
   - **Password** (your Shiprocket password)
   - **API Token** (generated from dashboard)

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Shiprocket Configuration
SHIPROCKET_EMAIL=your-shiprocket-email@example.com
SHIPROCKET_PASSWORD=your-shiprocket-password
SHIPROCKET_API_TOKEN=your-api-token-here
```

### 3. API Routes

The following API routes are already implemented:

- `/api/shiprocket/auth` - Authenticates with Shiprocket and returns token
- `/api/shiprocket/create-shipment` - Creates shipment and returns tracking ID

### 4. Database Schema

Ensure your `orders` table has these columns:

```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_tracking_url VARCHAR(500);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
```

### 5. Admin Workflow

1. **View Orders**: Go to `/admin/orders`
2. **Pending Orders**: Orders with status "pending" or "processing" show "Ship Now" button
3. **Create Shipment**: Click "Ship Now" → Calls Shiprocket API → Returns Tracking ID
4. **Track Order**: Once shipped, "Track" button appears linking to Shiprocket tracking

### 6. Customer Experience

1. **My Orders**: Customer sees order at `/orders`
2. **Tracking Info**: When order is "shipped", tracking ID and link are displayed
3. **Track Package**: Click "Track Order" to open Shiprocket tracking page
4. **Delivery Status**: Real-time updates from Shiprocket

## Features Implemented

### ✅ Completed
- [x] 3 Product Categories (Photo Booth Strip removed)
- [x] Category-specific previews (Split Poster, Retro Prints, Mini Pocket Photos)
- [x] Mobile responsive design
- [x] Customer photo upload to Supabase Storage
- [x] Shiprocket API integration
- [x] Admin "Ship Now" button
- [x] Customer tracking view
- [x] Tracking ID display and link

### 🔄 Auto-Update Delivery Status
The system can poll Shiprocket API to check delivery status:

```javascript
// Example: Check tracking status
const checkDeliveryStatus = async (trackingId) => {
  const response = await fetch(`/api/shiprocket/track/${trackingId}`);
  const data = await response.json();
  
  if (data.current_status === 'Delivered') {
    // Update database
    await updateOrderStatus(orderId, 'delivered');
  }
};
```

## Testing the Flow

1. **Place Order**: Customer places order → Status: "pending"
2. **Admin Accept**: Admin clicks "Ship Now" → API creates shipment
3. **Tracking Generated**: Tracking ID saved to database → Status: "shipped"
4. **Customer Sees**: Customer sees tracking ID and link in My Orders
5. **Track Package**: Click link to view Shiprocket tracking page

## Troubleshooting

### Common Issues

1. **"Ship Now" button not working**
   - Check Shiprocket credentials in `.env.local`
   - Verify Shiprocket account is active and KYC completed
   - Check API logs in browser console

2. **Tracking ID not showing**
   - Ensure order status was updated to "shipped"
   - Check database has `tracking_id` column
   - Verify API response saved correctly

3. **Customer can't see tracking**
   - Order status must be "shipped" or "delivered"
   - Customer email must match order email

## API Reference

### Create Shipment
```
POST /api/shiprocket/create-shipment
Body: {
  orderId: "ORD-123",
  pickupLocation: "Primary",
  items: [...]
}
Response: {
  success: true,
  tracking_id: "SR123456789",
  courier_name: "Delhivery",
  shipment_id: 12345
}
```

### Get Tracking
```
GET /api/shiprocket/track/:trackingId
Response: {
  current_status: "Delivered",
  tracking_data: [...]
}
```

## Support

For Shiprocket API issues, contact:
- Shiprocket Support: https://app.shiprocket.in/support
- API Documentation: https://apidocs.shiprocket.in

## Security Notes

- Never commit `.env.local` with credentials
- Rotate API tokens periodically
- Use environment variables for all sensitive data
- Enable IP whitelisting in Shiprocket dashboard
