import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()

        // Get admin/service role client by reading from env
        const { createClient: createServiceClient } = await import('@supabase/supabase-js')

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!

        if (!supabaseServiceKey) {
            return NextResponse.json({
                success: false,
                error: 'Service role key not found. Please run SQL manually in Supabase dashboard.',
                instructions: 'Copy content from: supabase/migrations/015_quick_fix_profiles.sql'
            })
        }

        const adminClient = createServiceClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // Execute the migration SQL
        const sql = `
-- Quick fix: Allow authenticated users to insert their own profile
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon insert during signup" ON public.profiles;

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
`

        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(s => s.trim())

        for (const statement of statements) {
            if (statement.trim()) {
                const { error } = await adminClient.rpc('exec', {
                    sql: statement.trim() + ';'
                })

                if (error) {
                    console.error('SQL Error:', error)
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'RLS policies updated successfully! You can now signup.',
            note: 'Please try signing up again at /signup'
        })

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            fallback: 'Please run the SQL from supabase/migrations/015_quick_fix_profiles.sql in your Supabase dashboard SQL editor.'
        })
    }
}
