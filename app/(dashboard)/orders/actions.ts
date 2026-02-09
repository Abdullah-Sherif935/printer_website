'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createOrder(data: any) {
    const supabase = await createClient()

    // 1. Get current user (staff)
    const { data: { user } } = await supabase.auth.getUser()

    console.log('Current user:', user)

    // Make created_by optional - set to null if no user
    // 2. Create Order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            created_by: user?.id || null,
            status: 'pending',
            total_amount: data.finalPrice,
            paid_amount: 0,
            // payment_method_id: ... (can set default or null for now)
        })
        .select()
        .single()

    if (orderError) {
        console.error('Order creation error:', orderError)
        return { success: false, error: orderError.message }
    }

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

export async function completeOrder(orderId: string) {
    const supabase = await createClient()

    // 1. Get order details
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
            *,
            order_items (*)
        `)
        .eq('id', orderId)
        .single()

    if (orderError || !order) {
        return { success: false, error: 'Order not found' }
    }

    // 2. Deduct inventory for each item
    for (const item of order.order_items) {
        if (item.type === 'print' && item.details) {
            const { paper_id, total_pages, copies } = item.details
            const totalPaperUsed = total_pages * copies

            // Deduct paper from inventory
            if (paper_id) {
                const { data: paper } = await supabase
                    .from('inventory_items')
                    .select('quantity')
                    .eq('id', paper_id)
                    .single()

                if (paper) {
                    await supabase
                        .from('inventory_items')
                        .update({ quantity: Math.max(0, paper.quantity - totalPaperUsed) })
                        .eq('id', paper_id)
                }
            }

            // Deduct binding if applicable
            if (item.details.binding_id) {
                const { data: binding } = await supabase
                    .from('inventory_items')
                    .select('quantity')
                    .eq('id', item.details.binding_id)
                    .single()

                if (binding) {
                    await supabase
                        .from('inventory_items')
                        .update({ quantity: Math.max(0, binding.quantity - copies) })
                        .eq('id', item.details.binding_id)
                }
            }
        }
    }

    // 3. Update order status to completed
    const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    revalidatePath('/orders')
    revalidatePath('/inventory')
    return { success: true }
}
