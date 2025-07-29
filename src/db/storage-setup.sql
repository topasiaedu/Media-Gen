-- Supabase Storage Setup for ModelArk App
-- Run these commands in your Supabase SQL editor or dashboard

-- ============================================================================
-- STORAGE BUCKET CREATION
-- ============================================================================

-- Create the 'images' bucket for storing generated images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'images',
    'images',
    true, -- Make bucket public so images can be accessed via URL
    52428800, -- 50MB file size limit
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- STORAGE POLICIES (Row Level Security)
-- ============================================================================

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'images' 
        AND auth.role() = 'authenticated'
    );

-- Allow users to view their own uploaded images
CREATE POLICY "Users can view own images" ON storage.objects
    FOR SELECT 
    USING (
        bucket_id = 'images'
        AND (
            auth.uid()::text = (storage.foldername(name))[1]
            OR bucket_id = 'images' -- Allow public access since bucket is public
        )
    );

-- Allow users to update their own images
CREATE POLICY "Users can update own images" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================================================
-- ALTERNATIVE: SIMPLER PUBLIC ACCESS POLICY
-- ============================================================================
-- If you want to make all images in the bucket publicly accessible,
-- you can use this simpler policy instead of the above:

/*
CREATE POLICY "Public access to images" ON storage.objects
    FOR SELECT 
    USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload to images" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete own images" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
*/

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get the public URL for an image
CREATE OR REPLACE FUNCTION public.get_image_public_url(file_path text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    public_url text;
BEGIN
    SELECT 
        CONCAT(
            current_setting('app.settings.supabase_url', true),
            '/storage/v1/object/public/images/',
            file_path
        ) INTO public_url;
    
    RETURN public_url;
END;
$$;

-- Function to clean up orphaned image files
-- (Images in storage that don't have corresponding database records)
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_images()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count integer := 0;
    file_record record;
BEGIN
    -- Find storage objects that don't have corresponding database records
    FOR file_record IN 
        SELECT name 
        FROM storage.objects 
        WHERE bucket_id = 'images'
        AND NOT EXISTS (
            SELECT 1 
            FROM public.images 
            WHERE url LIKE '%' || storage.objects.name || '%'
        )
        AND created_at < NOW() - INTERVAL '1 day' -- Only cleanup files older than 1 day
    LOOP
        -- Delete the orphaned file
        DELETE FROM storage.objects 
        WHERE bucket_id = 'images' AND name = file_record.name;
        
        deleted_count := deleted_count + 1;
    END LOOP;
    
    RETURN deleted_count;
END;
$$;

-- ============================================================================
-- SETUP VERIFICATION
-- ============================================================================

-- Query to verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'images';

-- Query to verify policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'; 