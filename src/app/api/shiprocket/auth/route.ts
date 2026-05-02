import { NextRequest, NextResponse } from 'next/server';

// Shiprocket Authentication API
// This endpoint handles authentication with Shiprocket API

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Shiprocket email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate with Shiprocket
    const authResponse = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      return NextResponse.json(
        { error: 'Shiprocket authentication failed', details: errorData },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();
    
    // Return token (store securely in your system)
    return NextResponse.json({
      success: true,
      token: authData.token,
      expires_at: authData.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default 24 hours
    });

  } catch (error) {
    console.error('Shiprocket auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error during Shiprocket authentication' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if token is valid
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Test token validity by making a test API call
    const testResponse = await fetch('https://apiv2.shiprocket.in/v1/external/orders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (testResponse.ok) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during token validation' },
      { status: 500 }
    );
  }
}
