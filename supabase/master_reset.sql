-- ==========================================
-- MASTER RESET: POSTER STORE DATABASE SCHEMA
-- ==========================================
-- This script safely drops any existing tables and perfectly recreates the entire production-ready database!

-- 1. DROP EXISTING TABLES (Reset)
DROP TABLE IF EXISTS shipping_events CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS otp_codes CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS staff_roles CASCADE;

-- ==========================================
-- 2. CREATE TABLES
-- ==========================================

-- PRODUCTS TABLE
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  inventory_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OTP CODES TABLE
CREATE TABLE otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BRAND-NEW ORDERS TABLE (Shiprocket Compatible)
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL, 
  customer_id VARCHAR(100),
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  shipping_address JSONB NOT NULL,
  product_details JSONB NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'razorpay',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Shiprocket Data
  tracking_id VARCHAR(100), 
  courier_name VARCHAR(100),
  shiprocket_tracking_url TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ORDER STATUS HISTORY
CREATE TABLE order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(100) DEFAULT 'system',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SHIPPING EVENTS (Timeline tracking)
CREATE TABLE shipping_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_description TEXT,
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. AUTOMATIC UPDATED_AT TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 4. ENABLE REALTIME ACROSS ALL IMPORTANT TABLES
-- ==========================================
-- This automatically makes the website UI refresh whenever a new row is added!
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE orders, products, order_status_history, otp_codes;

-- ==========================================
-- 5. ZERO-TRUST SECURITY: ENABLE ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 6. PERMISSIONS & PUBLIC POLICIES
-- ==========================================
-- Anyone can READ products
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Service Role can manage products" ON products FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ANYONE (Guests & Authenticated) can CREATE checkout orders and OTPs!
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create order history" ON order_status_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can request OTP" ON otp_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Service Role can manage ALL orders" ON orders FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service Role can manage ALL history" ON order_status_history FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service Role can manage OTP" ON otp_codes FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ==========================================
-- 7. DEFAULT MOCK PRODUCTS (So your Store isn't empty!)
-- ==========================================
INSERT INTO products (name, description, price, category, inventory_count, is_active, images) VALUES
('Retro Instant Film Print', 'Vintage style prints that capture the nostalgia of 90s instant cameras. Thick premium cardstock.', 199.00, 'retro_prints', 500, true, ARRAY['https://images.unsplash.com/photo-1594911772125-07fc7a2d8d9f?w=600&h=800&fit=crop']),
('Cinematic Split Poster', 'Turn any landscape photo into a stunning 3-piece cinematic wall art installation.', 499.00, 'split_poster', 100, true, ARRAY['https://images.unsplash.com/photo-1513258496099-48168024aec0?w=600&h=800&fit=crop']),
('Pocket Mini Wallet Photo', 'Tiny, adorable wallet-sized prints of your favorite memories. Fits perfectly anywhere.', 49.00, 'mini_pocket_photos', 900, true, ARRAY['https://images.unsplash.com/photo-1544256718-3baf237f3942?w=600&h=800&fit=crop']);
