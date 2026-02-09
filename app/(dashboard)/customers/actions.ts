'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Customer {
    id: string
    name: string
    phone: string | null
    email: string | null
    current_debt: number
    created_at: string
}

export async function getCustomers() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching customers:', error)
        return []
    }
    return data as Customer[]
}

export async function addCustomer(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string

    const { error } = await supabase
        .from('customers')
        .insert({
            name,
            phone: phone || null,
            email: email || null,
            current_debt: 0
        })

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/customers')
    return { success: true }
}

export async function updateDebt(customerId: string, amount: number, operation: 'add' | 'subtract') {
    const supabase = await createClient()

    // Get current debt
    const { data: customer } = await supabase
        .from('customers')
        .select('current_debt')
        .eq('id', customerId)
        .single()

    if (!customer) {
        return { success: false, error: 'Customer not found' }
    }

    const newDebt = operation === 'add'
        ? customer.current_debt + amount
        : customer.current_debt - amount

    const { error } = await supabase
        .from('customers')
        .update({ current_debt: Math.max(0, newDebt) })
        .eq('id', customerId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/customers')
    return { success: true }
}

export async function deleteCustomer(customerId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/customers')
    return { success: true }
}
