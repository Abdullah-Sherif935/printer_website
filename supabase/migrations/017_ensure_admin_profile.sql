-- Ensure admin profile exists and has correct role
INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', 'System Admin'), 
    'admin',
    NOW(),
    NOW()
FROM auth.users
WHERE email = 'admin@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', updated_at = NOW();
