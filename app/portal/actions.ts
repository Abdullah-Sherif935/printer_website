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

    try {
        // Use admin client to bypass public signup rate limits
        const { createAdminClient } = await import('@/lib/supabase/server')
        const adminClient = createAdminClient()

        // 1. Create user with admin privileges (No Rate Limit)
        const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto confirm so they can login immediately
            user_metadata: { full_name: fullName }
        })

        if (createError) {
            console.error('User creation error:', createError)
            return { error: createError.message }
        }

        if (userData.user) {
            // 2. Profile is auto-created by SQL Trigger, so we just UPDATE it with extra details
            const { error: profileError } = await adminClient
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone_number: phone,
                    whatsapp_number: whatsapp,
                    role: 'customer',
                    updated_at: new Date().toISOString()
                })
                .eq('id', userData.user.id)

            if (profileError) {
                console.error('Profile update error:', profileError)
                // If update fails, user is still created, just log the error
                // We don't delete the user because the account is valid
                return { error: `تم إنشاء الحساب لكن فشل تحديث البيانات الإضافية: ${profileError.message}` }
            }

            // 2.5 Sync to Customers Table immediately
            if (fullName) {
                const { error: customerError } = await adminClient
                    .from('customers')
                    .insert({
                        name: fullName,
                        phone: phone || whatsapp || null,
                        email: email,
                        current_debt: 0
                    })

                if (customerError) {
                    console.error('Failed to sync new user to customers table:', customerError)
                    // We don't block signup for this, just log it
                }
            }

            // 3. Auto Login the user
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (loginError) {
                return { error: 'تم إنشاء الحساب بنجاح، لكن فشل تسجيل الدخول التلقائي. يرجى تسجيل الدخول.' }
            }
        }

    } catch (e: any) {
        console.error('Signup exception:', e)
        return { error: 'حدث خطأ غير متوقع أثناء التسجيل.' }
    }

    revalidatePath('/', 'layout')
    redirect('/portal')
}

export async function submitOrder(data: {
    notes: string,
    files: string[],
    customerName?: string,
    whatsapp?: string,
    items?: any[],
    deliveryMethod?: 'pickup' | 'delivery',
    deliveryAddress?: string,
    deliveryLat?: number,
    deliveryLng?: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Fetch user profile for contact info if not provided
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Use provided items or default if missing (fallback)
    // Use provided items or default if missing (fallback)
    const orderItems = data.items && data.items.length > 0 ? data.items : [{
        detail: 'طلب طباعة أونلاين',
        quantity: 1,
        paperCount: 0
    }]

    // Validate delivery details and append to notes if columns might be missing
    // NOTE: This is a fallback until migration 020 is fully applied to DB
    let finalNotes = data.notes || ''
    if (data.deliveryMethod === 'delivery') {
        finalNotes += `\n\n-- تفاصيل التوصيل --\nالعنوان: ${data.deliveryAddress || 'غير محدد'}`
        if (data.deliveryLat && data.deliveryLng) {
            finalNotes += `\nالموقع: https://maps.google.com/?q=${data.deliveryLat},${data.deliveryLng}`
        }
    } else {
        finalNotes += `\n\n-- طريقة الاستلام: استلام من المحل --`
    }

    // Create the order
    // We append delivery info to notes to ensure successful submission even if DB columns are missing

    const customerName = profile?.full_name || data.customerName || 'Online User'
    const customerPhone = profile?.whatsapp_number || profile?.phone_number || data.whatsapp

    // Sync Online User to Customers Table (for POS visibility)
    if (customerName && customerName !== 'Online User') {
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('name', customerName)
            .single()

        if (!existingCustomer) {
            await supabase.from('customers').insert({
                name: customerName,
                phone: customerPhone || null,
                email: user.email || null,
                current_debt: 0
            })
        }
    }

    const { error } = await supabase
        .from('active_orders')
        .insert({
            user_id: user.id,
            customer_name: customerName,
            customer_phone: customerPhone,
            status: 'pending',
            order_source: 'online',
            file_urls: data.files,
            notes: finalNotes,
            items: orderItems
            // We temporarily removed direct column insertion for delivery to prevent failures
            // delivery_method: data.deliveryMethod || 'pickup',
            // delivery_address: data.deliveryAddress, ...
        })

    if (error) {
        console.error('Order submission error:', error)
        return { error: 'Failed to submit order' }
    }

    revalidatePath('/portal')
    return { success: true }
}

export async function deleteOrder(orderId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // 1. Verify order exists and belongs to user and is pending
    const { data: order, error: fetchError } = await supabase
        .from('active_orders')
        .select('status, file_urls')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single()

    if (fetchError || !order) {
        return { error: 'Order not found' }
    }

    if (order.status !== 'pending') {
        return { error: 'لا يمكن حذف الطلب لأنه قيد التنفيذ أو تم الانتهاء منه' }
    }

    // 2. Delete files from storage (Optional but good for cleanup)
    if (order.file_urls && order.file_urls.length > 0) {
        // Extract filenames from URLs involves some parsing, skipping for now for speed
        // or we can implement a storage cleanup trigger later.
    }

    // 3. Delete the order
    const { error: deleteError } = await supabase
        .from('active_orders')
        .delete()
        .eq('id', orderId)

    if (deleteError) {
        return { error: 'Failed to delete order' }
    }

    revalidatePath('/portal')
    return { success: true }
}
