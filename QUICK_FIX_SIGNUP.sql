-- ========================================
-- حل سريع لمشكلة التسجيل
-- Quick Fix for Signup Issue
-- ========================================
-- 
-- انسخ هذا الكود كاملاً والصقه في Supabase SQL Editor
-- Copy this entire code and paste it in Supabase SQL Editor
--
-- الخطوات / Steps:
-- 1. افتح https://app.supabase.com
-- 2. اختر مشروعك / Select your project
-- 3. SQL Editor من القائمة / SQL Editor from menu
-- 4. الصق الكود / Paste this code
-- 5. Run (Ctrl+Enter)
-- ========================================

-- حذف جميع السياسات القديمة
-- Drop all old policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon insert during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- إنشاء سياسات جديدة مبسطة
-- Create new simplified policies

-- 1. السماح بإنشاء profile جديد (مطلوب للتسجيل)
-- Allow creating new profiles (required for signup)
CREATE POLICY "Allow insert for signup"
ON public.profiles
FOR INSERT
WITH CHECK (true);

-- 2. السماح بعرض الملف الشخصي للمستخدم
-- Allow users to view their own profile
CREATE POLICY "Allow select own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id OR auth.role() = 'service_role');

-- 3. السماح بتحديث الملف الشخصي
-- Allow users to update their own profile  
CREATE POLICY "Allow update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. السماح بحذف الملف (للمسؤول فقط)
-- Allow delete for service role only
CREATE POLICY "Allow delete for service role"
ON public.profiles
FOR DELETE
USING (auth.role() = 'service_role');

-- التأكد من تفعيل RLS
-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- منح الصلاحيات
-- Grant permissions
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.profiles TO anon;

-- ========================================
-- تم! الآن جرب التسجيل مرة أخرى
-- Done! Now try signing up again
-- ========================================
