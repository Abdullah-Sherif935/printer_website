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
            status: 'pending'
        })

    if (error) {
        console.error("Error creating active order:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/active_orders')
    return { success: true }
}

export async function getActiveOrders(status: string = 'pending') {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('active_orders')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching active orders:", error)
        return []
    }

    return data
}

export async function getAllActiveOrders() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('active_orders')
        .select('*')
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching all active orders:", error)
        return []
    }
    return data
}

// ============================================
// Stage 1: Admin clicks "استلام وبدء" 
// pending → processing
// Notification: "تم استلام طلبك وجاري العمل عليه"
// ============================================
import { getSettings } from "@/app/(dashboard)/settings/actions"

// ...

// ============================================
// Stage 1: Admin clicks "استلام وبدء" 
// pending → processing
// Notification: "تم استلام طلبك وجاري العمل عليه"
// ============================================
export async function markActiveOrderProcessing(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('active_orders')
        .update({ status: 'processing' })
        .eq('id', id)

    if (error) {
        console.error("Error processing active order:", error)
        return { success: false, error: error.message }
    }

    // Send notification to customer
    const { data: order } = await supabase
        .from('active_orders')
        .select('user_id, customer_name')
        .eq('id', id)
        .single()

    if (order && order.user_id) {
        const settings = await getSettings()
        const defaultMsg = "مرحباً {customer_name}، تم استلام طلبك وجاري العمل عليه حالياً. سنقوم بإبلاغك فور الانتهاء منه."
        const template = settings.notification_msg_processing || defaultMsg
        const message = template.replace('{customer_name}', order.customer_name || '')

        await supabase.from('notifications').insert({
            user_id: order.user_id,
            title: '📋 تم استلام طلبك',
            message: message,
            is_read: false
        })
    }

    revalidatePath('/active_orders')
    revalidatePath('/portal')
    return { success: true }
}

// ============================================
// Stage 2: Admin clicks "تم انهاء الطلب"
// processing → completed
// Notification: "تم الانتهاء من طلبك ويمكنك استلامه"
// ============================================
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

    // Send notification to customer
    const { data: order } = await supabase
        .from('active_orders')
        .select('user_id, customer_name')
        .eq('id', id)
        .single()

    if (order && order.user_id) {
        const settings = await getSettings()
        const defaultMsg = "مرحباً {customer_name}، تم الانتهاء من طلبك بنجاح! يمكنك استلامه الآن."
        const template = settings.notification_msg_completed || defaultMsg
        const message = template.replace('{customer_name}', order.customer_name || '')

        await supabase.from('notifications').insert({
            user_id: order.user_id,
            title: '✅ طلبك جاهز!',
            message: message,
            is_read: false
        })
    }

    revalidatePath('/active_orders')
    revalidatePath('/portal')
    return { success: true }
}

// ============================================
// Stage 3: Admin clicks "تم التسليم"
// completed → delivered
// Notification: "تم تسليم الطلب بنجاح - شكراً لثقتكم"
// ============================================
export async function markActiveOrderDelivered(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('active_orders')
        .update({ status: 'delivered' })
        .eq('id', id)

    if (error) {
        console.error("Error delivering active order:", error)
        return { success: false, error: error.message }
    }

    // Send notification to customer
    const { data: order } = await supabase
        .from('active_orders')
        .select('user_id, customer_name')
        .eq('id', id)
        .single()

    if (order && order.user_id) {
        const settings = await getSettings()
        const defaultMsg = "مرحباً {customer_name}، تم تسليم طلبك بنجاح. شكراً لثقتكم بنا! نتمنى أن تكون الخدمة قد نالت رضاكم."
        const template = settings.notification_msg_delivered || defaultMsg
        const message = template.replace('{customer_name}', order.customer_name || '')

        await supabase.from('notifications').insert({
            user_id: order.user_id,
            title: '🎉 تم تسليم طلبك',
            message: message,
            is_read: false
        })
    }

    revalidatePath('/active_orders')
    revalidatePath('/portal')
    return { success: true }
}
