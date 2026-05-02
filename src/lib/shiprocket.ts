export async function getShiprocketToken(): Promise<string | null> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    console.warn("SHIPROCKET API credentials missing in .env.local");
    return null;
  }

  try {
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
       console.error("Shiprocket Login Failed", await res.text());
       return null;
    }

    const data = await res.json();
    return data.token;
  } catch (err) {
    console.error("Shiprocket Login Error", err);
    return null;
  }
}

export async function createShiprocketOrder(token: string, orderData: any): Promise<any> {
    try {
        const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });

        const data = await res.json();
        if(!res.ok) {
            console.error("Shiprocket Order Creation Failed:", data);
            return { error: data.message || "Failed to create order", details: data };
        }
        return data;
    } catch (err) {
        console.error("Shiprocket create order error", err);
        return { error: "Network or Server error communicating with Shiprocket" };
    }
}

export async function assignAwb(token: string, shipmentId: number | string): Promise<any> {
    try {
        const res = await fetch('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ shipment_id: shipmentId })
        });

        const data = await res.json();
        return data; 
    } catch (err) {
        console.error("Shiprocket assign AWB error", err);
        return { error: "Failed to assign AWB" };
    }
}
