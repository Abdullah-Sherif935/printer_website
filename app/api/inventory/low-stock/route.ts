import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()

        const { data: items, error } = await supabase
            .from('inventory_items')
            .select('id, name, quantity, low_stock_threshold, type')
            .lt('quantity', supabase.rpc('get_low_stock_threshold', {}))
            .order('quantity', { ascending: true })

        if (error) {
            // Fallback: compare quantity directly with low_stock_threshold
            const { data: fallbackItems, error: fallbackError } = await supabase
                .from('inventory_items')
                .select('id, name, quantity, low_stock_threshold, type')
                .order('quantity', { ascending: true })

            if (fallbackError) throw fallbackError

            // Filter client-side
            const lowStock = (fallbackItems || []).filter(
                item => item.quantity <= item.low_stock_threshold
            )

            return NextResponse.json(lowStock)
        }

        return NextResponse.json(items || [])
    } catch (error) {
        console.error('Error fetching low stock items:', error)
        return NextResponse.json([], { status: 500 })
    }
}
