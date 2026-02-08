'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createOrder(data: any) {
    const supabase = await createClient()

    // 1. Get current user (staff)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // 2. Create Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            created_by: user.id,
            status: 'pending',
            total_amount: data.finalPrice,
            paid_amount: 0,
            // payment_method_id: ... (can set default or null for now)
        })
        .select()
        .single()

    if (orderError) return { success: false, error: orderError.message }

    // 3. Create Order Items (We treat the whole print job as one item for now, or split it?)
    // The requirement says: order_items: (type [print, binding], details JSON).
    // We can create one item for "Printing" and one for "Binding" if applicable, or one big item.
    // Let's create one "Print Job" item containing all details.

    const orderItem = {
        order_id: order.id,
        type: 'print',
        details: {
            paper_id: data.paperId,
            binding_id: data.bindingId,
            total_pages: data.totalPages,
            copies: data.copies,
            color_mode: data.colorMode,
            color_pages: data.colorPages,
            bw_pages: data.bwPages,
        },
        quantity: 1, // The job itself is 1 unit (which contains X copies)
        cost_calculated: data.totalCost,
        price_sold: data.finalPrice
    }

    const { error: itemError } = await supabase.from('order_items').insert(orderItem)

    if (itemError) {
        console.error("Error creating order item", itemError)
        // Ideally rollback order, but for now just return error
        return { success: false, error: itemError.message }
    }

    // 4. Update Inventory (Deduct stock) - As per req "When order Completed".
    // User req: "When an Order is Completed... automatically deduct".
    // The order is created as 'pending'. So we do NOT deduct yet.

    revalidatePath('/orders')
    return { success: true }
}

export async function getOrders() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            customers (name),
            profiles (full_name)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching orders:', error)
        return []
    }
    return data
}
