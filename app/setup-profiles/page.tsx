import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SetupProfilesPage() {
    const supabase = await createClient()

    let result = { success: false, error: '', details: [] as any[] }

    try {
        // Step 1: Drop existing policies
        const dropPolicies = [
            `DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles`,
            `DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles`,
            `DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles`,
            `DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles`,
            `DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles`,
        ]

        for (const sql of dropPolicies) {
            const { error } = await supabase.rpc('exec', { sql })
            result.details.push({ step: 'Drop policies', sql, error: error?.message || 'OK' })
        }

        // Step 2: Create function
        const createFunction = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, created_at)
  VALUES (
    new.id,
    'New User',
    'user',
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;`

        const { error: funcError } = await supabase.rpc('exec', { sql: createFunction })
        result.details.push({ step: 'Create function', error: funcError?.message || 'OK' })

        // Step 3: Drop and create trigger
        const triggerSQL = `
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`

        const { error: triggerError } = await supabase.rpc('exec', { sql: triggerSQL })
        result.details.push({ step: 'Create trigger', error: triggerError?.message || 'OK' })

        // Step 4: Create new policies
        const policies = [
            `CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id)`,
            `CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`,
            `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`,
        ]

        for (const sql of policies) {
            const { error } = await supabase.rpc('exec', { sql })
            result.details.push({ step: 'Create policy', sql, error: error?.message || 'OK' })
        }

        result.success = true

    } catch (error: any) {
        result.error = error.message
    }

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Profile Setup Results</h1>

                {result.success ? (
                    <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded mb-4">
                        ✅ Setup completed successfully
                    </div>
                ) : (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-4">
                        ❌ Setup failed: {result.error}
                    </div>
                )}

                <div className="bg-white shadow rounded p-6">
                    <h2 className="text-xl font-bold mb-4">Execution Details</h2>
                    <div className="space-y-2">
                        {result.details.map((detail, i) => (
                            <div key={i} className="border-b pb-2">
                                <p className="font-semibold">{detail.step}</p>
                                {detail.sql && <code className="text-xs bg-gray-100 p-1 rounded block mt-1">{detail.sql}</code>}
                                <p className="text-sm mt-1">{detail.error}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="mt-6 text-sm text-gray-600">
                    Note: This page attempted to run the migration.
                    If errors occurred, you may need to run the SQL manually through the Supabase dashboard.
                </p>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <h3 className="font-bold mb-2">Manual Migration Required</h3>
                    <p className="text-sm mb-2">
                        Since direct SQL execution may not be available, please run the migration manually:
                    </p>
                    <ol className="list-decimal list-inside text-sm space-y-1">
                        <li>Open Supabase Dashboard</li>
                        <li>Go to SQL Editor</li>
                        <li>Copy content from: <code className="bg-gray-100 px-1">supabase/migrations/014_auto_create_profiles.sql</code></li>
                        <li>Run the SQL</li>
                    </ol>
                </div>
            </div>
        </div>
    )
}
