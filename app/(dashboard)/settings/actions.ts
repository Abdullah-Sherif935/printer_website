'use server'

import { createClient } from '@/lib/supabase/server'

export type SettingsMap = {
    default_bw_cost: number
    default_color_cost: number
    default_margin_percent: number
    bw_single_price: number
    bw_double_price: number
    color_single_price: number
    color_double_price: number
    binding_small_cost: number
    binding_large_cost: number
    binding_threshold: number
    whatsapp_msg_processing?: string
    whatsapp_msg_completed?: string
    notification_msg_processing?: string
    notification_msg_completed?: string
    notification_msg_delivered?: string
}

export async function getSettings() {
    const supabase = await createClient()
    const { data, error } = await supabase.from('settings').select('*')

    const defaults = {
        default_bw_cost: 0.15,
        default_color_cost: 1.5,
        default_margin_percent: 40,
        bw_single_price: 1.0,
        bw_double_price: 1.25,
        color_single_price: 1.5,
        color_double_price: 2.0,
        binding_small_cost: 15.0,
        binding_large_cost: 20.0,
        binding_threshold: 100,
        whatsapp_msg_processing: "مرحباً {customer_name}، تم استلام طلبك وجاري العمل عليه. سنبلغك فور الانتهاء!",
        whatsapp_msg_completed: "مرحباً {customer_name}، تم الانتهاء من طلبك. يمكنك استلامه الآن!",
        notification_msg_processing: "مرحباً {customer_name}، تم استلام طلبك وجاري العمل عليه حالياً. سنقوم بإبلاغك فور الانتهاء منه.",
        notification_msg_completed: "مرحباً {customer_name}، تم الانتهاء من طلبك بنجاح! يمكنك استلامه الآن.",
        notification_msg_delivered: "مرحباً {customer_name}، تم تسليم طلبك بنجاح. شكراً لثقتكم بنا! نتمنى أن تكون الخدمة قد نالت رضاكم.",
    }

    if (error || !data) {
        console.error('Error fetching settings:', error)
        return defaults
    }

    const settings: any = {}
    data.forEach((row) => {
        // Check if value is a number-like string for numeric fields
        // For text fields (starting with whatsapp_ or notification_), keep as string
        if (row.key.startsWith('whatsapp_') || row.key.startsWith('notification_')) {
            settings[row.key] = row.value
        } else {
            settings[row.key] = parseFloat(row.value)
        }
    })

    return { ...defaults, ...settings } as SettingsMap
}

export async function updateSettings(settings: SettingsMap) {
    const supabase = await createClient()

    const updates = [
        { key: 'default_bw_cost', value: (settings.default_bw_cost || 0).toString() },
        { key: 'default_color_cost', value: (settings.default_color_cost || 0).toString() },
        { key: 'default_margin_percent', value: (settings.default_margin_percent || 0).toString() },

        { key: 'bw_single_price', value: (settings.bw_single_price || 0).toString() },
        { key: 'bw_double_price', value: (settings.bw_double_price || 0).toString() },
        { key: 'color_single_price', value: (settings.color_single_price || 0).toString() },
        { key: 'color_double_price', value: (settings.color_double_price || 0).toString() },

        { key: 'binding_small_cost', value: (settings.binding_small_cost || 0).toString() },
        { key: 'binding_large_cost', value: (settings.binding_large_cost || 0).toString() },
        { key: 'binding_threshold', value: (settings.binding_threshold || 0).toString() },

        { key: 'whatsapp_msg_processing', value: settings.whatsapp_msg_processing || '' },
        { key: 'whatsapp_msg_completed', value: settings.whatsapp_msg_completed || '' },

        { key: 'notification_msg_processing', value: settings.notification_msg_processing || '' },
        { key: 'notification_msg_completed', value: settings.notification_msg_completed || '' },
        { key: 'notification_msg_delivered', value: settings.notification_msg_delivered || '' },
    ]

    for (const update of updates) {
        const { error } = await supabase.from('settings').upsert(update, { onConflict: 'key' })
        if (error) return { success: false, error: error.message }
    }

    return { success: true }
}
