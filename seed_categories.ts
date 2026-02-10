
import { createClient } from './lib/supabase/server'

async function seed() {
    const supabase = await createClient()
    const categories = [
        { name: 'إيجار' },
        { name: 'كهرباء' },
        { name: 'صيانة' },
        { name: 'عمالة' },
        { name: 'خامات مصرفية' },
        { name: 'أخرى' }
    ]

    for (const cat of categories) {
        const { error } = await supabase.from('expense_categories').upsert(cat, { onConflict: 'name' })
        if (error) console.error(`Error seeding ${cat.name}:`, error.message)
        else console.log(`Seeded ${cat.name}`)
    }
}

seed()
