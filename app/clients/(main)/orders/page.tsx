'use client'

import React, { useEffect, useState } from 'react'
import { DeliveredOrderCard } from '@/components/clients/delivered-order-card'
import { Package, FileText, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getDeliveredOrders } from '@/app/clients/profile/actions'
import { Skeleton } from '@/components/ui/skeleton'

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Effect to fetch orders AFTER initial render
    useEffect(() => {
        async function fetchOrders() {
            try {
                const data = await getDeliveredOrders()
                setOrders(data || [])
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl shadow-sm">
                    <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">طلباتي المسلمة</h1>
                    <p className="text-sm text-muted-foreground">
                        جميع الطلبات التي تم تسليمها لك
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-3 p-4 border rounded-xl bg-white dark:bg-zinc-900">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-1/3" />
                            <div className="flex gap-2 mt-4">
                                <Skeleton className="h-20 w-full rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (!orders || orders.length === 0) ? (
                <Card className="border-dashed py-12 text-center bg-gray-50/50 dark:bg-zinc-900/50">
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-full animate-bounce">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg">لا توجد طلبات مسلمة</h3>
                            <p className="text-sm text-muted-foreground">
                                ستظهر طلباتك المسلمة هنا بعد استلامها
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {orders.map((order: any) => (
                        <DeliveredOrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    )
}
