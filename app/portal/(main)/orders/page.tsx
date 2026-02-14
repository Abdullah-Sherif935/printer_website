import { getDeliveredOrders } from '@/app/portal/profile/actions'
import { DeliveredOrderCard } from '@/components/portal/delivered-order-card'
import { Package, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
    const orders = await getDeliveredOrders()

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">طلباتي المسلمة</h1>
                    <p className="text-sm text-muted-foreground">
                        جميع الطلبات التي تم تسليمها لك
                    </p>
                </div>
            </div>

            {(!orders || orders.length === 0) ? (
                <Card className="border-dashed py-12 text-center bg-gray-50/50 dark:bg-zinc-900/50">
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-full">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg">لا توجد طلبات مسلمة</h3>
                            <p className="text-sm text-muted-foreground">
                                ستظهر طلباتك المسلمة here بعد استلامها
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
