'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function completeProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const phone = formData.get('phone') as string
    const whatsapp = formData.get('whatsapp') as string
    const fullName = formData.get('fullName') as string

    if (!phone || !whatsapp || !fullName) {
        return { error: 'يرجى ملء جميع البيانات المطلوبة' }
    }

    try {
        const adminClient = createAdminClient()

        // 1. Upsert Profile (Update if exists, Create if not)
        const { error: profileError } = await adminClient
            .from('profiles')
            .upsert({
                id: user.id,
                full_name: fullName,
                phone_number: phone,
                whatsapp_number: whatsapp,
                updated_at: new Date().toISOString(),
                role: 'customer' // Default role
            })

        if (profileError) {
            console.error('Profile update/create error:', profileError)
            return { error: 'فشل تحديث البيانات' }
        }

        // 2. Sync to Customers Table
        //Check if customer already exists by email or phone to avoid duplicates if possible
        const { data: existingCustomer } = await adminClient
            .from('customers')
            .select('id')
            .or(`email.eq.${user.email},phone.eq.${phone}`)
            .maybeSingle()

        if (!existingCustomer) {
            const { error: customerError } = await adminClient
                .from('customers')
                .insert({
                    name: fullName,
                    phone: phone, // prioritizing the phone input
                    email: user.email,
                    current_debt: 0
                })

            if (customerError) {
                console.error('Customer sync error:', customerError)
                // We don't block, but it's good to log
            }
        }

    } catch (error) {
        console.error('Complete profile exception:', error)
        return { error: 'حدث خطأ غير متوقع' }
    }

    revalidatePath('/clients')
    redirect('/clients')
}
