-- The table might have already existed without these columns!
-- Let's FORCE add the missing columns to the table to ensure the database matches exactly what React expects.
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN phone_number VARCHAR(50);
    EXCEPTION WHEN duplicate_column THEN
    END;
    
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN full_name VARCHAR(255);
    EXCEPTION WHEN duplicate_column THEN
    END;

    BEGIN
        ALTER TABLE public.profiles ADD COLUMN email VARCHAR(255);
    EXCEPTION WHEN duplicate_column THEN
    END;

    BEGIN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    EXCEPTION WHEN duplicate_column THEN
    END;

    BEGIN
        ALTER TABLE public.profiles ADD COLUMN address TEXT;
    EXCEPTION WHEN duplicate_column THEN
    END;

    BEGIN
        ALTER TABLE public.profiles ADD COLUMN auth_provider VARCHAR(50);
    EXCEPTION WHEN duplicate_column THEN
    END;

    BEGIN
        ALTER TABLE public.profiles ADD COLUMN is_blocked BOOLEAN DEFAULT false;
    EXCEPTION WHEN duplicate_column THEN
    END;
END $$;

-- This magically forces Supabase APIs to reload instantly so it acknowledges the new columns!
NOTIFY pgrst, 'reload schema';
