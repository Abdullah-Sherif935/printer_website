'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createOrder(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    console.log('Creating order/sale with data:', data)

    // Create Order
    const insertData: any = {
        customer_id: data.customerId || null,
        created_by: user?.id || null,
        status: data.status || 'pending',
        total_amount: data.finalPrice,
        paid_amount: data.paidAmount !== undefined ? data.paidAmount : (data.status === 'completed' ? data.finalPrice : 0),
    }

    let { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(insertData)
        .select()
        .single()

    // Fallback if created_by failed (foreign key violation)
    if (orderError && orderError.code === '23503' && orderError.message.includes('created_by')) {
        console.warn('Falling back to null created_by due to FK violation')
        insertData.created_by = null
        const retry = await supabase
            .from('orders')
            .insert(insertData)
            .select()
            .single()
        order = retry.data
        orderError = retry.error
    }

    if (orderError) {
        console.error('Order creation error after potential fallback:', orderError)
        return { success: false, error: orderError.message }
    }

    // Create Order Items
    const orderItems = data.items.map((item: any) => ({
        order_id: order.id,
        type: 'print',
        details: {
            paper_id: item.paperId,
            total_pages: item.totalPages,
            copies: item.copies,
            color_mode: item.colorMode,
            color_pages: item.colorPages,
            bw_pages: item.bwPages,
            use_binding: item.useBinding,
            coil_id: item.coilId
        },
        quantity: item.copies,
        cost_calculated: item.costCalculated || 0,
        price_sold: item.priceSold || 0
    }))

    // Add binding if selected
    if (data.items.some((i: any) => i.useBinding)) {
        // Find binding entries or just handle generic binding deduction
        // For now, the calculator logic assumes binding is handled.
        // We might need to map coil sizes to inventory IDs later.
    }

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
        console.error('Order items creation error:', itemsError)
        return { success: false, error: itemsError.message }
    }

    // NEW: If status is 'completed' or 'partial_payment' (Sale recording), deduct inventory immediately
    if (data.status === 'completed' || data.status === 'partial_payment') {
        for (const item of orderItems) {
            if (item.type === 'print' && item.details.paper_id) {
                const totalPaperUsed = item.details.total_pages * item.details.copies

                // Get current quantity
                const { data: currentItem } = await supabase
                    .from('inventory_items')
                    .select('quantity')
                    .eq('id', item.details.paper_id)
                    .single()

                if (currentItem) {
                    await supabase
                        .from('inventory_items')
                        .update({ quantity: Math.max(0, currentItem.quantity - totalPaperUsed) })
                        .eq('id', item.details.paper_id)
                }
            }
            // Handle binding if applicable
            if (item.details.use_binding && item.details.coil_id) {
                // 1. Deduct Coil
                const { data: currentCoil } = await supabase
                    .from('inventory_items')
                    .select('quantity')
                    .eq('id', item.details.coil_id)
                    .single()

                if (currentCoil) {
                    await supabase
                        .from('inventory_items')
                        .update({ quantity: Math.max(0, currentCoil.quantity - item.quantity) })
                        .eq('id', item.details.coil_id)
                }

                // 2. Deduct 1 Transparent Cover & 1 Opaque Cover per unit
                // We find them by name as they are standard items
                const { data: covers } = await supabase
                    .from('inventory_items')
                    .select('id, name, quantity')
                    .in('name', ['غلاف شفاف', 'غلاف معتم'])

                if (covers && covers.length > 0) {
                    for (const cover of covers) {
                        await supabase
                            .from('inventory_items')
                            .update({ quantity: Math.max(0, cover.quantity - item.quantity) })
                            .eq('id', cover.id)
                    }
                }
            }
        }
    }

    // NEW: Update customer debt if there is a remaining balance
    if (order.customer_id && (order.total_amount - order.paid_amount) > 0) {
        const remaining = order.total_amount - order.paid_amount
        const { data: customer } = await supabase
            .from('customers')
            .select('current_debt')
            .eq('id', order.customer_id)
            .single()

        if (customer) {
            await supabase
                .from('customers')
                .update({ current_debt: (customer.current_debt || 0) + remaining })
                .eq('id', order.customer_id)
        }
    }

    console.log('Order/Sale created successfully:', order.id)
    revalidatePath('/orders')
    revalidatePath('/') // Revalidate dashboard for profit totals
    return { success: true, orderId: order.id }
}

export async function getOrders() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('orders')
        .select('*, customers(name), order_items(*)')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching orders:', error)
        return []
    }

    return data || []
}

export async function completeOrder(orderId: string) {
    const supabase = await createClient()

    // 1. Update order status
    const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    // 2. Get order items to deduct inventory
    const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)

    if (itemsError || !items) {
        return { success: false, error: 'Failed to fetch order items' }
    }

    // 3. Deduct inventory
    for (const item of items) {
        if (item.type === 'print' && item.details.paper_id) {
            const totalPaperUsed = item.details.total_pages * item.details.copies

            const { data: currentItem } = await supabase
                .from('inventory_items')
                .select('quantity')
                .eq('id', item.details.paper_id)
                .single()

            if (currentItem) {
                await supabase
                    .from('inventory_items')
                    .update({ quantity: Math.max(0, currentItem.quantity - totalPaperUsed) })
                    .eq('id', item.details.paper_id)
            }

            // Also check for binding within print item
            if (item.details.use_binding && item.details.coil_id) {
                // Deduct Coil
                const { data: currentCoil } = await supabase
                    .from('inventory_items')
                    .select('quantity')
                    .eq('id', item.details.coil_id)
                    .single()

                if (currentCoil) {
                    await supabase
                        .from('inventory_items')
                        .update({ quantity: Math.max(0, currentCoil.quantity - item.quantity) })
                        .eq('id', item.details.coil_id)
                }

                // Deduct Covers
                const { data: covers } = await supabase
                    .from('inventory_items')
                    .select('id, name, quantity')
                    .in('name', ['غلاف شفاف', 'غلاف معتم'])

                if (covers && covers.length > 0) {
                    for (const cover of covers) {
                        await supabase
                            .from('inventory_items')
                            .update({ quantity: Math.max(0, cover.quantity - item.quantity) })
                            .eq('id', cover.id)
                    }
                }
            }
        }

        if (item.type === 'binding' && item.details.binding_id) {
            const { data: currentBinding } = await supabase
                .from('inventory_items')
                .select('quantity')
                .eq('id', item.details.binding_id)
                .single()

            if (currentBinding) {
                await supabase
                    .from('inventory_items')
                    .update({ quantity: Math.max(0, currentBinding.quantity - item.quantity) })
                    .eq('id', item.details.binding_id)
            }
        }
    }

    revalidatePath('/orders')
    revalidatePath('/')
    return { success: true }
}

export async function updateOrderPayment(orderId: string, paidAmount: number, status?: string) {
    const supabase = await createClient()

    // Get order to see current status
    const { data: order } = await supabase.from('orders').select('total_amount, paid_amount, status, customer_id').eq('id', orderId).single()

    if (!order) return { success: false, error: 'Order not found' }

    let newStatus = status || order.status
    if (paidAmount >= order.total_amount) {
        newStatus = 'completed'
    } else {
        newStatus = 'partial_payment'
    }

    const { error } = await supabase
        .from('orders')
        .update({
            paid_amount: paidAmount,
            status: newStatus
        })
        .eq('id', orderId)

    if (error) return { success: false, error: error.message }

    // Update customer debt if payment changed
    const paymentChange = paidAmount - order.paid_amount
    if (order.customer_id && paymentChange !== 0) {
        const { data: customer } = await supabase
            .from('customers')
            .select('current_debt')
            .eq('id', order.customer_id)
            .single()

        if (customer) {
            // Subtract the extra paid amount from the debt
            await supabase
                .from('customers')
                .update({ current_debt: Math.max(0, (customer.current_debt || 0) - paymentChange) })
                .eq('id', order.customer_id)
        }
    }

    revalidatePath('/orders')
    revalidatePath('/')
    return { success: true }
}

