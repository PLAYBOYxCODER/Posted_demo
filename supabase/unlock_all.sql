-- 1. UNLOCK ALL STORAGE UPLOADS FOR THE BUCKET
-- This allows anyone to upload, update, and delete images in your poster_store_media bucket!
INSERT INTO storage.buckets (id, name, public) VALUES ('poster_store_media', 'poster_store_media', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'poster_store_media');

DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
CREATE POLICY "Allow public updates" ON storage.objects FOR UPDATE USING (bucket_id = 'poster_store_media');

DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
CREATE POLICY "Allow public reads" ON storage.objects FOR SELECT USING (bucket_id = 'poster_store_media');

DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
CREATE POLICY "Allow public deletes" ON storage.objects FOR DELETE USING (bucket_id = 'poster_store_media');

-- 2. COMPLETELY UNLOCK THE PROFILES TABLE
-- We are granting universal access to ensure your Address completely saves without any blockages!
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Universal Profile Access" ON profiles;

CREATE POLICY "Universal Profile Access" ON profiles FOR ALL USING (true) WITH CHECK (true);
