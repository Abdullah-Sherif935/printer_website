# حل مشكلة التسجيل - خطوات سريعة ✅

## المشكلة
خطأ "Database error saving new user" عند التسجيل.

## الحل السريع (5 دقائق)

### الطريقة 1: عبر Supabase Dashboard (الأسهل) ⭐

1. **افتح Supabase Dashboard**: https://app.supabase.com
2. **اختر مشروعك**: goyyfwrilfpvefmwlsjm
3. **اذهب إلى SQL Editor** (من القائمة الجانبية)
4. **انسخ و الصق هذا الكود**:

```sql
-- حذف السياسات القديمة
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon insert during signup" ON public.profiles;

-- إنشاء سياسة جديدة تسمح بالتسجيل
CREATE POLICY "Allow insert for new users during signup"
ON public.profiles
FOR INSERT
WITH CHECK (true);

-- السماح للمستخدمين بعرض وتحديث ملفاتهم الشخصية
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

5. **اضغط RUN** (أو Ctrl+Enter)
6. **جرب التسجيل مرة أخرى!**

---

### الطريقة 2: إضافة Service Role Key (للحل الدائم)

إذا أردت حلاً أكثر أماناً:

1. **افتح Supabase Dashboard** → **Settings** → **API**
2. **انسخ "service_role" key** (تحت Project API keys)
3. **أضفه لملف `.env.local`**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://goyyfwrilfpvefmwlsjm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_hCviG7HlVoyqLm8i4eJiiA_IM9shjIj
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # المفتاح من Dashboard
```

4. **أعد تشغيل الخادم**:
```bash
# اضغط Ctrl+C في terminal npm run dev
# ثم شغله مرة أخرى:
npm run dev
```

---

## التحقق من الحل

بعد تطبيق **الطريقة 1**:

1. اذهب إلى: http://localhost:3000/signup
   (أو http://localhost:3000/portal/register إذا كان Portal)
2. سجل مستخدم جديد
3. يجب أن يعمل بدون أخطاء! ✅

---

## ملاحظة هامة ⚠️

**الطريقة 1** تسمح لأي شخص بإنشاء profile (أقل أماناً قليلاً لكن يعمل).
**الطريقة 2** أكثر أماناً لأن الـ service role يُستخدم فقط من السيرفر.

**للاستخدام الإنتاجي، استخدم الطريقة 2.**
**للتطوير السريع والتجربة، استخدم الطريقة 1.**
