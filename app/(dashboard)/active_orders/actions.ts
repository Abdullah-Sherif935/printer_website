'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createActiveOrder(data: any) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('active_orders')
        .insert({
            customer_name: data.customer_name,
            customer_phone: data.customer_phone,
            items: data.items,
            notes: data.notes,
            status: 'pending' // Default status
        })

    if (error) {
        console.error("Error creating active order:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/active_orders')
    return { success: true }
}

export async function getActiveOrders(status: 'pending' | 'completed' = 'pending') {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('active_orders')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false }) // Keep created_at for simplicity

    if (error) {
        console.error("Error fetching active orders:", error)
        return []
    }

    return data
}

export async function markActiveOrderCompleted(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('active_orders')
        .update({ status: 'completed' })
        .eq('id', id)

    if (error) {
        console.error("Error completing active order:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/active_orders')
    return { success: true }
}
