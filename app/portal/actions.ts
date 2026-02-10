'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Invalid login credentials' }
    }

    revalidatePath('/', 'layout')
    redirect('/portal')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const whatsapp = formData.get('whatsapp') as string

    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) {
        return { error: authError.message }
    }

    if (authData.user) {
        // 2. Create the profile with role 'customer'
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: authData.user.id,
                full_name: fullName,
                phone_number: phone,
                whatsapp_number: whatsapp,
                role: 'customer'
            })

        if (profileError) {
            // In a real app, you might want to rollback auth user here or handle consistency
            console.error('Profile creation failed:', profileError)
            return { error: 'Account created but profile setup failed. Please contact support.' }
        }
    }

    revalidatePath('/', 'layout')
    redirect('/portal')
}
