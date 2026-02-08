'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
    const supabase = await createClient()

    // 1. Fetch Orders (Last 30 days or all for simplicity?)
    // Let's fetch all orders for now to aggregates
    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

    if (ordersError) {
        console.error("Error fetching orders", ordersError)
        return null
    }

    // 2. Calculate Revenue
    const totalRevenue = orders.reduce((acc, order) => acc + (order.total_amount || 0), 0)

    // 3. Active Orders
    const activeOrders = orders.filter(o => ['pending', 'processing'].includes(o.status)).length

    // 4. Calculate Monthly Revenue (Last 6 months)
    const monthlyRevenueMap = new Map<string, number>()
    orders.forEach(order => {
        const date = new Date(order.created_at)
        const key = `${date.getFullYear()}-${date.getMonth()}` // simplistic key
        const monthName = date.toLocaleString('default', { month: 'short' })

        const current = monthlyRevenueMap.get(monthName) || 0
        monthlyRevenueMap.set(monthName, current + (order.total_amount || 0))
    })

    // Formatting for Recharts
    const monthlyRevenue = Array.from(monthlyRevenueMap.entries()).map(([name, total]) => ({
        name,
        total
    })).reverse().slice(0, 12).reverse() // Show last 12 months? Sorting by date would be better

    // 5. Recent Sales
    const recentSales = await supabase
        .from('orders')
        .select(`*, profiles(full_name), customers(name, phone)`)
        .order('created_at', { ascending: false })
        .limit(5)

    // 6. Low Stock Count
    const { count: lowStockCount } = await supabase
        .from('inventory_items')
        .select('*', { count: 'exact', head: true })
        .lt('quantity', 10) // Simplified logic, ideally compare with low_stock_threshold col

    return {
        totalRevenue,
        activeOrders,
        lowStockCount: lowStockCount || 0,
        monthlyRevenue,
        recentSales: recentSales.data || []
    }
}
