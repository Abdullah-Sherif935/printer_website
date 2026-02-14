-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile (already exists, but ensuring coverage)
-- existing: "Users can update own profile" on public.profiles for update using (auth.uid() = id);
