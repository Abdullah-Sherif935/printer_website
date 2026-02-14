'use server'

import { createClient as createServerClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string || 'New User'

    const supabase = await createServerClient()

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            }
        }
    })

    if (authError) {
        redirect('/signup?error=' + encodeURIComponent(authError.message))
    }

    if (!authData.user) {
        redirect('/signup?error=' + encodeURIComponent('Failed to create user'))
    }

    // Step 2: Create profile using admin client to bypass RLS
    try {
        const adminClient = createAdminClient()

        const { error: profileError } = await adminClient
            .from('profiles')
            .insert({
                id: authData.user.id,
                full_name: fullName,
                role: 'user',
                created_at: new Date().toISOString()
            })

        if (profileError) {
            console.error('Profile creation error:', profileError)
            // Still redirect to login, user can be created manually
            redirect('/login?message=' + encodeURIComponent('Account created but profile setup failed. Please contact admin.'))
        }
    } catch (e) {
        console.error('Profile creation exception:', e)
        redirect('/login?message=' + encodeURIComponent('Account created but profile setup failed. Please contact admin.'))
    }

    if (authData.session) {
        redirect('/?message=' + encodeURIComponent('Account created successfully!'))
    } else {
        redirect('/login?message=' + encodeURIComponent('Account created! Please check your email to confirm.'))
    }
}
