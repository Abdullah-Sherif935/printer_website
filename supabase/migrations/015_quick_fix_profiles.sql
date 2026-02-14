-- Quick fix: Allow authenticated users to insert their own profile
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Simple policy: authenticated users can insert their own profile
CREATE POLICY "Allow users to insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Also allow anonymous inserts temporarily for testing
CREATE POLICY "Allow anon insert during signup"
ON public.profiles
FOR INSERT
TO anon
WITH CHECK (true);
