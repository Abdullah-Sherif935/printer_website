'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ============================================
// Profile Management Actions
// ============================================

export async function updateProfile(data: {
    full_name?: string
    phone_number?: string
    whatsapp_number?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: data.full_name,
            phone_number: data.phone_number,
            whatsapp_number: data.whatsapp_number,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        return { error: 'فشل تحديث البيانات' }
    }

    // Sync changes to Customers table if name matches (or by some other logic)
    // Here we assume name is unique or we just update by matching on a potentially non-unique field which is risky,
    // but since we don't have a direct FK link to 'customers' table from auth id easily without query...
    // Better approach: Check if a customer exists with the OLD name (we don't have it easily here) or just insert/update based on name.

    // Actually, we should probably try to update the customer record if it exists with this name
    // OR create a new one if it doesn't. 
    // Since we don't store supabase_user_id in customers table (we should have!), we can only do best effort match on name.

    if (data.full_name) {
        // Try to update customer phone if name matches
        const { error: customerError } = await supabase
            .from('customers')
            .update({
                phone: data.whatsapp_number || data.phone_number,
                // We could also update email if we had it
            })
            .eq('name', data.full_name)

        if (customerError) {
            console.error('Error syncing to customers table:', customerError)
        }
    }

    revalidatePath('/clients/profile')
    revalidatePath('/clients')
    return { success: true }
}

export async function getProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return profile
}

// ============================================
// Reviews Actions
// ============================================

export async function createReview(data: {
    order_id: string
    rating: number
    comment?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Verify order belongs to user and is delivered
    const { data: order } = await supabase
        .from('active_orders')
        .select('status, user_id')
        .eq('id', data.order_id)
        .single()

    if (!order || order.user_id !== user.id) {
        return { error: 'طلب غير موجود' }
    }

    if (order.status !== 'delivered') {
        return { error: 'يمكنك التقييم فقط بعد استلام الطلب' }
    }

    const { error } = await supabase
        .from('reviews')
        .insert({
            user_id: user.id,
            order_id: data.order_id,
            rating: data.rating,
            comment: data.comment
        })

    if (error) {
        console.error('Error creating review:', error)
        if (error.code === '23505') { // Unique violation
            return { error: 'تم تقييم هذا الطلب مسبقاً' }
        }
        return { error: 'فشل إضافة التقييم' }
    }

    revalidatePath('/clients/orders')
    revalidatePath('/')
    return { success: true }
}

export async function getReviews() {
    const supabase = await createClient()

    const { data: reviews } = await supabase
        .from('reviews')
        .select(`
            *,
            profiles!inner(full_name)
        `)
        .order('created_at', { ascending: false })

    return reviews || []
}

export async function deleteReview(reviewId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Check if user is admin or review owner
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const { data: review } = await supabase
        .from('reviews')
        .select('user_id')
        .eq('id', reviewId)
        .single()

    if (!review) return { error: 'التقييم غير موجود' }

    // Allow deletion if admin or owner
    if (profile?.role !== 'admin' && review.user_id !== user.id) {
        return { error: 'غير مصرح' }
    }

    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

    if (error) {
        console.error('Error deleting review:', error)
        return { error: 'فشل حذف التقييم' }
    }

    revalidatePath('/clients/orders')
    revalidatePath('/')
    return { success: true }
}

// ============================================
// Orders Actions (for delivered orders page)
// ============================================

export async function getDeliveredOrders() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: orders } = await supabase
        .from('active_orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'delivered')
        .order('created_at', { ascending: false })

    return orders || []
}
