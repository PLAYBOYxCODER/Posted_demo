-- Enhanced Orders Table for Shiprocket Integration
-- This migration adds shipping tracking and automation capabilities

-- Drop existing orders table if it exists (for fresh migration)
DROP TABLE IF EXISTS orders CASCADE;

-- Create enhanced orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., "ORD1234567890"
  customer_id VARCHAR(100),
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  
  -- Shipping Address
  shipping_address JSONB NOT NULL, -- { street, city, state, postal_code, country }
  
  -- Order Details
  product_details JSONB NOT NULL, -- { items: [], subtotal, total, currency }
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  
  -- Payment Information
  payment_method VARCHAR(50) DEFAULT 'razorpay',
  payment_id VARCHAR(100), -- Razorpay payment ID
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  
  -- Shipping & Tracking
  tracking_id VARCHAR(100), -- Shiprocket AWB code
  courier_name VARCHAR(100),
  estimated_delivery DATE,
  actual_delivery DATE,
  shipping_cost DECIMAL(10,2) DEFAULT 0.00,
  
  -- Shiprocket Integration
  shiprocket_order_id VARCHAR(100),
  shiprocket_shipment_id VARCHAR(100),
  shiprocket_courier_id VARCHAR(100),
  shiprocket_tracking_url TEXT,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_orders_tracking_id ON orders(tracking_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create order status history table for tracking changes
CREATE TABLE order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  changed_by VARCHAR(100), -- 'system', 'admin', or customer email
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- Create shipping_events table for tracking Shiprocket events
CREATE TABLE shipping_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'created', 'picked_up', 'in_transit', 'delivered', etc.
  event_description TEXT,
  event_location JSONB, -- { city, state, country }
  event_timestamp TIMESTAMP WITH TIME ZONE,
  raw_shiprocket_data JSONB, -- Store complete Shiprocket webhook data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shipping_events_order_id ON shipping_events(order_id);
CREATE INDEX idx_shipping_events_event_type ON shipping_events(event_type);

-- Insert sample data for testing
INSERT INTO orders (
  order_id,
  customer_email,
  customer_name,
  customer_phone,
  shipping_address,
  product_details,
  status,
  payment_status,
  payment_id
) VALUES 
(
  'ORD' || EXTRACT(EPOCH FROM NOW())::BIGINT,
  'test@example.com',
  'Test Customer',
  '+919876543210',
  JSONB '{"street": "123 Test Street", "city": "Mumbai", "state": "Maharashtra", "postal_code": "400001", "country": "India"}',
  JSONB '{"items": [{"id": "PROD-1", "name": "Test Poster", "quantity": 2, "price": 499}], "subtotal": 998, "total": 998, "currency": "INR"}',
  'pending',
  'paid',
  'pay_test1234567890'
);

-- Grant permissions (adjust according to your Supabase setup)
-- These are basic permissions - you may want to refine these for production
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON order_status_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON order_status_history TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON shipping_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON shipping_events TO service_role;

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - adjust for your needs)
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid()::text = customer_id OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all orders" ON orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view their order status history" ON order_status_history
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE auth.uid()::text = customer_id OR auth.jwt() ->> 'role' = 'service_role'
        )
    );

CREATE POLICY "Service role can manage order status history" ON order_status_history
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view their shipping events" ON shipping_events
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE auth.uid()::text = customer_id OR auth.jwt() ->> 'role' = 'service_role'
        )
    );

CREATE POLICY "Service role can manage shipping events" ON shipping_events
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
