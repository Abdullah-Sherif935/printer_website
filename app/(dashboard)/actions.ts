'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
    const supabase = await createClient()

    // 1. Fetch Orders (Last 6 months for breakdown)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true })

    if (ordersError) {
        console.error("Error fetching orders", ordersError)
        return null
    }

    // 2. Fetch Operational Expenses
    const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', sixMonthsAgo.toISOString())

    if (expensesError) {
        console.error("Error fetching expenses", expensesError)
        return null
    }

    // 3. Overall Stats
    const totalRevenue = orders.reduce((acc, order) => acc + (order.total_amount || 0), 0)
    const totalCOGS = orders.reduce((acc, order) => {
        const orderCost = order.order_items?.reduce((oAcc: number, item: any) => oAcc + (item.cost_calculated || 0), 0) || 0
        return acc + orderCost
    }, 0)
    const totalOpExpenses = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0)
    const activeOrders = orders.filter(o => ['pending', 'processing'].includes(o.status)).length

    // 4. Monthly Revenue vs Expenses (Last 6 months)
    const monthlyDataMap = new Map<string, { revenue: number, costs: number }>()

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const monthName = d.toLocaleString('ar-EG', { month: 'short' })
        monthlyDataMap.set(monthName, { revenue: 0, costs: 0 })
    }

    orders.forEach(order => {
        const monthName = new Date(order.created_at).toLocaleString('ar-EG', { month: 'short' })
        if (monthlyDataMap.has(monthName)) {
            const current = monthlyDataMap.get(monthName)!
            const orderCost = order.order_items?.reduce((oAcc: number, item: any) => oAcc + (item.cost_calculated || 0), 0) || 0
            monthlyDataMap.set(monthName, {
                revenue: current.revenue + (order.total_amount || 0),
                costs: current.costs + orderCost
            })
        }
    })

    expenses.forEach(exp => {
        const monthName = new Date(exp.expense_date).toLocaleString('ar-EG', { month: 'short' })
        if (monthlyDataMap.has(monthName)) {
            const current = monthlyDataMap.get(monthName)!
            monthlyDataMap.set(monthName, {
                ...current,
                costs: current.costs + (exp.amount || 0)
            })
        }
    })

    const monthlyRevenueVsExpenses = Array.from(monthlyDataMap.entries()).map(([name, data]) => ({
        name,
        revenue: data.revenue,
        costs: data.costs,
        profit: data.revenue - data.costs
    }))

    // 5. Revenue Source Breakdown (Pie Chart)
    let printRevenue = 0
    let bindingRevenue = 0
    let otherRevenue = 0

    orders.forEach(order => {
        order.order_items?.forEach((item: any) => {
            if (item.type === 'print') printRevenue += (item.price_sold || 0)
            else if (item.type === 'binding') bindingRevenue += (item.price_sold || 0)
            else otherRevenue += (item.price_sold || 0)
        })
    })

    const sourceBreakdown = [
        { name: 'طباعة', value: printRevenue },
        { name: 'تكعيب', value: bindingRevenue },
        { name: 'خدمات أخرى', value: otherRevenue }
    ].filter(s => s.value > 0)

    // 6. Daily Performance (Current Month)
    const dailyPerformanceMap = new Map<string, number>()
    const startOfMonth = new Date()
    startOfMonth.setDate(1)

    orders.filter(o => new Date(o.created_at) >= startOfMonth).forEach(order => {
        const day = new Date(order.created_at).getDate().toString()
        const current = dailyPerformanceMap.get(day) || 0
        dailyPerformanceMap.set(day, current + (order.total_amount || 0))
    })

    const dailyPerformance = Array.from(dailyPerformanceMap.entries()).map(([day, total]) => ({
        day,
        total
    })).sort((a, b) => parseInt(a.day) - parseInt(b.day))

    // 7. Recent Sales
    const recentSales = await supabase
        .from('orders')
        .select(`*, profiles(full_name), customers(name, phone)`)
        .order('created_at', { ascending: false })
        .limit(5)

    // 8. Low Stock Items (where quantity <= low_stock_threshold)
    const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('id, quantity, low_stock_threshold')

    const lowStockCount = inventoryData?.filter(item =>
        (item.quantity || 0) <= (item.low_stock_threshold || 10)
    ).length || 0

    return {
        totalRevenue,
        grossProfit: totalRevenue - totalCOGS,
        netProfit: totalRevenue - totalCOGS - totalOpExpenses,
        totalOpExpenses,
        activeOrders,
        lowStockCount: lowStockCount || 0,
        monthlyRevenueVsExpenses,
        sourceBreakdown,
        dailyPerformance,
        recentSales: recentSales.data || []
    }
}
