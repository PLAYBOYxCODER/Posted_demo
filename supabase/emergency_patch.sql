-- 1. RECREATE PROFILES TABLE (It was missing!)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone_number VARCHAR(50),
  avatar_url TEXT,
  address TEXT,
  auth_provider VARCHAR(50),
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ENABLE SECURITY ON PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 3. AUTO-CREATE PROFILE ON GOOGLE SIGN UP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, auth_provider)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Guest'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
    'Google OAuth'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. FIX ADMIN ORDERS VISIBILITY
DROP POLICY IF EXISTS "Allow public select orders" ON orders;
CREATE POLICY "Allow public select orders" ON orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public select order history" ON order_status_history;
CREATE POLICY "Allow public select order history" ON order_status_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public select shipping events" ON shipping_events;
CREATE POLICY "Allow public select shipping events" ON shipping_events FOR SELECT USING (true);
