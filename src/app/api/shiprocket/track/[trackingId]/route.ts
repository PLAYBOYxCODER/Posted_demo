import { NextRequest, NextResponse } from 'next/server';

// Shiprocket tracking API
export async function GET(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    const trackingId = params.trackingId;
    
    if (!trackingId) {
      return NextResponse.json(
        { error: 'Tracking ID is required' },
        { status: 400 }
      );
    }

    // Get Shiprocket token
    const token = await getShiprocketToken();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Failed to authenticate with Shiprocket' },
        { status: 401 }
      );
    }

    // Fetch tracking details from Shiprocket
    const response = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${trackingId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to fetch tracking details' },
        { status: response.status }
      );
    }

    const trackingData = await response.json();
    
    // Extract current status
    const currentStatus = trackingData?.tracking_data?.shipment_track?.[0]?.current_status || 'Unknown';
    const isDelivered = currentStatus.toLowerCase().includes('delivered');
    
    return NextResponse.json({
      success: true,
      tracking_id: trackingId,
      current_status: currentStatus,
      is_delivered: isDelivered,
      tracking_data: trackingData?.tracking_data || null
    });

  } catch (error) {
    console.error('Track Shipment Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get Shiprocket token
async function getShiprocketToken(): Promise<string | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/shiprocket/auth`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) return null;
    
    const data = await response.json();
    return data.token || null;
  } catch (error) {
    console.error('Get Token Error:', error);
    return null;
  }
}
