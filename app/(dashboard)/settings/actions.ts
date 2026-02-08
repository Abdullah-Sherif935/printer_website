'use server'

import { createClient } from '@/lib/supabase/server'

export type SettingsMap = {
    default_bw_cost: number
    default_color_cost: number
    default_margin_percent: number
}

export async function getSettings() {
    const supabase = await createClient()
    const { data, error } = await supabase.from('settings').select('*')

    if (error) {
        console.error('Error fetching settings:', error)
        return {
            default_bw_cost: 0.5,
            default_color_cost: 2.0,
            default_margin_percent: 20,
        }
    }

    const settings: any = {}
    data.forEach((row) => {
        settings[row.key] = parseFloat(row.value)
    })

    return settings as SettingsMap
}

export async function updateSettings(settings: SettingsMap) {
    const supabase = await createClient()

    // We update each key. Supabase doesn't support bulk upsert easily for key-value pair rows in this structure without loop or specific logic.
    // Since it's few items, we loop.

    const updates = [
        { key: 'default_bw_cost', value: settings.default_bw_cost.toString() },
        { key: 'default_color_cost', value: settings.default_color_cost.toString() },
        { key: 'default_margin_percent', value: settings.default_margin_percent.toString() },
    ]

    for (const update of updates) {
        const { error } = await supabase.from('settings').upsert(update, { onConflict: 'key' })
        if (error) return { success: false, error: error.message }
    }

    return { success: true }
}
