-- Create storage bucket 'order-files'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('order-files', 'order-files', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'order-files');

-- Policy: Authenticated users can view their own files (or all public files since it's public bucket)
-- Since bucket is public, anyone with URL can read. 
-- If we want privacy, we'd set public=false and use signed URLs.
-- For now, public is easier for the "Admin downloading" requirement without generating tokens constantly.
-- But let's add a policy anyway for standard access.
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'order-files');
