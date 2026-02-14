import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
    try {
        const supabase = await createClient()

        // Read the migration file
        const filePath = path.join(process.cwd(), 'supabase/migrations/013_fix_profiles_rls_v2.sql')
        const sql = await fs.readFile(filePath, 'utf8')

        // Execute via RPC
        // Note: This requires a postgres function named 'exec_sql' to be present.
        // If it fails, the user needs to run the SQL manually or create the function.
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

        if (error) {
            console.error('Migration failed:', error)
            return NextResponse.json({
                success: false,
                error: error.message,
                hint: "If function 'exec_sql' does not exist, run the SQL manually in Supabase Dashboard."
            }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Migration applied successfully' })
    } catch (e: any) {
        console.error('Migration error:', e)
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
