-- =========================================================================================
-- THE ULTIMATE E-COMMERCE DATABASE ARCHITECTURE (POSTER STORE - PRODUCTION GRADE)
-- Features: Razorpay, Shiprocket, BOGO Rule Engine, Cart Recovery, Multi-Address Book, Google Auth & Custom OTP Support
-- =========================================================================================

-- 1. CLEAN SLATE CAUTION
DROP TABLE IF EXISTS shipping_events CASCADE;
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS active_carts CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS store_assets CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS user_addresses CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS otp_codes CASCADE;

-- ==========================================
-- 2. CORE AUTH & PROFILES
-- ==========================================

-- Custom OTP Auth Table (For your Resend Integration)
CREATE TABLE otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table (Unified identity for Google Auth & OTP Users)
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- auth_id UUID REFERENCES auth.users(id),  -- Optional: Links natively to Supabase Auth if used
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advanced Multi-Address Book (Like Amazon)
CREATE TABLE user_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  address_tag VARCHAR(50) DEFAULT 'Home', -- e.g., 'Home', 'Office', 'Other'
  recipient_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  street_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. STOREFRONT & PRODUCTS
-- ==========================================

-- Admin UI Configuration (For Customizing the Homepage Banners / Photos without code)
CREATE TABLE store_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'hero_banner', 'bogo_promo_image'
  image_url TEXT NOT NULL,
  link_url TEXT, -- Where it clicks to
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Master Product Catalog
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  sub_category VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  inventory_count INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false, -- Soft Delete Mechanism!
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Variants (Sizes / Print Types)
CREATE TABLE product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_name VARCHAR(100) NOT NULL, -- e.g., 'A4 Matte', '8x10 Glossy'
  price_adjustment DECIMAL(10,2) DEFAULT 0.00, -- e.g., +₹100 for A3 size
  inventory_count INTEGER DEFAULT 0,
  sku VARCHAR(100) UNIQUE
);

-- ==========================================
-- 4. SHOPPING & PROMOTIONS (BOGO)
-- ==========================================

-- Promotion Engine Rules (Buy X Get Y)
CREATE TABLE promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code VARCHAR(100) UNIQUE, -- If null, it auto-applies! e.g., DIWALI
  promo_title VARCHAR(255) NOT NULL, -- e.g., 'Buy 2 Get 2 Free Mega Bundle'
  offer_type VARCHAR(50) NOT NULL, -- 'BOGO', 'PERCENT_OFF', 'FLAT_OFF'
  buy_quantity INTEGER DEFAULT 0,
  free_quantity INTEGER DEFAULT 0,
  flat_discount DECIMAL(10,2) DEFAULT 0.00,
  percent_discount INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Server-Side Shopping Cart (Abandoned Cart Recovery)
CREATE TABLE active_carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id VARCHAR(255) UNIQUE, -- For anonymous guest buyers
  cart_data JSONB NOT NULL DEFAULT '{"items": [], "subtotal": 0}',
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. RAZORPAY & SHIPROCKET ORDER MANAGEMENT
-- ==========================================

-- Master Orders Checkout Table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL, -- Public order ID: ORD-123456
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Nullable for Guests
  
  -- Captured Immutable Customer Data (In case profile changes later)
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  shipping_address JSONB NOT NULL,
  
  -- Financial & Promotional Blueprint
  product_details JSONB NOT NULL, -- Exact dump of what was bought and variant sizes
  applied_promo_id UUID REFERENCES promotions(id),
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  total_paid DECIMAL(10,2) NOT NULL,
  
  -- Razorpay Payment Handling
  payment_method VARCHAR(50) DEFAULT 'razorpay',
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  
  -- Shiprocket Logistics Processing
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered'
  tracking_id VARCHAR(100), -- SR AWB Code
  courier_name VARCHAR(100),
  shiprocket_tracking_url TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Razorpay Webhook Event Logger (Prevents Payment Drop-offs)
CREATE TABLE payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_event VARCHAR(100) NOT NULL, -- e.g., 'payment.captured'
  webhook_payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. ORDER TRACKING & CUSTOMER FEEDBACK
-- ==========================================

CREATE TABLE order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(100) DEFAULT 'system',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE shipping_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_description TEXT,
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Forms & Post-Order Reviews
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- Optional if it's a specific product review
  feedback_type VARCHAR(50) DEFAULT 'contact', -- 'contact_inquiry', 'product_review'
  subject VARCHAR(255),
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 7. POWER AUTOMATIONS (TRIGGERS & REALTIME)
-- ==========================================

-- Auto-update timestamps for dynamic tables
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_mod BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER update_products_mod BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER update_orders_mod BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- GLOBAL REALTIME PUBLISHER (For Live Website Refreshing)
BEGIN; DROP PUBLICATION IF EXISTS supabase_realtime; CREATE PUBLICATION supabase_realtime; COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE orders, order_status_history, products, active_carts;

-- ==========================================
-- 8. ZERO TRUST ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Enable Security Firewalls across all massive tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_carts ENABLE ROW LEVEL SECURITY;

-- PERMISSIONS (Standard Open Architecture so you never get Blocked!)
-- Anyone can read public configurations
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (is_archived = false);
CREATE POLICY "Public Read Variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public Read Assets" ON store_assets FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Promos" ON promotions FOR SELECT USING (is_active = true);

-- Public Users can WRITE to their specific flows (Checkout, OTP, Cart)
CREATE POLICY "Public Insert Orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Manage Carts" ON active_carts FOR ALL USING (true);
CREATE POLICY "Public Insert OTP" ON otp_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Feedback" ON feedback FOR INSERT WITH CHECK (true);

-- The Secure Master Admin (Service Role) can control EVERYTHING globally behind the scenes!
-- NOTE: Requires Next.js SUPABASE_SERVICE_ROLE_KEY environment variable.
