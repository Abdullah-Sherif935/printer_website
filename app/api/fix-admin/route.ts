import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    const supabase = createAdminClient()

    // 1. Get the admin user ID
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
        return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    const adminUser = users.find(u => u.email === 'admin@gmail.com')

    if (!adminUser) {
        return NextResponse.json({ error: 'User admin@gmail.com not found in auth.users' }, { status: 404 })
    }

    // 2. Upsert profile
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: adminUser.id,
            full_name: 'System Admin',
            role: 'admin',
            updated_at: new Date().toISOString()
        })

    if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Admin profile fixed!' })
}
