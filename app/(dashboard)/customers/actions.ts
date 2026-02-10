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

export async function quickAddCustomer(data: { name: string, phone?: string }) {
    const supabase = await createClient()

    const { data: customer, error } = await supabase
        .from('customers')
        .insert({
            name: data.name,
            phone: data.phone || null,
            current_debt: 0
        })
        .select()
        .single()

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/customers')
    return { success: true, customer: customer as Customer }
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

    const currentDebt = customer.current_debt || 0
    const newDebt = operation === 'add'
        ? currentDebt + amount
        : currentDebt - amount

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

export async function setDebt(customerId: string, amount: number) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('customers')
        .update({ current_debt: Math.max(0, amount) })
        .eq('id', customerId)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/customers')
    return { success: true }
}

export async function deleteCustomer(customerId: string) {
    const supabase = await createClient()

    // 1. First, null out references in orders to avoid FK violation
    const { error: updateError } = await supabase
        .from('orders')
        .update({ customer_id: null })
        .eq('customer_id', customerId)

    if (updateError) {
        console.error('Error nulling customer orders:', updateError)
        // We continue anyway, as there might be no orders
    }

    // 2. Now delete the customer
    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

    if (error) {
        console.error('Customer deletion error details:', error)
        return { success: false, error: `${error.message} (${error.code})` }
    }

    revalidatePath('/customers')
    return { success: true }
}
