'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type InventoryItem = {
    id: string
    name: string
    type: 'paper' | 'binding' | 'ink' | 'other'
    quantity: number
    cost_per_unit: number
    low_stock_threshold: number
}

export async function getInventory() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching inventory:', error)
        return []
    }

    return data as InventoryItem[]
}

export async function addInventoryItem(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const item = {
        name: formData.get('name') as string,
        type: formData.get('type') as string,
        quantity: parseInt(formData.get('quantity') as string),
        cost_per_unit: parseFloat(formData.get('cost_per_unit') as string),
        low_stock_threshold: parseInt(formData.get('low_stock_threshold') as string),
    }

    const { error } = await supabase.from('inventory_items').insert(item)

    if (error) {
        return { message: error.message }
    }

    revalidatePath('/inventory')
    return { message: 'Item added successfully' }
}

export async function deleteInventoryItem(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('inventory_items').delete().eq('id', id)

    if (error) {
        console.error('Error deleting item:', error)
        return { message: error.message }
    }

    revalidatePath('/inventory')
    return { message: 'Item deleted successfully' }
}
