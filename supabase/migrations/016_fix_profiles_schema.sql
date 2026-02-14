-- Fix profiles table constraints and columns for portal users

-- 1. Drop old role constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Add new role constraint that includes 'customer'
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'staff', 'customer', 'user'));

-- 3. Ensure columns exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- 4. Update default role to 'customer' for new users
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'customer';

-- 5. Grant permissions for portal users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.profiles TO anon;
